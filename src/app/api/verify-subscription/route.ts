import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@supabase/supabase-js";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic = process.env.BUILD_TARGET === "capacitor" ? "auto" : "force-dynamic";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

/* ─────────────────────────────────────────────────────────────────
   POST /api/verify-subscription
   Body: { email: string }
   Returns: { isPro: boolean, status: string, plan: string|null }

   Checks Supabase for an active subscription by email.
   Called by the scan page on mount (result cached 60 min in localStorage).
   Never exposes the service-role key to the client.
───────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* ── Rate limit: 30 checks/hour per IP ── */
  const ip     = getClientIp(req);
  const { allowed, retryAfterSec } = checkRateLimit(`verify:${ip}`, 30);
  if (!allowed) return rateLimitResponse(retryAfterSec);

  let email: string;
  try {
    const body = await req.json() as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS });
  }

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400, headers: CORS });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: user, error } = await supabase
      .from("users")
      .select("subscription_status, subscription_plan, trial_ends_at, current_period_end")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      /* Email not found → not a subscriber */
      return NextResponse.json(
        { isPro: false, status: "free", plan: null },
        { headers: CORS },
      );
    }

    const status = user.subscription_status as string;
    const isPro  = status === "active" || status === "trial";

    /* Extra check: if trial — confirm it hasn't expired */
    let effectiveIsPro = isPro;
    if (status === "trial" && user.trial_ends_at) {
      effectiveIsPro = new Date(user.trial_ends_at) > new Date();
    }

    return NextResponse.json(
      {
        isPro:             effectiveIsPro,
        status:            effectiveIsPro ? status : "expired",
        plan:              user.subscription_plan ?? null,
        currentPeriodEnd:  user.current_period_end ?? null,
      },
      { headers: CORS },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("[verify-subscription]", msg);
    /* On DB error, return unknown — client falls back to localStorage */
    return NextResponse.json(
      { isPro: null, status: "unknown", error: "Server error" },
      { status: 500, headers: CORS },
    );
  }
}
