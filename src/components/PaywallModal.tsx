"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Crown, Check, CreditCard, Mail, Loader2, ArrowLeft } from "lucide-react";
import { getApiUrl } from "@/lib/apiUrl";

interface PaywallModalProps {
  onClose?:       () => void;
  onProRestored?: () => void;
}

type Screen = "plans" | "restore";

export function PaywallModal({ onClose, onProRestored }: PaywallModalProps) {
  const router = useRouter();

  const [visible,        setVisible]        = useState(false);
  const [screen,         setScreen]         = useState<Screen>("plans");
  const [loading,        setLoading]        = useState<"monthly" | "annual" | null>(null);
  const [restoreEmail,   setRestoreEmail]   = useState("");
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMsg,     setRestoreMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    document.body.style.overflow = "hidden";
    try {
      const stored = localStorage.getItem("watchsnap_email");
      if (stored) setRestoreEmail(stored);
    } catch { /* ignore */ }
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, []);

  /* ── Open LemonSqueezy checkout ── */
  const handleUpgrade = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    try {
      const trimmed = restoreEmail.trim().toLowerCase();
      if (trimmed) {
        try { localStorage.setItem("watchsnap_email", trimmed); } catch { /* ignore */ }
      }
      const res = await fetch(getApiUrl("/api/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: trimmed || undefined }),
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

  /* ── Restore Pro access by email ── */
  const handleRestore = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = restoreEmail.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setRestoreMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    setRestoreLoading(true);
    setRestoreMsg(null);
    try {
      const res  = await fetch(getApiUrl("/api/verify-subscription"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: trimmed }),
      });
      const data = await res.json() as { isPro?: boolean; status?: string };

      if (data.isPro === true) {
        try {
          localStorage.setItem("watchsnap_pro",   "1");
          localStorage.setItem("watchsnap_email", trimmed);
          localStorage.removeItem("watchsnap_verified_at");
        } catch { /* ignore */ }
        setRestoreMsg({ type: "success", text: "✓ Pro access restored! Welcome back." });
        setTimeout(() => {
          setVisible(false);
          setTimeout(() => onProRestored?.(), 300);
        }, 1200);
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

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  return (
    /* Outer wrapper — backdrop + centering */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">

      {/* Backdrop — explicit z-0 so modal (z-10) always wins */}
      <div
        className={`absolute inset-0 z-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      {/* Modal — z-10 keeps it above the backdrop on all browsers/devices */}
      <div
        className={`relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#C9A84C]/20 bg-[#0D0D0D] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* Gold accent bar */}
        <div className="h-1.5 w-full rounded-t-3xl sm:rounded-t-3xl bg-gradient-to-r from-[#A8882F] via-[#E2C06D] to-[#A8882F]" />

        {/* ═══════════════════════════════════════════════════════
            SCREEN 1 — PLANS
        ════════════════════════════════════════════════════════ */}
        {screen === "plans" && (
          <div className="p-5">
            {onClose && (
              <button
                onClick={handleClose}
                className="absolute right-4 top-5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1E1E] text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {/* Header */}
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 25px rgba(201,168,76,0.3)" }}>
                <Crown className="h-7 w-7 text-black" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                Choose a plan to continue scanning
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

            <p className="text-center text-[10px] text-gray-600 mb-3">
              Cancel anytime · 30-day money-back guarantee
            </p>

            {/* Switch to restore screen */}
            <button
              onClick={() => { setScreen("restore"); setRestoreMsg(null); }}
              className="flex w-full items-center justify-center gap-2 py-2.5 text-xs text-gray-500 hover:text-[#C9A84C] transition-colors"
              style={{ touchAction: "manipulation" }}
            >
              <Mail className="h-3.5 w-3.5" />
              Already subscribed? Restore access →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            SCREEN 2 — RESTORE ACCESS
            Dedicated screen with ONLY the email form.
            No plans, no accordion, no scrolling needed.
            Button is ALWAYS the last element — always visible.
        ════════════════════════════════════════════════════════ */}
        {screen === "restore" && (
          <div className="p-5">
            {/* Back button */}
            <button
              onClick={() => { setScreen("plans"); setRestoreMsg(null); }}
              className="mb-4 flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
              style={{ touchAction: "manipulation" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to plans
            </button>

            {/* Header */}
            <div className="mb-5 flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30">
                <Mail className="h-6 w-6 text-[#C9A84C]" />
              </div>
              <h2 className="text-lg font-black">Restore Pro Access</h2>
              <p className="mt-1 text-xs text-gray-400 max-w-[260px] leading-relaxed">
                Enter the email you used when subscribing to unlock Pro on this device.
              </p>
            </div>

            {/* Email form — wrapped in <form> for correct mobile keyboard submit */}
            <form onSubmit={handleRestore} className="space-y-3">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={restoreEmail}
                onChange={(e) => setRestoreEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full rounded-2xl bg-[#111111] border border-[#2A2A2A] px-4 py-3.5 text-base text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
              />

              {/* Submit button — always the LAST element, always visible */}
              <button
                type="submit"
                disabled={restoreLoading}
                className="w-full rounded-2xl py-4 text-sm font-black text-black min-h-[52px] disabled:opacity-60 transition-all active:scale-[0.98]"
                style={{
                  background: restoreLoading
                    ? "rgba(201,168,76,0.5)"
                    : "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)",
                  boxShadow: "0 4px 20px rgba(201,168,76,0.2)",
                  touchAction: "manipulation",
                }}
              >
                {restoreLoading
                  ? <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Checking subscription…
                    </span>
                  : "Restore Pro Access"
                }
              </button>

              {/* Result message */}
              {restoreMsg && (
                <div className={`rounded-xl px-4 py-3 text-center text-sm font-semibold ${
                  restoreMsg.type === "success"
                    ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/20 text-red-400"
                }`}>
                  {restoreMsg.text}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
