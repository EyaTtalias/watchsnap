"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Crown, Check, CreditCard, Mail, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { getApiUrl } from "@/lib/apiUrl";

interface PaywallModalProps {
  onClose?:       () => void;
  onProRestored?: () => void; // called when email restore confirms active subscription
}

export function PaywallModal({ onClose, onProRestored }: PaywallModalProps) {
  const router = useRouter();
  const [visible,        setVisible]        = useState(false);
  const [loading,        setLoading]        = useState<"monthly" | "annual" | null>(null);
  const [email,          setEmail]          = useState("");
  const [showRestore,    setShowRestore]    = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreMsg,     setRestoreMsg]     = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    document.body.style.overflow = "hidden";
    // Pre-fill email from localStorage if known
    try {
      const stored = localStorage.getItem("watchsnap_email");
      if (stored) setEmail(stored);
    } catch { /* ignore */ }
    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, []);

  /* ── Open LemonSqueezy checkout ── */
  const handleUpgrade = async (plan: "monthly" | "annual") => {
    setLoading(plan);
    try {
      // Save email before leaving the page so verify-subscription can run on return
      const trimmed = email.trim().toLowerCase();
      if (trimmed) {
        try { localStorage.setItem("watchsnap_email", trimmed); } catch { /* ignore */ }
      }

      const res = await fetch(getApiUrl("/api/checkout"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan, email: trimmed || undefined }),
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
  const handleRestore = async () => {
    const trimmed = email.trim().toLowerCase();
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
          localStorage.setItem("watchsnap_pro",       "1");
          localStorage.setItem("watchsnap_email",     trimmed);
          localStorage.removeItem("watchsnap_verified_at"); // force re-verify next time
        } catch { /* ignore */ }
        setRestoreMsg({ type: "success", text: "Pro access restored! ✓ Welcome back." });
        // Close modal after a short delay so user sees the success message
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div className={`relative w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#C9A84C]/20 bg-[#0D0D0D] overflow-hidden transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="h-1.5 w-full bg-gradient-to-r from-[#A8882F] via-[#E2C06D] to-[#A8882F]" />

        <div className="p-5">
          {onClose && (
            <button onClick={handleClose} className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#1E1E1E] text-gray-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Header */}
          <div className="mb-4 flex flex-col items-center text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 25px rgba(201,168,76,0.3)" }}>
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
            {/* Monthly + Trial */}
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
                className="w-full rounded-xl py-2.5 text-xs font-black text-black min-h-[40px] disabled:opacity-60 transition-all active:scale-95"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}
              >
                {loading === "monthly" ? "..." : <span className="flex items-center justify-center gap-1"><CreditCard className="h-3 w-3" /> Start Free Trial</span>}
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
                className="w-full rounded-xl py-2.5 text-xs font-black text-emerald-400 min-h-[40px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-60 transition-all active:scale-95"
              >
                {loading === "annual" ? "..." : <span className="flex items-center justify-center gap-1"><CreditCard className="h-3 w-3" /> Get Annual</span>}
              </button>
            </div>
          </div>

          {/* Email field — optional, saves email for sync & pre-fills checkout */}
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Mail className="h-3 w-3 text-[#C9A84C]/70" />
              <span className="text-[10px] text-gray-500 font-medium">Email (optional — syncs Pro across devices)</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl bg-[#0A0A0A] border border-[#2A2A2A] px-3 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A84C]/50 transition-colors"
            />
          </div>

          {/* Restore access section */}
          <button
            onClick={() => { setShowRestore(!showRestore); setRestoreMsg(null); }}
            className="flex w-full items-center justify-between px-1 py-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors mb-2"
          >
            <span>Already subscribed? Restore access →</span>
            {showRestore ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showRestore && (
            <div className="mb-3 rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] p-3 space-y-2">
              <p className="text-[10px] text-gray-400">Enter the email you used when you subscribed to restore Pro access on this device.</p>
              <button
                onClick={handleRestore}
                disabled={restoreLoading}
                className="w-full rounded-xl py-2 text-xs font-black text-[#C9A84C] border border-[#C9A84C]/30 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 disabled:opacity-60 transition-all active:scale-95 min-h-[36px]"
              >
                {restoreLoading
                  ? <span className="flex items-center justify-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Checking...</span>
                  : "Restore Pro Access"
                }
              </button>
              {restoreMsg && (
                <p className={`text-[10px] text-center font-semibold ${restoreMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                  {restoreMsg.text}
                </p>
              )}
            </div>
          )}

          <p className="text-center text-[10px] text-gray-600">
            Cancel anytime · 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
