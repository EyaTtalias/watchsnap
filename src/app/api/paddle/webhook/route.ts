import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// See comment in /api/identify/route.ts — same reasoning applies here.
export const dynamic =
  process.env.BUILD_TARGET === "capacitor" ? "auto" : "force-dynamic";
export const runtime = "nodejs";

/* ─────────────────────────────────────────────────────────────────
   Paddle Billing webhook handler
   Verifies HMAC-SHA256 signature, then updates Supabase user row
   based on subscription.created / .updated / .canceled events.
───────────────────────────────────────────────────────────────── */

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Verify Paddle's "Paddle-Signature" header.
 * Format: "ts=<unix-ts>;h1=<hmac-sha256-hex>"
 * The signed payload is `${ts}:${rawBody}`.
 */
function verifyPaddleSignature(rawBody: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const parts = header.split(";").reduce<Record<string, string>>((acc, p) => {
    const [k, v] = p.split("=");
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${ts}:${rawBody}`)
    .digest("hex");

  // Constant-time compare
  return expected.length === h1.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(h1));
}

function planFromPriceId(priceId: string | undefined): "monthly" | "annual" | null {
  if (!priceId) return null;
  const yearly = process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID ?? process.env.NEXT_PUBLIC_PADDLE_ANNUAL_PRICE_ID;
  if (priceId === yearly)                                           return "annual";
  if (priceId === process.env.NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID)  return "monthly";
  return null;
}

interface PaddleSubItem {
  price?: { id?: string };
}
interface PaddleSubData {
  id: string;
  customer_id: string;
  status: string;
  current_billing_period?: { ends_at?: string };
  next_billed_at?: string;
  trial_dates?: { ends_at?: string };
  items?: PaddleSubItem[];
}
interface PaddleEvent {
  event_type: string;
  data: PaddleSubData & { customer?: { email?: string } };
}

async function upsertFromSubscription(d: PaddleSubData, email: string | undefined) {
  const supabase = getSupabaseAdmin();
  const priceId  = d.items?.[0]?.price?.id;
  const plan     = planFromPriceId(priceId);

  // Map Paddle status → our subscription_status enum
  const statusMap: Record<string, string> = {
    active:   "active",
    trialing: "trial",
    canceled: "cancelled",
    past_due: "past_due",
    paused:   "past_due",
  };
  const status = statusMap[d.status] ?? d.status;

  const update = {
    paddle_customer_id:     d.customer_id,
    paddle_subscription_id: d.id,
    subscription_status:    status,
    subscription_plan:      plan,
    current_period_end:     d.current_billing_period?.ends_at ?? d.next_billed_at ?? null,
    trial_ends_at:          d.trial_dates?.ends_at ?? null,
    updated_at:             new Date().toISOString(),
  };

  // Match by paddle_customer_id first
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("paddle_customer_id", d.customer_id)
    .maybeSingle();

  if (existing) {
    await supabase.from("users").update(update).eq("id", existing.id);
    return;
  }

  // Else match by email
  if (email) {
    const { data: byEmail } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (byEmail) {
      await supabase.from("users").update(update).eq("id", byEmail.id);
      return;
    }
    await supabase.from("users").insert({ email, ...update });
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "PADDLE_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const sig     = req.headers.get("paddle-signature");

  if (!verifyPaddleSignature(rawBody, sig, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let evt: PaddleEvent;
  try { evt = JSON.parse(rawBody) as PaddleEvent; }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  try {
    switch (evt.event_type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.activated":
      case "subscription.trialing":
        await upsertFromSubscription(evt.data, evt.data.customer?.email);
        break;

      case "subscription.canceled":
      case "subscription.paused":
        await upsertFromSubscription({ ...evt.data, status: "canceled" }, evt.data.customer?.email);
        break;

      // Other events (transaction.completed, etc.) — log & ignore for now
      default:
        console.log("[paddle webhook] ignored event:", evt.event_type);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook handler error";
    console.error("[paddle webhook]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
