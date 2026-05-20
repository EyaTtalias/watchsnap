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
  const [message, setMessage] = useState("Signing you in…");

  useEffect(() => {
    const run = async () => {
      try {
        /* ── 1. Exchange PKCE code (Google OAuth sends ?code=…) ── */
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        /* ── 2. Grab session ── */
        let { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          await new Promise((r) => setTimeout(r, 800));
          ({ data: { session } } = await supabase.auth.getSession());
        }
        if (!session?.user?.email) {
          throw new Error("Session not found. Please try again.");
        }

        const { email, id: userId } = session.user;

        /* ── 3. Persist email so verify-subscription works ── */
        try { localStorage.setItem("watchsnap_email", email); } catch { /* ignore */ }

        /* ── 4. Check Pro status ── */
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
        } catch { /* proceed even if subscription check fails */ }

        /* ── 5. Link auth_id to users row (best-effort) ── */
        try {
          await supabase
            .from("users")
            .update({ auth_id: userId })
            .eq("email", email)
            .is("auth_id", null);
        } catch { /* non-critical */ }

        setStatus("success");
        setMessage("Signed in! Opening WatchSnap…");
        setTimeout(() => router.replace("/scan"), 900);
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
        setTimeout(() => router.replace("/scan"), 3000);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ring =
    status === "success" ? "bg-emerald-500/15 border border-emerald-500/30" :
    status === "error"   ? "bg-red-500/10 border border-red-500/20" :
                           "bg-[#C9A84C]/10 border border-[#C9A84C]/30";
  const icon =
    status === "success" ? <CheckCircle2 className="h-8 w-8 text-emerald-400" /> :
    status === "error"   ? <XCircle      className="h-8 w-8 text-red-400" /> :
                           <Loader2      className="h-8 w-8 text-[#C9A84C] animate-spin" />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] p-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full ${ring}`}>
          {icon}
        </div>
        <p className={`text-lg font-bold ${status === "error" ? "text-red-400" : "text-white"}`}>
          {message}
        </p>
        {status === "error" && (
          <p className="mt-2 text-sm text-gray-500">Redirecting back in a moment…</p>
        )}
      </div>
    </div>
  );
}

function SpinnerPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A]">
      <Loader2 className="h-8 w-8 text-[#C9A84C] animate-spin" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<SpinnerPage />}>
      <AuthCallbackInner />
    </Suspense>
  );
}
