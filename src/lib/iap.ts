/**
 * iap.ts — TypeScript wrapper around the native IAPPlugin (StoreKit 2).
 *
 * Usage:
 *   import { isNativeIOS, iapPurchase, iapRestore } from "@/lib/iap";
 *
 *   if (isNativeIOS()) {
 *     const result = await iapPurchase("monthly");
 *   }
 */

import { Capacitor, registerPlugin } from "@capacitor/core";

// ─── Plugin interface ───────────────────────────────────────────────────────

interface IAPProduct {
  productId:   string;
  title:       string;
  description: string;
  price:       string; // display string e.g. "$9.99"
}

interface NativeIAPPlugin {
  getProducts(opts: { productIds: string[] }): Promise<{ products: IAPProduct[] }>;
  purchaseProduct(opts: { productId: string }): Promise<{ transactionId: string; productId: string }>;
  restorePurchases(): Promise<{ restored: boolean }>;
  checkEntitlements(): Promise<{ isPro: boolean }>;
}

// registerPlugin is a no-op on web — safe to call unconditionally.
const IAPBridge = registerPlugin<NativeIAPPlugin>("IAP");

// ─── Product IDs ────────────────────────────────────────────────────────────

export const IAP_PRODUCT_IDS = {
  monthly: "com.watchsnap.app.pro.monthly",
  annual:  "com.watchsnap.app.pro.annual",
} as const;

// ─── Platform detection ─────────────────────────────────────────────────────

/** Returns true only when running inside the native iOS Capacitor shell. */
export function isNativeIOS(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios";
}

// ─── Public helpers ─────────────────────────────────────────────────────────

/**
 * Fetch App Store product info for both plans.
 * Returns an empty array gracefully on any error.
 */
export async function iapGetProducts(): Promise<IAPProduct[]> {
  try {
    const { products } = await IAPBridge.getProducts({
      productIds: Object.values(IAP_PRODUCT_IDS),
    });
    return products;
  } catch {
    return [];
  }
}

/**
 * Initiate an Apple IAP purchase for the given plan.
 * On success the native layer has already called transaction.finish().
 */
export async function iapPurchase(
  plan: "monthly" | "annual"
): Promise<{ success: boolean; cancelled?: boolean; error?: string }> {
  try {
    await IAPBridge.purchaseProduct({ productId: IAP_PRODUCT_IDS[plan] });
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes("cancel")) {
      return { success: false, cancelled: true };
    }
    return { success: false, error: msg };
  }
}

/**
 * Restore previously completed Apple purchases.
 * Returns { restored: true } if at least one active Pro entitlement was found.
 */
export async function iapRestore(): Promise<{ restored: boolean; error?: string }> {
  try {
    return await IAPBridge.restorePurchases();
  } catch (e) {
    return { restored: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Silently check StoreKit entitlements on app launch.
 * Call this on the scan page — if true, set watchsnap_pro=1 automatically.
 */
export async function iapCheckEntitlements(): Promise<boolean> {
  try {
    const { isPro } = await IAPBridge.checkEntitlements();
    return isPro;
  } catch {
    return false;
  }
}
