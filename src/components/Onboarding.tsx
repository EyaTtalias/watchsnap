"use client";

import { useEffect, useState } from "react";
import { Camera, TrendingUp, Shield, CreditCard, Crown, Check } from "lucide-react";

export const ONBOARDING_KEY = "watchsnap_onboarded";
export const PRO_KEY = "watchsnap_pro";

interface OnboardingProps {
  onDone: () => void;
}

const benefits = [
  { icon: Camera,     text: "Identify any watch in seconds" },
  { icon: TrendingUp, text: "Live market value & price trends" },
  { icon: Shield,     text: "Full 30-point authentication check" },
];

export function Onboarding({ onDone }: OnboardingProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, []);

  const handlePlan = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    setError("");
    try {
      const { openPaddleCheckout } = await import("@/lib/paddle");
      localStorage.setItem(ONBOARDING_KEY, "1");
      await openPaddleCheckout(plan);
    } catch (err) {
      // If Paddle isn't configured yet, fall back to full paywall page
      localStorage.setItem(ONBOARDING_KEY, "1");
      window.location.href = "/paywall";
      setError(err instanceof Error ? err.message : "Connection error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Solid non-dismissable backdrop */}
      <div className="absolute inset-0 bg-[#030303]"
        style={{ backgroundImage: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(201,168,76,0.1) 0%, transparent 70%)" }}
      />

      <div
        className={`relative w-full max-w-sm mx-auto rounded-t-3xl sm:rounded-3xl bg-[#0C0C0C] border border-[#C9A84C]/20 overflow-hidden transition-all duration-500 ${visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"}`}
        style={{ boxShadow: "0 -32px 100px rgba(201,168,76,0.15), 0 0 0 1px rgba(201,168,76,0.08)" }}
      >
        {/* Gold accent stripe */}
        <div className="h-1 w-full bg-gradient-to-r from-[#A8882F] via-[#E2C06D] to-[#A8882F]" />

        <div className="px-6 pt-8 pb-7">
          {/* Crown + Title */}
          <div className="mb-6 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 36px rgba(201,168,76,0.4)" }}
            >
              <Crown className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-1">Welcome to WatchSnap</h1>
            <p className="text-sm text-gray-400">The professional AI watch intelligence platform</p>
          </div>

          {/* Benefits */}
          <div className="mb-5 space-y-2">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-2xl border border-[#1E1E1E] bg-[#111111] px-4 py-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/10">
                  <Icon className="h-4 w-4 text-[#C9A84C]" />
                </div>
                <span className="text-sm font-medium text-gray-200">{text}</span>
              </div>
            ))}
          </div>

          {/* Plan cards */}
          <div className="space-y-3 mb-4">

            {/* Option A: Free Trial */}
            <button
              onClick={() => handlePlan("monthly")}
              disabled={loading !== null}
              className="group w-full rounded-2xl overflow-hidden text-left transition-all active:scale-[0.98] disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 45%, #A8882F 100%)", boxShadow: "0 6px 28px rgba(201,168,76,0.3)" }}
            >
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-black/50 uppercase tracking-widest">✨ Most Popular</span>
                  <span className="text-xs font-bold text-black/60">then $9.99/month</span>
                </div>
                <div className="flex items-center gap-2.5 text-black">
                  <CreditCard className="h-4 w-4 flex-shrink-0" />
                  <span className="text-base font-black">
                    {loading === "monthly" ? "Redirecting to checkout..." : "Start Free Trial — 7 Days Free"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  {["Credit card required", "Cancel before trial ends", "Auto-charges after 7 days"].map((t) => (
                    <span key={t} className="flex items-center gap-1 text-[10px] text-black/50">
                      <Check className="h-2.5 w-2.5" />{t}
                    </span>
                  ))}
                </div>
              </div>
            </button>

            {/* Option B: Annual */}
            <button
              onClick={() => handlePlan("annual")}
              disabled={loading !== null}
              className="w-full rounded-2xl border border-[#2A2A2A] bg-[#111111] px-5 py-4 text-left transition-all active:scale-[0.98] hover:border-emerald-500/40 disabled:opacity-70"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-black text-white">
                      {loading === "annual" ? "Redirecting..." : "Get Annual Access — $59.99/year"}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-black text-emerald-400">
                      BEST VALUE
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">~$5/month · Save 50% · Instant access</p>
                </div>
                <CreditCard className="h-4 w-4 text-gray-500 flex-shrink-0 ml-3" />
              </div>
            </button>
          </div>

          {error && (
            <p className="mb-3 text-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <p className="text-center text-[11px] text-gray-600 leading-relaxed">
            Secure payment via Stripe · Cancel anytime · 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}

export function useFirstLaunch() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(ONBOARDING_KEY)) setShowOnboarding(true);
  }, []);
  return { showOnboarding, dismissOnboarding: () => setShowOnboarding(false) };
}
