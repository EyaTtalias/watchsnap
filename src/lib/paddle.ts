"use client";

import { initializePaddle, Paddle } from "@paddle/paddle-js";

/* ─────────────────────────────────────────────────────────────────
   Paddle.js — client-side checkout helper
───────────────────────────────────────────────────────────────── */

export const PADDLE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_PADDLE_MONTHLY_PRICE_ID ?? "",
  // Accept both YEARLY and ANNUAL env names
  annual:  process.env.NEXT_PUBLIC_PADDLE_YEARLY_PRICE_ID
        ?? process.env.NEXT_PUBLIC_PADDLE_ANNUAL_PRICE_ID
        ?? "",
};

let cached: Paddle | undefined;

export async function getPaddle(): Promise<Paddle | undefined> {
  if (typeof window === "undefined") return undefined;
  if (cached) return cached;

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    console.warn("[paddle] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN not set");
    return undefined;
  }

  const env = (process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox") as "sandbox" | "production";

  cached = await initializePaddle({
    environment: env,
    token,
    eventCallback: (evt) => {
      // Track checkout lifecycle for analytics
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (w.dataLayer) w.dataLayer.push({ event: "paddle_event", name: evt.name });
      }
    },
  });
  return cached;
}

/**
 * Open Paddle checkout overlay. Both plans include a 7-day free trial
 * (configured on the Paddle Price itself, not here).
 *
 * On successful checkout Paddle redirects back to `successUrl`.
 */
export async function openPaddleCheckout(plan: "monthly" | "annual", opts?: {
  email?: string;
  successUrl?: string;
}) {
  const paddle = await getPaddle();
  if (!paddle) {
    throw new Error("Paddle is not initialised. Check NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.");
  }

  const priceId = PADDLE_PRICES[plan];
  if (!priceId) {
    throw new Error(`Price ID missing for ${plan}. Set NEXT_PUBLIC_PADDLE_${plan.toUpperCase()}_PRICE_ID.`);
  }

  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    settings: {
      displayMode: "overlay",
      theme: "dark",
      successUrl: opts?.successUrl ?? `${window.location.origin}/scan?upgraded=true`,
    },
    customer: opts?.email ? { email: opts.email } : undefined,
  });
}
