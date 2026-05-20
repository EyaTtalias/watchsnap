/**
 * LemonSqueezy server-side helper.
 * Never import this from client components — it uses secret env vars.
 */

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

function getHeaders() {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error("LEMONSQUEEZY_API_KEY is not configured");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type":  "application/vnd.api+json",
    Accept:          "application/vnd.api+json",
  };
}

/* ─────────────────────────────────────────────────────────────────
   Variant IDs
───────────────────────────────────────────────────────────────── */
export function getVariantId(plan: "monthly" | "annual"): string {
  const testMode = process.env.LEMONSQUEEZY_TEST_MODE === "true";

  // In test mode, prefer dedicated test variant IDs (test_mode:true products).
  // Fall back to live IDs only if test IDs are not configured.
  if (testMode) {
    const testId =
      plan === "annual"
        ? process.env.LEMONSQUEEZY_TEST_ANNUAL_VARIANT_ID
        : process.env.LEMONSQUEEZY_TEST_MONTHLY_VARIANT_ID;
    if (testId) return testId;
  }

  const id =
    plan === "annual"
      ? process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID
      : process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID;
  if (!id) throw new Error(`LEMONSQUEEZY_${plan.toUpperCase()}_VARIANT_ID is not configured`);
  return id;
}

/* ─────────────────────────────────────────────────────────────────
   Create a hosted checkout URL
   Returns the LemonSqueezy checkout page URL to redirect the user to.
───────────────────────────────────────────────────────────────── */
export async function createCheckoutUrl(opts: {
  plan:        "monthly" | "annual";
  email?:      string;
  name?:       string;
  successUrl?: string;
}): Promise<string> {
  const storeId   = process.env.LEMONSQUEEZY_STORE_ID;
  if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID is not configured");

  const variantId = getVariantId(opts.plan);
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "https://watchsnap.vercel.app";
  const successUrl = opts.successUrl ?? `${appUrl}/paywall?upgraded=true`;

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_options: {
          dark:         true,
          embed:        false,
          media:        true,
          logo:         true,
          desc:         true,
          discount:     true,
          button_color: "#C9A84C",
          locale:       "en",
        },
        checkout_data: {
          ...(opts.email ? { email: opts.email } : {}),
          ...(opts.name  ? { name:  opts.name  } : {}),
          custom: { plan: opts.plan },
        },
        product_options: {
          redirect_url:            successUrl,
          receipt_button_text:     "Go to WatchSnap",
          receipt_link_url:        appUrl,
          receipt_thank_you_note:  "Thank you for subscribing to WatchSnap Pro! Your unlimited access is now active.",
          enabled_variants:        [parseInt(variantId, 10)],
        },
        expires_at: null,
      },
      relationships: {
        store:   { data: { type: "stores",   id: storeId   } },
        variant: { data: { type: "variants", id: variantId } },
      },
    },
  };

  const res = await fetch(`${LS_API_BASE}/checkouts`, {
    method:  "POST",
    headers: getHeaders(),
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`LemonSqueezy API error ${res.status}: ${text}`);
  }

  const json = await res.json() as {
    data: { attributes: { url: string } };
  };

  const rawUrl = json?.data?.attributes?.url;
  if (!rawUrl) throw new Error("LemonSqueezy did not return a checkout URL");

  // Append ?locale=en to force English regardless of store default / browser language.
  // Uses URLSearchParams so it is encoded correctly and never duplicated.
  let finalUrl: string;
  try {
    const u = new URL(rawUrl);
    u.searchParams.set("locale", "en");
    finalUrl = u.toString();
  } catch {
    // Fallback: rawUrl already has params → append with & or ?
    const sep = rawUrl.includes("?") ? "&" : "?";
    finalUrl = `${rawUrl}${sep}locale=en`;
  }

  console.log("[checkout] final URL →", finalUrl);
  return finalUrl;
}
