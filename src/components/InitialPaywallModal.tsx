"use client";

import { useEffect, useState } from "react";
import {
  Crown, Check, CreditCard, Share2,
  Star, Copy, CheckCircle2, Lock, LogIn,
} from "lucide-react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.watchsnap.app";
export const BONUS_KEY = "ws_bonus_scans";
const SHOWN_KEY = "ws_shown_initial_paywall";

export function getBonusScans(): number {
  try { return Math.max(0, parseInt(localStorage.getItem(BONUS_KEY) || "0", 10)); }
  catch { return 0; }
}
function addBonusScan(): number {
  const next = getBonusScans() + 1;
  try { localStorage.setItem(BONUS_KEY, String(next)); } catch {}
  return next;
}

/* ─── single free-action card ─── */
function EarnCard({
  id, icon, title, desc, cta, onAction, earned,
}: {
  id: string; icon: React.ReactNode; title: string;
  desc: string; cta: string;
  onAction: (id: string) => void; earned: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 transition-all duration-200 ${
      earned
        ? "border-emerald-500/40 bg-emerald-500/8"
        : "border-[#2A2A2A] bg-[#111111] hover:border-[#C9A84C]/25"
    }`}>
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
        earned ? "bg-emerald-500/15" : "bg-[#C9A84C]/10"
      }`}>
        {earned
          ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          : icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-white leading-tight">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{desc}</p>
      </div>

      <button
        onClick={() => !earned && onAction(id)}
        disabled={earned}
        className={`flex-shrink-0 rounded-xl px-3.5 py-2 text-xs font-black transition-all active:scale-95 ${
          earned
            ? "bg-emerald-500/15 text-emerald-400 cursor-default"
            : "bg-[#C9A84C]/15 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/25"
        }`}
      >
        {earned ? "+1 Scan ✓" : cta}
      </button>
    </div>
  );
}

/* ─── main export ─── */
export function InitialPaywallModal() {
  const [show, setShow]     = useState(false);
  const [bonus, setBonus]   = useState(0);
  const [earned, setEarned] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [copyDone, setCopyDone] = useState(false);
  const [visible, setVisible]  = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("ws_pro") === "1") return;   // already pro
      if (localStorage.getItem(SHOWN_KEY)) return;          // already seen
      localStorage.setItem(SHOWN_KEY, "1");
      setBonus(getBonusScans());
      setShow(true);
      setTimeout(() => setVisible(true), 30);
    } catch {}
  }, []);

  /* dim body scroll while open */
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else      document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  const earnScan = (id: string) => {
    if (earned[id]) return;
    const next = addBonusScan();
    setBonus(next);
    setEarned(prev => ({ ...prev, [id]: true }));
  };

  /* ── free action handlers ── */
  const handleShare = async () => {
    try {
      let code = localStorage.getItem("ws_referral_code");
      if (!code) {
        code = "WS-" + Math.random().toString(36).slice(2, 8).toUpperCase();
        localStorage.setItem("ws_referral_code", code);
      }
      await navigator.clipboard.writeText(`https://watchsnap.vercel.app/?ref=${code}`);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {}
    earnScan("share");
  };

  const handleReview = () => {
    window.open(PLAY_STORE_URL, "_blank");
    earnScan("review");
  };

  const handleExitIntent = () => {
    try { localStorage.setItem("ws_exit_intent_bonus", "1"); } catch {}
    earnScan("exit");
  };

  /* ── paid plan handler ── */
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

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  const canContinue = bonus > 0;

  return (
    <div className={`fixed inset-0 z-[250] overflow-y-auto transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ background: "#0A0A0A" }}>

      {/* gold ambient glow */}
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 65% 38% at 50% 0%, rgba(201,168,76,0.13) 0%, transparent 65%)" }} />

      <div className="relative mx-auto w-full max-w-2xl px-4 pt-14 pb-8">

        {/* ── Header ── */}
        <div className="mb-7 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 40px rgba(201,168,76,0.35)" }}>
              <Crown className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Unlock WatchSnap</h1>
          <p className="mt-1.5 text-sm text-gray-400">
            Choose a paid plan — or earn free scans below.
          </p>
        </div>

        {/* ── Paid plans ── */}
        <div className="grid grid-cols-2 gap-3 mb-2">

          {/* Monthly */}
          <div className="relative overflow-hidden rounded-2xl border border-[#C9A84C]/40 bg-[#111111] flex flex-col"
            style={{ boxShadow: "0 0 24px rgba(201,168,76,0.08)" }}>
            <div className="bg-gradient-to-r from-[#C9A84C] to-[#E2C06D] px-3 py-2 text-center">
              <p className="text-[10px] font-black text-black tracking-wide">✨ Most Popular</p>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C] mb-0.5">Free Trial</p>
              <p className="text-base font-black leading-tight">7 Days Free</p>
              <p className="text-2xl font-black text-white mt-1.5">
                $9.99<span className="text-xs font-normal text-gray-400">/mo</span>
              </p>
              <p className="text-[10px] text-gray-500 mb-3">after trial · cancel anytime</p>
              <div className="mb-3 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-2.5 py-2 text-center">
                <p className="text-[10px] text-[#C9A84C] font-semibold flex items-center justify-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> Card saved — not charged yet
                </p>
              </div>
              <ul className="space-y-1.5 mb-4 flex-1 text-[11px] text-gray-300">
                {["Unlimited scans", "Full auth report", "My Collection", "Live market data"].map(f => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#C9A84C] flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe("monthly")}
                disabled={loading !== null}
                className="w-full rounded-xl py-3 text-xs font-black text-black disabled:opacity-60 transition-all active:scale-95 min-h-[44px]"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}>
                {loading === "monthly" ? "..." : (
                  <span className="flex items-center justify-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Start Free Trial
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Annual */}
          <div className="relative overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0D0D0D] flex flex-col">
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 px-3 py-2 text-center">
              <p className="text-[10px] font-black text-white tracking-wide">🏆 Best Value</p>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-0.5">Annual</p>
              <p className="text-base font-black leading-tight">Full Year</p>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <p className="text-2xl font-black text-white">$59.99<span className="text-xs font-normal text-gray-400">/yr</span></p>
              </div>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[10px] text-gray-600 line-through">$119.88</span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-black text-emerald-400">−50%</span>
              </div>
              <ul className="space-y-1.5 mb-4 flex-1 text-[11px] text-gray-300">
                {["Everything in monthly", "~$5/month", "30-day refund"].map(f => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-emerald-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe("annual")}
                disabled={loading !== null}
                className="w-full rounded-xl py-3 text-xs font-black text-emerald-400 min-h-[44px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-60 transition-all active:scale-95">
                {loading === "annual" ? "..." : (
                  <span className="flex items-center justify-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Get Annual
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="mb-6 text-center text-[10px] text-gray-600">
          Secure checkout via Lemon Squeezy · Cancel anytime
        </p>

        {/* ── Divider ── */}
        <div className="relative mb-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#1E1E1E]" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
            or earn free scans
          </span>
          <div className="flex-1 h-px bg-[#1E1E1E]" />
        </div>

        {/* ── Bonus scan counter ── */}
        {bonus > 0 && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/8 py-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-black text-emerald-400">
              You&apos;ve earned {bonus} free scan{bonus > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* ── Free action cards ── */}
        <div className="space-y-2.5 mb-6">
          <EarnCard
            id="share"
            icon={<Share2 className="h-5 w-5 text-[#C9A84C]" />}
            title="Share with a Friend"
            desc="Copy your referral link — your friend gets WatchSnap, you get 1 free scan."
            cta={copyDone ? "Copied!" : "Copy Link"}
            onAction={handleShare}
            earned={!!earned["share"]}
          />
          <EarnCard
            id="review"
            icon={<Star className="h-5 w-5 text-[#C9A84C]" />}
            title="Leave a Google Play Review"
            desc="Rate us ⭐⭐⭐⭐⭐ on the Play Store — takes 10 seconds, earns 1 free scan."
            cta="Rate Now"
            onAction={handleReview}
            earned={!!earned["review"]}
          />
          <EarnCard
            id="exit"
            icon={<LogIn className="h-5 w-5 text-[#C9A84C]" />}
            title="Exit Intent Bonus"
            desc="Dismiss this screen — next time you try to leave the site you'll get 1 free scan."
            cta="Activate"
            onAction={handleExitIntent}
            earned={!!earned["exit"]}
          />
        </div>

        {/* ── Continue button (only if earned scans) ── */}
        {canContinue ? (
          <button
            onClick={dismiss}
            className="w-full rounded-2xl py-4 text-base font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)" }}>
            Continue with {bonus} Free Scan{bonus > 1 ? "s" : ""} →
          </button>
        ) : (
          <p className="text-center text-xs text-gray-600">
            Complete an action above to continue for free, or choose a plan.
          </p>
        )}
        <p className="mt-8 mb-2 text-center text-xs sm:text-sm text-gray-400 leading-relaxed">
          By subscribing, you agree to our{" "}
          <a href="/terms" className="underline text-gray-300 hover:text-white transition-colors">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="underline text-gray-300 hover:text-white transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
