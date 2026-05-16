import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@supabase/supabase-js";
import crypto                        from "crypto";

export const dynamic = process.env.BUILD_TARGET === "capacitor" ? "auto" : "force-dynamic";
export const runtime = "nodejs";

/* ─────────────────────────────────────────────────────────────────
   Supabase admin client (service role — bypasses RLS)
───────────────────────────────────────────────────────────────── */
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

/* ─────────────────────────────────────────────────────────────────
   Signature verification
   LemonSqueezy signs the raw body with HMAC-SHA256 and puts the hex
   digest in the "X-Signature" header.
───────────────────────────────────────────────────────────────── */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return (
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
    );
  } catch {
    return false;
  }
}

/* ─────────────────────────────────────────────────────────────────
   Map LemonSqueezy subscription status → our DB enum
───────────────────────────────────────────────────────────────── */
function mapStatus(lsStatus: string): string {
  const map: Record<string, string> = {
    on_trial:  "trial",
    active:    "active",
    paused:    "past_due",
    past_due:  "past_due",
    unpaid:    "past_due",
    cancelled: "cancelled",
    expired:   "cancelled",
  };
  return map[lsStatus] ?? "free";
}

/* ─────────────────────────────────────────────────────────────────
   Determine plan from variant ID
───────────────────────────────────────────────────────────────── */
function planFromVariant(variantId: number | string | undefined): "monthly" | "annual" | null {
  if (!variantId) return null;
  const id = String(variantId);
  if (id === process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID)  return "annual";
  if (id === process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID) return "monthly";
  return null;
}

/* ─────────────────────────────────────────────────────────────────
   LemonSqueezy event shapes (minimal — only what we need)
───────────────────────────────────────────────────────────────── */
interface LsSubscriptionAttributes {
  customer_id:    number;
  variant_id:     number;
  user_email:     string;
  user_name:      string;
  status:         string;
  trial_ends_at:  string | null;
  renews_at:      string | null;
  ends_at:        string | null;
  cancelled:      boolean;
  test_mode:      boolean;
}

interface LsOrderAttributes {
  customer_id:       number;
  user_email:        string;
  status:            string;
  first_order_item?: { variant_id?: number };
  test_mode:         boolean;
}

interface LsEvent {
  meta: {
    event_name: string;
    test_mode:  boolean;
    custom_data?: Record<string, unknown>;
  };
  data: {
    type:       string;
    id:         string;
    attributes: LsSubscriptionAttributes | LsOrderAttributes;
  };
}

/* ─────────────────────────────────────────────────────────────────
   Upsert user row in Supabase from a subscription event
───────────────────────────────────────────────────────────────── */
async function upsertFromSubscription(
  subId:    string,
  attrs:    LsSubscriptionAttributes,
) {
  const supabase = getSupabaseAdmin();
  const plan     = planFromVariant(attrs.variant_id);
  const status   = mapStatus(attrs.status);

  const update = {
    // Reuse the paddle_* columns for LS IDs (no schema migration needed)
    paddle_customer_id:     String(attrs.customer_id),
    paddle_subscription_id: subId,
    subscription_status:    status,
    subscription_plan:      plan,
    trial_ends_at:          attrs.trial_ends_at  ?? null,
    current_period_end:     attrs.renews_at ?? attrs.ends_at ?? null,
    updated_at:             new Date().toISOString(),
  };

  // 1. Try match by customer ID (most reliable after first purchase)
  const { data: byCustomer } = await supabase
    .from("users")
    .select("id")
    .eq("paddle_customer_id", String(attrs.customer_id))
    .maybeSingle();

  if (byCustomer) {
    await supabase.from("users").update(update).eq("id", byCustomer.id);
    return;
  }

  // 2. Try match by email
  const { data: byEmail } = await supabase
    .from("users")
    .select("id")
    .eq("email", attrs.user_email)
    .maybeSingle();

  if (byEmail) {
    await supabase.from("users").update(update).eq("id", byEmail.id);
    return;
  }

  // 3. New user — insert row
  await supabase.from("users").insert({
    email: attrs.user_email,
    ...update,
  });
}

/* ─────────────────────────────────────────────────────────────────
   Handle order_created (covers one-time purchases if added later)
───────────────────────────────────────────────────────────────── */
async function handleOrderCreated(orderId: string, attrs: LsOrderAttributes) {
  if (attrs.status !== "paid") return; // ignore pending/refunded orders

  const supabase = getSupabaseAdmin();
  const plan     = planFromVariant(attrs.first_order_item?.variant_id);

  const update = {
    paddle_customer_id:     String(attrs.customer_id),
    paddle_subscription_id: `order_${orderId}`,
    subscription_status:    "active",
    subscription_plan:      plan,
    updated_at:             new Date().toISOString(),
  };

  const { data: byEmail } = await supabase
    .from("users")
    .select("id")
    .eq("email", attrs.user_email)
    .maybeSingle();

  if (byEmail) {
    await supabase.from("users").update(update).eq("id", byEmail.id);
  } else {
    await supabase.from("users").insert({ email: attrs.user_email, ...update });
  }
}

/* ─────────────────────────────────────────────────────────────────
   POST /api/webhook/lemonsqueezy
───────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const rawBody = await req.text();

  // Verify signature only when secret is configured
  if (secret) {
    const sig = req.headers.get("x-signature");
    if (!verifySignature(rawBody, sig, secret)) {
      console.error("[ls webhook] invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  } else {
    console.warn("[ls webhook] LEMONSQUEEZY_WEBHOOK_SECRET not set — skipping signature check");
  }

  let evt: LsEvent;
  try {
    evt = JSON.parse(rawBody) as LsEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = evt.meta?.event_name ?? "";
  console.log("[ls webhook] event:", eventName);

  try {
    switch (eventName) {
      // ── Subscription lifecycle ──
      case "subscription_created":
      case "subscription_updated":
      case "subscription_resumed": {
        const attrs = evt.data.attributes as LsSubscriptionAttributes;
        await upsertFromSubscription(evt.data.id, attrs);
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired":
      case "subscription_paused": {
        const attrs = evt.data.attributes as LsSubscriptionAttributes;
        // Force cancelled/expired status
        await upsertFromSubscription(evt.data.id, {
          ...attrs,
          status: eventName === "subscription_paused" ? "paused" : "cancelled",
        });
        break;
      }

      // ── One-time orders ──
      case "order_created": {
        const attrs = evt.data.attributes as LsOrderAttributes;
        await handleOrderCreated(evt.data.id, attrs);
        break;
      }

      default:
        // Silently acknowledge unknown events
        break;
    }

    return NextResponse.json({ received: true, event: eventName });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Handler error";
    console.error("[ls webhook]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
