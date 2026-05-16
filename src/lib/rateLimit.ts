/**
 * In-memory rate limiter — shared within a single serverless instance.
 *
 * ⚠️  Vercel may spawn multiple concurrent instances, each with their own store.
 *     This still protects against per-instance burst abuse, which covers most
 *     attack patterns on serverless.
 *
 *     For strict global rate limiting, replace with:
 *     → Upstash Redis  (@upstash/ratelimit)
 *     → Vercel KV      (@vercel/kv)
 */

interface Entry {
  count:       number;
  windowStart: number;
}

/* Module-level store — lives as long as the lambda instance stays warm */
const store = new Map<string, Entry>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour rolling window

/**
 * Check whether a key (IP + route) is within the allowed rate.
 * @param key        Unique identifier, e.g. `identify:1.2.3.4`
 * @param maxPerHour Max allowed requests in the window
 */
export function checkRateLimit(
  key:         string,
  maxPerHour:  number,
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now   = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // Start a fresh window
    store.set(key, { count: 1, windowStart: now });

    // Prune stale entries to avoid memory leaks
    if (store.size > 100_000) {
      store.forEach((v, k) => {
        if (now - v.windowStart >= WINDOW_MS * 2) store.delete(k);
      });
    }

    return { allowed: true, remaining: maxPerHour - 1, retryAfterSec: 0 };
  }

  entry.count += 1;
  const allowed       = entry.count <= maxPerHour;
  const remaining     = Math.max(0, maxPerHour - entry.count);
  const retryAfterSec = allowed
    ? 0
    : Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);

  return { allowed, remaining, retryAfterSec };
}

/**
 * Extract the real client IP from a Next.js request.
 * Vercel sets x-forwarded-for; fall back to x-real-ip.
 */
export function getClientIp(req: Request): string {
  const fwd  = (req as Request & { headers: Headers }).headers.get("x-forwarded-for");
  if (fwd)   return fwd.split(",")[0].trim();
  const real = (req as Request & { headers: Headers }).headers.get("x-real-ip");
  if (real)  return real.trim();
  return "unknown";
}

/**
 * Build a NextResponse for rate-limit exceeded (429).
 */
export function rateLimitResponse(retryAfterSec: number) {
  const { NextResponse } = require("next/server") as typeof import("next/server");
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After":               String(retryAfterSec),
        "X-RateLimit-Limit":         "exceeded",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
