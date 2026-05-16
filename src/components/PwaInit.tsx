"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

/**
 * PwaInit — registers the service worker.
 * Placed once in layout.tsx. Client-only.
 * Skipped in Capacitor native builds — SW interferes with Capacitor's asset serving.
 */
export function PwaInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Service workers conflict with Capacitor's local file server in native builds
    if (Capacitor.isNativePlatform()) return;
    if (!("serviceWorker" in navigator)) return;

    // Register on next idle tick to not block initial render
    const reg = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((registration) => {
          console.log("[SW] registered, scope:", registration.scope);
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  // New content available — could show a toast here
                  console.log("[SW] new version available");
                }
              });
            }
          });
        })
        .catch((err) => console.warn("[SW] registration failed:", err));
    };

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(reg);
    } else {
      setTimeout(reg, 200);
    }
  }, []);

  return null;
}
