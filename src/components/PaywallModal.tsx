"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Check, CreditCard, Loader2, Mail } from "lucide-react";
import { getApiUrl } from "@/lib/apiUrl";
import { PRO_KEY } from "@/lib/collection";

interface PaywallModalProps {
  /** Called after server confirms Pro (email restore path) */
  onProRestored?: () => void;
}

export function PaywallModal({ onProRestored }: PaywallModalProps) {
  const router = useRouter();

  const [visible,        setVisible]        = useState(false);
  const [loading,        setLoading]        = useState<"monthly" | "annual" | null>(null);
  const [restoreEmail,   setRestoreEmail]   = useState(() => {
    try { return localStorage.getItem("watchsnap_email") ?? ""; } catch { return ""; }
  });
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMsg,     setRestoreMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    document.body.style.overflow = "hidden";
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, []);

  /* ── Open LemonSqueezy checkout ── */
  const handleUpgrade = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    try {
      const email = restoreEmail.trim().toLowerCase();
      if (email) {
        try { localStorage.setItem("watchsnap_email", email); } catch { /* ignore */ }
      }
      const res = await fetch(getApiUrl("/api/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: email || undefined }),
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

  /* ── Restore Pro by email ── */
  const handleRestore = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const email = restoreEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setRestoreMsg({ type: "error", text: "Enter a valid email address." });
      return;
    }
    setRestoreLoading(true);
    setRestoreMsg(null);
    try {
      const res  = await fetch(getApiUrl("/api/verify-subscription"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json() as { isPro?: boolean; status?: string };

      if (data.isPro === true) {
        try {
          localStorage.setItem(PRO_KEY, "1");
          localStorage.setItem("watchsnap_email", email);
          localStorage.removeItem("watchsnap_verified_at");
        } catch { /* ignore */ }
        setRestoreMsg({ type: "success", text: "✓ Pro access restored!" });
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => onProRestored?.(), 300);
        }, 1000);
      } else {
        setRestoreMsg({
          type: "error",
          text: data.status === "unknown"
            ? "Could not reach server. Please try again."
            : "No active subscription found for this email.",
        });
      }
    } catch {
      setRestoreMsg({ type: "error", text: "Connection error. Please try again." });
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

      {/* Backdrop — no onClick, modal cannot be dismissed */}
      <div className={`absolute inset-0 z-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#C9A84C]/20 bg-[#0D0D0D] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Gold accent bar */}
        <div className="h-1.5 w-full rounded-t-3xl sm:rounded-t-3xl bg-gradient-to-r from-[#A8882F] via-[#E2C06D] to-[#A8882F]" />

        <div className="p-5">
          {/* Header */}
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 25px rgba(201,168,76,0.3)" }}>
              <Crown className="h-7 w-7 text-black" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              Unlock Pro to start scanning
            </p>
            <h2 className="mt-1 text-xl font-black">Choose Your Plan</h2>
            <p className="mt-0.5 text-xs text-gray-400">Credit card required for both options</p>
          </div>

          {/* Plans grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Monthly */}
            <div className="rounded-2xl border border-[#C9A84C]/30 bg-[#111111] p-4 flex flex-col gap-3">
              <div>
                <p className="text-[10px] font-bold text-[#C9A84C] mb-0.5">✨ Most Popular</p>
                <p className="text-sm font-black leading-tight">7-Day Free Trial</p>
                <p className="text-xs text-gray-400 mt-0.5">then $9.99/month</p>
              </div>
              <ul className="space-y-1">
                {["Card required", "Cancel before trial", "Auto-charges after"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Check className="h-3 w-3 text-[#C9A84C] flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade("monthly")}
                disabled={loading !== null}
                className="w-full rounded-xl py-2.5 text-xs font-black text-black min-h-[44px] disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", touchAction: "manipulation" }}
              >
                {loading === "monthly"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                  : <span className="flex items-center justify-center gap-1"><CreditCard className="h-3 w-3" /> Start Free Trial</span>}
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
                {["~$5/month", "Instant access", "30-day refund"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                    <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />{t}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleUpgrade("annual")}
                disabled={loading !== null}
                className="w-full rounded-xl py-2.5 text-xs font-black text-emerald-400 min-h-[44px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-60 transition-all active:scale-95"
                style={{ touchAction: "manipulation" }}
              >
                {loading === "annual"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                  : <span className="flex items-center justify-center gap-1"><CreditCard className="h-3 w-3" /> Get Annual</span>}
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-600 mb-4">
            Cancel anytime · 30-day money-back guarantee
          </p>

          {/* ── Inline restore section ── */}
          <div className="border-t border-[#1E1E1E] pt-4">
            <p className="text-center text-[11px] text-gray-500 mb-2.5">
              Already subscribed? Enter your email to restore access.
            </p>
            <form onSubmit={handleRestore} className="flex gap-2">
              <input
                ref={inputRef}
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={restoreEmail}
                onChange={(e) => { setRestoreEmail(e.target.value); setRestoreMsg(null); }}
                placeholder="your@email.com"
                className="flex-1 min-w-0 rounded-xl bg-[#111111] border border-[#2A2A2A] px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
              />
              <button
                type="submit"
                disabled={restoreLoading}
                className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-black text-[#C9A84C] border border-[#C9A84C]/30 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 disabled:opacity-50 transition-all flex-shrink-0"
                style={{ touchAction: "manipulation" }}
              >
                {restoreLoading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <><Mail className="h-3.5 w-3.5" /> Restore</>
                }
              </button>
            </form>
            {restoreMsg && (
              <p className={`mt-2 text-center text-xs font-semibold ${restoreMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                {restoreMsg.text}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
