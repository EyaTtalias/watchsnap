"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Hidden developer utility.
 * Visit /?reset=true to clear all local state and return to the home page.
 * Clears: watchsnap_scans_used, watchsnap_pro
 */
export function DevReset() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") !== "true") return;

    try {
      localStorage.removeItem("watchsnap_scans_used");   // SCAN_COUNT_KEY
      localStorage.removeItem("watchsnap_pro");           // PRO_KEY
    } catch {
      // localStorage may be unavailable in some contexts
    }

    // Strip the query param and go home
    router.replace("/");
  }, [router]);

  return null;
}
