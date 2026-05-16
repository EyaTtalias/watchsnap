import { NextRequest, NextResponse } from "next/server";
import { createCheckoutUrl } from "@/lib/lemonsqueezy";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";

export const dynamic =
  process.env.BUILD_TARGET === "capacitor" ? "auto" : "force-dynamic";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

/* ─────────────────────────────────────────────────────────────────
   POST /api/checkout
   Body: { plan: "monthly" | "annual", email?: string }
   Returns: { url: string }  — hosted LemonSqueezy checkout URL

   Rate limit: 5 requests / hour per IP
   If email provided, it is:
     1. Pre-filled in the LS checkout form
     2. Appended to the success redirect URL so we can cache it
        in localStorage and verify the subscription later
───────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  /* ── Rate limit: 5 checkout attempts / hour per IP ── */
  const ip = getClientIp(req);
  const rl = checkRateLimit(`checkout:${ip}`, 5);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterSec);

  try {
    const body  = await req.json() as { plan?: string; email?: string };
    const plan  = body.plan === "annual" ? "annual" : "monthly";
    const email = body.email?.trim().toLowerCase() || undefined;

    const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? "https://watchsnap.vercel.app";
    const emailParam = email ? `&email=${encodeURIComponent(email)}` : "";
    const successUrl = `${appUrl}/paywall?upgraded=true${emailParam}`;

    const url = await createCheckoutUrl({ plan, email, successUrl });

    return NextResponse.json({ url }, { headers: CORS });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout failed";
    console.error("[checkout]", msg);
    return NextResponse.json({ error: msg }, { status: 500, headers: CORS });
  }
}
