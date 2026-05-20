"use client";

import { useState } from "react";
import { Crown, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LoginScreenProps {
  /** Called after magic-link is sent and user confirmed Pro via callback */
  onLoggedIn?: () => void;
}

export function LoginScreen({ onLoggedIn: _onLoggedIn }: LoginScreenProps) {
  const [email,   setEmail]   = useState(() => {
    try { return localStorage.getItem("watchsnap_email") ?? ""; } catch { return ""; }
  });
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo },
      });
      if (authError) throw authError;
      try { localStorage.setItem("watchsnap_email", trimmed); } catch { /* ignore */ }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── "Check your email" confirmation state ── */
  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] px-6">
        <div className="flex flex-col items-center text-center max-w-sm w-full">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black mb-2">Check your email</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            We sent a magic link to{" "}
            <span className="text-white font-semibold">{email.trim().toLowerCase()}</span>.
            Tap it to log in — no password needed.
          </p>
          <p className="text-xs text-gray-600 leading-relaxed">
            Didn&apos;t get it? Check spam or{" "}
            <button
              onClick={() => setSent(false)}
              className="text-[#C9A84C] underline"
              style={{ touchAction: "manipulation" }}
            >
              try a different email
            </button>.
          </p>
        </div>
      </div>
    );
  }

  /* ── Email entry screen ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A] px-6">
      <div className="w-full max-w-sm">

        {/* Logo / header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #A8882F)",
              boxShadow:  "0 0 30px rgba(201,168,76,0.25)",
            }}
          >
            <Crown className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-2xl font-black">Welcome to WatchSnap</h1>
          <p className="mt-2 text-sm text-gray-400 leading-relaxed">
            Enter your email to get started.<br />
            Existing subscribers get Pro access automatically.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="your@email.com"
            className="w-full rounded-2xl bg-[#111111] border border-[#2A2A2A] px-4 py-4 text-base text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A84C]/60 transition-colors"
          />

          {error && (
            <p className="text-xs text-red-400 text-center px-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-4 text-sm font-black text-black min-h-[56px] disabled:opacity-60 transition-all active:scale-[0.98]"
            style={{
              background: loading
                ? "rgba(201,168,76,0.5)"
                : "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)",
              boxShadow:   "0 4px 20px rgba(201,168,76,0.2)",
              touchAction: "manipulation",
            }}
          >
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending link…
                </span>
              : <span className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" />
                  Continue with Email
                  <ArrowRight className="h-4 w-4" />
                </span>
            }
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-gray-600 leading-relaxed">
          We&apos;ll email you a secure login link — no password required.
        </p>
      </div>
    </div>
  );
}
