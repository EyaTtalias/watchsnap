"use client";

import { useEffect, useState } from "react";
import { Crown, Check, CreditCard, Lock } from "lucide-react";

const SHOWN_KEY = "ws_shown_initial_paywall";

/* ─── main export ─── */
export function InitialPaywallModal() {
  const [show,    setShow]    = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem("ws_pro") === "1") return;
      if (localStorage.getItem("watchsnap_pro") === "1") return;
      if (localStorage.getItem(SHOWN_KEY)) return;
      localStorage.setItem(SHOWN_KEY, "1");
      setShow(true);
      setTimeout(() => setVisible(true), 30);
    } catch {}
  }, []);

  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  const handleSubscribe = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    try {
      const email =
        typeof window !== "undefined"
          ? (localStorage.getItem("ws_user_email") ?? undefined)
          : undefined;
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email }),
      });
      if (!res.ok) throw new Error("checkout_failed");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      window.location.href = `/paywall?plan=${plan}`;
    } finally {
      setLoading(null);
    }
  };

  if (!show) return null;

  return (
    /* ── full-screen backdrop ── */
    <div className="fixed inset-0 z-[250]">

      {/* semi-transparent overlay — intentionally non-dismissible */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      />

      {/* bottom-sheet container */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-2xl h-[70vh] sm:h-[65vh] rounded-t-3xl bg-[#0D0D0D] border-t border-x border-[#C9A84C]/20 flex flex-col transition-transform duration-350 ease-out ${visible ? "translate-y-0" : "translate-y-full"}`}
          style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.6)" }}
        >
          {/* drag handle */}
          <div className="flex flex-shrink-0 justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-[#333]" />
          </div>

          {/* scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">

            {/* ── Header ── */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 24px rgba(201,168,76,0.35)" }}>
                <Crown className="h-5 w-5 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-black leading-tight">Unlock WatchSnap</h2>
                <p className="text-xs text-gray-400 mt-0.5">Professional watch intelligence. Cancel anytime.</p>
              </div>
            </div>

            {/* ── Plan cards ── */}
            <div className="grid grid-cols-2 gap-3 mb-4">

              {/* Monthly */}
              <div className="relative overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-[#111111] flex flex-col"
                style={{ boxShadow: "0 0 20px rgba(201,168,76,0.07)" }}>
                <div className="bg-gradient-to-r from-[#C9A84C] to-[#E2C06D] px-3 py-1.5 text-center">
                  <p className="text-[10px] font-black text-black tracking-wide">✨ Most Popular</p>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C] mb-0.5">Free Trial</p>
                  <p className="text-sm font-black leading-tight">7 Days Free</p>
                  <p className="text-xl font-black text-white mt-1">
                    $9.99<span className="text-[10px] font-normal text-gray-400">/mo</span>
                  </p>
                  <p className="text-[10px] text-gray-500 mb-2">after trial · cancel anytime</p>
                  <div className="mb-2 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-2 py-1.5 text-center">
                    <p className="text-[10px] text-[#C9A84C] font-semibold flex items-center justify-center gap-1">
                      <Lock className="h-2.5 w-2.5" /> Not charged yet
                    </p>
                  </div>
                  <ul className="space-y-1 mb-3 flex-1 text-[10px] text-gray-300">
                    {["Unlimited scans", "Full auth report", "Live market data"].map(f => (
                      <li key={f} className="flex items-center gap-1.5">
                        <Check className="h-2.5 w-2.5 text-[#C9A84C] flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe("monthly")}
                    disabled={loading !== null}
                    className="w-full rounded-xl py-2.5 text-xs font-black text-black disabled:opacity-60 transition-all active:scale-95 min-h-[40px]"
                    style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}>
                    {loading === "monthly" ? "..." : (
                      <span className="flex items-center justify-center gap-1.5">
                        <CreditCard className="h-3 w-3" /> Start Free Trial
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Annual */}
              <div className="relative overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] flex flex-col">
                <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 px-3 py-1.5 text-center">
                  <p className="text-[10px] font-black text-white tracking-wide">🏆 Best Value</p>
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">Annual</p>
                  <p className="text-sm font-black leading-tight">Full Year</p>
                  <p className="text-xl font-black text-white mt-1">
                    $59.99<span className="text-[10px] font-normal text-gray-400">/yr</span>
                  </p>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] text-gray-600 line-through">$119.88</span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-black text-emerald-400">−50%</span>
                  </div>
                  <ul className="space-y-1 mb-3 flex-1 text-[10px] text-gray-300">
                    {["Everything in monthly", "~$5/month", "30-day refund"].map(f => (
                      <li key={f} className="flex items-center gap-1.5">
                        <Check className="h-2.5 w-2.5 text-emerald-400 flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSubscribe("annual")}
                    disabled={loading !== null}
                    className="w-full rounded-xl py-2.5 text-xs font-black text-emerald-400 min-h-[40px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-60 transition-all active:scale-95">
                    {loading === "annual" ? "..." : (
                      <span className="flex items-center justify-center gap-1.5">
                        <CreditCard className="h-3 w-3" /> Get Annual
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Terms ── */}
            <p className="text-center text-xs sm:text-sm text-gray-400 leading-snug">
              By subscribing, you agree to our{" "}
              <a href="/terms" className="underline text-gray-300 hover:text-white transition-colors">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" className="underline text-gray-300 hover:text-white transition-colors">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
