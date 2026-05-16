import { Capacitor } from "@capacitor/core";

/**
 * Returns the correct URL for a WatchSnap API call.
 *
 * - In the browser (Vercel / PWA):  returns a relative path, e.g. "/api/identify"
 *   so the request always hits the same origin.
 *
 * - In a Capacitor native build (Android / iOS):  the app is loaded from the
 *   local device filesystem, so relative URLs would resolve to nowhere.
 *   We prefix with the live Vercel deployment URL so API calls reach the server.
 *
 * The base URL can be overridden at build-time via NEXT_PUBLIC_API_BASE_URL
 * (useful for staging environments).
 */

const VERCEL_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://watchsnap.vercel.app";

export function getApiUrl(path: string): string {
  if (Capacitor.isNativePlatform()) {
    return `${VERCEL_BASE}${path}`;
  }
  return path;
}
