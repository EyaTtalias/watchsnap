"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Check, CreditCard, Loader2, RotateCcw } from "lucide-react";
import { getApiUrl } from "@/lib/apiUrl";
import { PRO_KEY } from "@/lib/collection";
import { isNativeIOS, iapPurchase, iapRestore, iapCheckEntitlements } from "@/lib/iap";

interface PaywallModalProps {
  onProRestored?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Shared plan feature list
// ─────────────────────────────────────────────────────────────────────────────
const FEATURES_MONTHLY = ["Cancel before trial", "Auto-charges after 7 days", "Unlimited scans"];
const FEATURES_ANNUAL  = ["~$5/month", "Instant access", "30-day refund"];

export function PaywallModal({ onProRestored: _onProRestored }: PaywallModalProps) {
  const router  = useRouter();
  const [visible,      setVisible]      = useState(false);
  const [loading,      setLoading]      = useState<"monthly" | "annual" | "restore" | null>(null);
  const [error,        setError]        = useState("");
  const [iosMode,      setIosMode]      = useState(false);

  // ── Mount: detect platform + check existing entitlements on iOS ──
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    document.body.style.overflow = "hidden";

    (async () => {
      if (isNativeIOS()) {
        setIosMode(true);
        // Auto-unlock if user already has an active subscription
        const isPro = await iapCheckEntitlements();
        if (isPro) {
          try { localStorage.setItem(PRO_KEY, "1"); } catch { /* ignore */ }
          document.body.style.overflow = "";
          _onProRestored?.();
        }
      }
    })();

    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─────────────────────────────────────────────────────────────────
  //  iOS  —  Apple IAP purchase
  // ─────────────────────────────────────────────────────────────────
  const handleIAPPurchase = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    setError("");
    const result = await iapPurchase(plan);
    if (result.success) {
      try { localStorage.setItem(PRO_KEY, "1"); } catch { /* ignore */ }
      document.body.style.overflow = "";
      _onProRestored?.();
    } else if (!result.cancelled) {
      setError(result.error ?? "Purchase failed. Please try again.");
    }
    setLoading(null);
  };

  // ─────────────────────────────────────────────────────────────────
  //  iOS  —  Restore purchases
  // ─────────────────────────────────────────────────────────────────
  const handleRestore = async () => {
    setLoading("restore");
    setError("");
    const result = await iapRestore();
    if (result.restored) {
      try { localStorage.setItem(PRO_KEY, "1"); } catch { /* ignore */ }
      document.body.style.overflow = "";
      _onProRestored?.();
    } else {
      setError(result.error ?? "No previous purchases found.");
    }
    setLoading(null);
  };

  // ─────────────────────────────────────────────────────────────────
  //  Web  —  LemonSqueezy checkout
  // ─────────────────────────────────────────────────────────────────
  const handleWebUpgrade = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    setError("");
    try {
      let email = "";
      try { email = localStorage.getItem("watchsnap_email") ?? ""; } catch { /* ignore */ }
      const res = await fetch(getApiUrl("/api/checkout"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan, email: email || undefined }),
      });
      if (!res.ok) throw new Error("checkout_failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      router.push(`/paywall?plan=${plan}`);
    } finally {
      setLoading(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`absolute inset-0 z-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} />

      <div className={`relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#C9A84C]/20 bg-[#0D0D0D] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="h-1.5 w-full rounded-t-3xl sm:rounded-t-3xl bg-gradient-to-r from-[#A8882F] via-[#E2C06D] to-[#A8882F]" />

        <div className="p-5">
          {/* ── Header ── */}
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 25px rgba(201,168,76,0.3)" }}>
              <Crown className="h-7 w-7 text-black" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              Unlock Pro to start scanning
            </p>
            <h2 className="mt-1 text-xl font-black">Choose Your Plan</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {iosMode ? "Billed through your Apple ID" : "Credit card required for both options"}
            </p>
          </div>

          {/* ── Plans ── */}
          <div className="grid grid-cols-2 gap-3 mb-4">

            {/* Monthly */}
            <div className="rounded-2xl border border-[#C9A84C]/30 bg-[#111111] p-4 flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#C9A84C] mb-0.5">✨ Most Popular</p>
                <p className="text-sm font-black leading-tight">7-Day Free Trial</p>
                <p className="text-xs text-gray-400 mt-0.5">then $9.99/month</p>
              </div>
              <ul className="space-y-1">
                {FEATURES_MONTHLY.map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Check className="h-3 w-3 text-[#C9A84C] flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => iosMode ? handleIAPPurchase("monthly") : handleWebUpgrade("monthly")}
                disabled={loading !== null}
                className="w-full rounded-xl py-2.5 text-xs font-black text-black min-h-[44px] disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", touchAction: "manipulation" }}
              >
                {loading === "monthly" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                ) : iosMode ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <AppleIcon /> Start Free Trial
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <CreditCard className="h-3 w-3" /> Start Free Trial
                  </span>
                )}
              </button>
            </div>

            {/* Annual */}
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] p-4 flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold text-emerald-400 mb-0.5">🏆 Best Value</p>
                <p className="text-sm font-black leading-tight">Annual Plan</p>
                <p className="text-xs text-gray-400 mt-0.5">$59.99/year</p>
              </div>
              <ul className="space-y-1">
                {FEATURES_ANNUAL.map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => iosMode ? handleIAPPurchase("annual") : handleWebUpgrade("annual")}
                disabled={loading !== null}
                className="w-full rounded-xl py-2.5 text-xs font-black text-emerald-400 min-h-[44px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-60 transition-all active:scale-95"
                style={{ touchAction: "manipulation" }}
              >
                {loading === "annual" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                ) : iosMode ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <AppleIcon className="text-emerald-400" /> Get Annual
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <CreditCard className="h-3 w-3" /> Get Annual
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <p className="text-center text-xs text-red-400 mb-3">{error}</p>
          )}

          {/* ── iOS extras ── */}
          {iosMode && (
            <>
              <button
                onClick={handleRestore}
                disabled={loading !== null}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2 py-1 disabled:opacity-40"
              >
                {loading === "restore"
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <RotateCcw className="h-3 w-3" />}
                Restore Purchases
              </button>
              <p className="text-center text-[9px] text-gray-700 leading-snug px-2">
                Payment charged to Apple ID at confirmation. Subscription auto-renews unless cancelled at least 24h before the end of the current period. Manage in App Store settings.
              </p>
            </>
          )}

          {/* ── Web footer ── */}
          {!iosMode && (
            <p className="text-center text-[10px] text-gray-600">
              Cancel anytime · 30-day money-back guarantee
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tiny inline Apple logo ───────────────────────────────────────────────────
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-3.5 w-3.5 flex-shrink-0 fill-current ${className ?? "text-black"}`}
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z" />
    </svg>
  );
}
