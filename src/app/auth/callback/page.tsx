"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PRO_KEY } from "@/lib/collection";

type Status = "loading" | "success" | "error";

function AuthCallbackInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status,  setStatus]  = useState<Status>("loading");
  const [message, setMessage] = useState("Logging you in…");

  useEffect(() => {
    const run = async () => {
      try {
        /* ── 1. Exchange PKCE code for session ── */
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        /* ── 2. Retrieve the active session ── */
        let { data: { session } } = await supabase.auth.getSession();

        // Give Supabase a moment if session isn't ready yet
        if (!session?.user?.email) {
          await new Promise((r) => setTimeout(r, 800));
          ({ data: { session } } = await supabase.auth.getSession());
        }

        if (!session?.user?.email) {
          throw new Error("Login link has expired. Please request a new one.");
        }

        const email = session.user.email;

        /* ── 3. Persist email for verify-subscription calls ── */
        try { localStorage.setItem("watchsnap_email", email); } catch { /* ignore */ }

        /* ── 4. Check Pro subscription status ── */
        setMessage("Checking your subscription…");
        try {
          const res = await fetch("/api/verify-subscription", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email }),
          });
          if (res.ok) {
            const data = await res.json() as { isPro?: boolean };
            if (data.isPro === true) {
              try { localStorage.setItem(PRO_KEY, "1"); } catch { /* ignore */ }
            }
          }
        } catch {
          /* subscription check failed — proceed anyway */
        }

        setStatus("success");
        setMessage("You're in! Taking you to WatchSnap…");
        setTimeout(() => router.replace("/scan"), 1200);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Login failed. Please try again.");
        setTimeout(() => router.replace("/scan"), 3500);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconClass =
    status === "success" ? "bg-emerald-500/15 border border-emerald-500/30" :
    status === "error"   ? "bg-red-500/10 border border-red-500/20" :
                           "bg-[#C9A84C]/10 border border-[#C9A84C]/30";

  const Icon =
    status === "success" ? <CheckCircle2 className="h-8 w-8 text-emerald-400" /> :
    status === "error"   ? <XCircle      className="h-8 w-8 text-red-400" /> :
                           <Loader2      className="h-8 w-8 text-[#C9A84C] animate-spin" />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${iconClass}`}>
          {Icon}
        </div>
        <p className={`text-lg font-bold ${status === "error" ? "text-red-400" : "text-white"}`}>
          {message}
        </p>
        {status === "error" && (
          <p className="mt-2 text-sm text-gray-500">Redirecting you back in a moment…</p>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30">
        <Loader2 className="h-8 w-8 text-[#C9A84C] animate-spin" />
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackInner />
    </Suspense>
  );
}
