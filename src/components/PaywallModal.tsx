"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crown, Check, CreditCard, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/apiUrl";
import { supabase } from "@/lib/supabase";
import { PRO_KEY } from "@/lib/collection";

interface PaywallModalProps {
  onProRestored?: () => void;
}

export function PaywallModal({ onProRestored }: PaywallModalProps) {
  const router = useRouter();

  const [visible,       setVisible]       = useState(false);
  const [loading,       setLoading]       = useState<"monthly" | "annual" | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    document.body.style.overflow = "hidden";

    /* ── If user already has a Google session, check Pro status ── */
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) return;

        const email  = data.session.user.email ?? "";
        const userId = data.session.user.id;
        try {
          if (email)  localStorage.setItem("watchsnap_email",   email);
          if (userId) localStorage.setItem("watchsnap_user_id", userId);
        } catch { /* ignore */ }

        if (!email) return;
        const res  = await fetch(getApiUrl("/api/verify-subscription"), {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email }),
        });
        const json = await res.json() as { isPro?: boolean };
        if (json.isPro) {
          localStorage.setItem(PRO_KEY, "1");
          localStorage.removeItem("watchsnap_verified_at");
          document.body.style.overflow = "";
          onProRestored?.();
        }
      } catch { /* ignore */ }
    })();

    return () => { clearTimeout(t); document.body.style.overflow = ""; };
  }, [onProRestored]);

  /* ── Google OAuth ── */
  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      /* browser will redirect — keep spinner until navigation */
    } catch {
      setLoadingGoogle(false);
    }
  };

  /* ── LemonSqueezy checkout ── */
  const handleUpgrade = async (plan: "monthly" | "annual") => {
    setLoading(plan);
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

  return (
    /* No backdrop onClick — cannot be dismissed */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`absolute inset-0 z-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`} />

      <div className={`relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-[#C9A84C]/20 bg-[#0D0D0D] transition-all duration-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
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

          {/* ── Google Sign-In ── */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loading !== null}
            className="w-full mb-4 flex items-center justify-center gap-2.5 rounded-2xl border border-[#2A2A2A] bg-[#161616] py-3 text-sm font-semibold text-white hover:bg-[#1E1E1E] disabled:opacity-60 transition-all active:scale-[0.98]"
          >
            {loadingGoogle ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loadingGoogle ? "Redirecting…" : "Continue with Google"}
          </button>

          <div className="relative mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#1E1E1E]" />
            <span className="text-[10px] text-gray-600 uppercase tracking-widest">or subscribe below</span>
            <div className="h-px flex-1 bg-[#1E1E1E]" />
          </div>

          {/* Plans */}
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
                disabled={loading !== null || loadingGoogle}
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
                disabled={loading !== null || loadingGoogle}
                className="w-full rounded-xl py-2.5 text-xs font-black text-emerald-400 min-h-[44px] border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-60 transition-all active:scale-95"
                style={{ touchAction: "manipulation" }}
              >
                {loading === "annual"
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                  : <span className="flex items-center justify-center gap-1"><CreditCard className="h-3 w-3" /> Get Annual</span>}
              </button>
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-600">
            Cancel anytime · 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}
