"use client";

import { useEffect, useState, useCallback } from "react";

export type InstallPlatform = "android" | "ios" | "desktop" | "none";

interface PWAInstallState {
  canInstall: boolean;       // Chrome/Android: beforeinstallprompt captured
  isIOS: boolean;            // Show manual share instructions
  isInstalled: boolean;      // Already running as standalone
  platform: InstallPlatform;
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "none";
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  const isMobile  = isIOS || isAndroid;
  if (isIOS)     return "ios";
  if (isAndroid) return "android";
  // Desktop Chrome that supports install
  if (!isMobile && typeof window !== "undefined" && "BeforeInstallPromptEvent" in window) return "desktop";
  return "none";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

export function usePWAInstall(): PWAInstallState {
  const [canInstall, setCanInstall]   = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform]       = useState<InstallPlatform>("none");

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);
    setIsInstalled(isStandalone());

    // Check if a prompt was already captured before this component mounted
    // (the inline <script> in layout stores it on window.__wsPrompt)
    if ((window as unknown as { __wsPrompt?: unknown }).__wsPrompt) {
      setCanInstall(true);
    }

    // Listen for the custom event dispatched by the inline <script>
    const onReady = () => setCanInstall(true);
    window.addEventListener("ws-install-ready", onReady);

    // Also listen directly in case the component mounts before the event
    const onPrompt = (e: Event) => {
      e.preventDefault();
      (window as unknown as { __wsPrompt: Event }).__wsPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Detect when app is actually installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setCanInstall(false);
      (window as unknown as { __wsPrompt?: unknown }).__wsPrompt = undefined;
    });

    return () => {
      window.removeEventListener("ws-install-ready", onReady);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  const install = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    const prompt = (window as unknown as { __wsPrompt?: { prompt: () => void; userChoice: Promise<{ outcome: string }> } }).__wsPrompt;
    if (!prompt) return "unavailable";
    try {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      (window as unknown as { __wsPrompt?: unknown }).__wsPrompt = undefined;
      setCanInstall(false);
      if (outcome === "accepted") setIsInstalled(true);
      return outcome as "accepted" | "dismissed";
    } catch {
      return "unavailable";
    }
  }, []);

  return {
    canInstall,
    isIOS:      platform === "ios",
    isInstalled,
    platform,
    install,
  };
}
