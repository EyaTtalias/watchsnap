"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PRO_KEY } from "@/lib/collection";
import { getApiUrl } from "@/lib/apiUrl";

function Spinner() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Signing you in…</p>
      </div>
    </div>
  );
}

function AuthCallbackInner() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = params.get("code");
    if (!code) { router.replace("/scan"); return; }

    (async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) { router.replace("/scan"); return; }

      const email  = data.session.user.email ?? "";
      const userId = data.session.user.id;

      try {
        if (email) localStorage.setItem("watchsnap_email", email);
        localStorage.setItem("watchsnap_user_id", userId);
      } catch { /* ignore */ }

      /* ── Check Pro status ── */
      if (email) {
        try {
          const res  = await fetch(getApiUrl("/api/verify-subscription"), {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email }),
          });
          const json = await res.json() as { isPro?: boolean };
          if (json.isPro) {
            localStorage.setItem(PRO_KEY, "1");
            localStorage.removeItem("watchsnap_verified_at");
          }
        } catch { /* ignore */ }
      }

      router.replace("/scan");
    })();
  }, [params, router]);

  return <Spinner />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AuthCallbackInner />
    </Suspense>
  );
}
