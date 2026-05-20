"use client";

import { useEffect, useState } from "react";
import { Crown, Check, Shield, Star, Zap, History, TrendingUp, CreditCard, Lock, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { PRO_KEY } from "@/lib/collection";
import { getApiUrl } from "@/lib/apiUrl";

const features = [
  { icon: Zap,        text: "Unlimited watch scans — no monthly cap" },
  { icon: TrendingUp, text: "Live market value with comparable sales data" },
  { icon: Shield,     text: "Full 30-point authentication report" },
  { icon: History,    text: "My Collection — save & organize your scans" },
  { icon: Star,       text: "Priority AI analysis — faster results" },
  { icon: Crown,      text: "Early access to new features" },
];

export default function PaywallPage() {
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error,   setError]   = useState("");
  const [email,   setEmail]   = useState("");

  /* ── Handle return from LemonSqueezy checkout ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      try {
        localStorage.setItem(PRO_KEY, "1");
        // If email was passed back in the redirect URL, store it for
        // server-side subscription verification on the scan page
        const emailParam = params.get("email");
        if (emailParam) localStorage.setItem("watchsnap_email", emailParam.toLowerCase());
        localStorage.removeItem("watchsnap_verified_at"); // force re-verify
      } catch { /* ignore */ }
      window.history.replaceState({}, "", "/scan");
      window.location.href = "/scan";
    }

    // Pre-fill email from localStorage if already known
    try {
      const stored = localStorage.getItem("watchsnap_email");
      if (stored) setEmail(stored);
    } catch { /* ignore */ }
  }, []);

  /* ── Open LemonSqueezy hosted checkout ── */
  const handleSubscribe = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    setError("");
    try {
      // Store email before leaving the page so it's available on return
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedEmail) {
        try { localStorage.setItem("watchsnap_email", trimmedEmail); } catch { /* ignore */ }
      }

      const res  = await fetch(getApiUrl("/api/checkout"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan, email: trimmedEmail || undefined }),
      });
      const data = await res.json() as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Could not create checkout. Please try again.");
      }

      // Redirect to LemonSqueezy hosted checkout page
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open checkout. Please try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24 sm:pt-20 pb-safe pb-10">
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-lg px-4 w-full">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 40px rgba(201,168,76,0.3)" }}>
              <Crown className="h-10 w-10 text-black" />
            </div>
          </div>
          <h1 className="mb-2 text-3xl font-black tracking-tight">Unlock Full Access</h1>
          <p className="text-gray-400 text-sm">Professional watch intelligence. Cancel anytime.</p>
        </div>

        {/* ── Plan cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* Monthly */}
          <div className="relative overflow-hidden rounded-3xl border border-[#C9A84C]/40 bg-[#111111] flex flex-col"
            style={{ boxShadow: "0 0 30px rgba(201,168,76,0.08)" }}>
            <div className="bg-gradient-to-r from-[#C9A84C] to-[#E2C06D] px-4 py-2.5 text-center">
              <p className="text-xs font-black text-black tracking-wide">✨ Most Popular</p>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C] mb-1">Free Trial</p>
                <h2 className="text-xl font-black">7 Days Free</h2>
                <p className="text-3xl font-black text-white mt-2">
                  $9.99<span className="text-base font-normal text-gray-400">/mo</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">after trial ends</p>
              </div>
              <div className="mb-4 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 p-3 text-center">
                <p className="text-xs text-[#C9A84C] font-semibold flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" /> Card saved — not charged yet
                </p>
                <p className="text-xs text-[#C9A84C]/60 mt-0.5">Auto-charges after 7 days</p>
              </div>
              <ul className="space-y-2 mb-5 flex-1">
                {features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15 mt-0.5">
                      <Check className="h-3 w-3 text-[#C9A84C]" />
                    </div>
                    <span className="text-xs text-gray-300 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={loading !== null}
                className="w-full rounded-2xl py-3.5 text-sm font-black text-black transition-all active:scale-[0.98] hover:scale-[1.01] disabled:opacity-60 min-h-[52px]"
                style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)", boxShadow: "0 6px 24px rgba(201,168,76,0.25)" }}>
                {loading === "monthly"
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Opening checkout...</span>
                  : <span className="flex items-center justify-center gap-2"><CreditCard className="h-4 w-4" /> Start Free Trial</span>
                }
              </button>
              <p className="text-center text-[10px] text-gray-600 mt-2">Cancel before trial ends — no charge</p>
            </div>
          </div>

          {/* Annual */}
          <div className="relative overflow-hidden rounded-3xl border border-[#2A2A2A] bg-[#0D0D0D] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-center">
              <p className="text-xs font-black text-white tracking-wide">🏆 Best Value</p>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-4 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Annual Plan</p>
                <h2 className="text-xl font-black">Full Year</h2>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <p className="text-3xl font-black text-white">
                    $59.99<span className="text-base font-normal text-gray-400">/yr</span>
                  </p>
                </div>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <span className="text-xs text-gray-500 line-through">$119.88</span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-400">Save 50%</span>
                </div>
              </div>
              <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
                <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                  <Lock className="h-3 w-3" /> Instant access · 30-day refund
                </p>
                <p className="text-xs text-emerald-400/60 mt-0.5">~$5/month · Best deal</p>
              </div>
              <ul className="space-y-2 mb-5 flex-1">
                {features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-2">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15 mt-0.5">
                      <Check className="h-3 w-3 text-emerald-400" />
                    </div>
                    <span className="text-xs text-gray-300 leading-relaxed">{text}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe("annual")}
                disabled={loading !== null}
                className="w-full rounded-2xl py-3.5 text-sm font-black text-emerald-400 min-h-[52px] border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-60 transition-all active:scale-[0.98]">
                {loading === "annual"
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Opening checkout...</span>
                  : <span className="flex items-center justify-center gap-2"><CreditCard className="h-4 w-4" /> Get Annual Access</span>
                }
              </button>
              <p className="text-center text-[10px] text-gray-600 mt-2">30-day money-back guarantee</p>
            </div>
          </div>
        </div>

        {/* ── Optional email for subscription restore ── */}
        <div className="mb-4 rounded-2xl border border-[#1E1E1E] bg-[#111111] p-4">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-2.5">
            <Mail className="h-3.5 w-3.5 text-[#C9A84C]" />
            Email (optional — restores subscription across devices)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full rounded-xl bg-[#0D0D0D] border border-[#2A2A2A] px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
          />
          <p className="text-[10px] text-gray-600 mt-2">
            Used only to verify your subscription — never shared.
          </p>
        </div>

        {/* ── Error message ── */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* ── Trust row ── */}
        <div className="mb-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "🔒", label: "SSL Encrypted"  },
            { icon: "🍋", label: "Powered by Lemon Squeezy" },
            { icon: "↩️",  label: "30-Day Refund"  },
          ].map(({ icon, label }) => (
            <div key={label} className="rounded-xl border border-[#1E1E1E] bg-[#111111] py-3 px-2">
              <p className="text-lg mb-1">{icon}</p>
              <p className="text-[10px] text-gray-500 font-semibold leading-tight">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
