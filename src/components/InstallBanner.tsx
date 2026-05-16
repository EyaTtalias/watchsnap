"use client";

import { useEffect, useState } from "react";
import { X, Share, Plus, Download, Smartphone } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const DISMISSED_KEY = "watchsnap_install_dismissed";

interface InstallBannerProps {
  /** Set to true after a trigger event (e.g. scan complete) */
  show?: boolean;
  /** Skip localStorage dismissed check — used when user explicitly taps "Install" */
  forceShow?: boolean;
  onClose?: () => void;
}

export function InstallBanner({ show = false, forceShow = false, onClose }: InstallBannerProps) {
  const { canInstall, isIOS, isInstalled, install } = usePWAInstall();
  const [visible, setVisible]   = useState(false);
  const [animating, setAnimating] = useState(false);

  const shouldOffer = !isInstalled && (canInstall || isIOS);

  useEffect(() => {
    if (!show && !forceShow) return;
    if (!shouldOffer) return;
    if (!forceShow && localStorage.getItem(DISMISSED_KEY)) return;

    const t = setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
    }, forceShow ? 0 : 1200);
    return () => clearTimeout(t);
  }, [show, forceShow, shouldOffer]);

  function dismiss() {
    setAnimating(false);
    setTimeout(() => {
      setVisible(false);
      if (!forceShow) localStorage.setItem(DISMISSED_KEY, "1");
      onClose?.();
    }, 320);
  }

  async function handleInstall() {
    if (isIOS) return; // iOS: user follows manual steps, modal stays open
    const result = await install();
    if (result !== "unavailable") dismiss();
  }

  if (!visible) return null;

  /* ════════════════ iOS Modal ════════════════ */
  if (isIOS) {
    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-6 sm:items-center">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${animating ? "opacity-100" : "opacity-0"}`}
          onClick={dismiss}
        />
        {/* Sheet */}
        <div className={`relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#C9A84C]/40 bg-[#111111] shadow-2xl transition-all duration-300 ${animating ? "translate-y-0 opacity-100 scale-100" : "translate-y-6 opacity-0 scale-95"}`}
          style={{ boxShadow: "0 0 60px rgba(201,168,76,0.18)" }}>

          {/* Gold header */}
          <div className="relative bg-gradient-to-r from-[#C9A84C] to-[#E2C06D] px-5 py-3">
            <p className="text-sm font-black text-black text-center">📲 Install WatchSnap</p>
            <button onClick={dismiss} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/50 hover:text-black">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-6 py-6">
            {/* App identity */}
            <div className="flex items-center gap-4 mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-128.png" alt="WatchSnap" className="h-16 w-16 rounded-2xl border border-[#C9A84C]/20 flex-shrink-0" />
              <div>
                <p className="font-black text-white text-lg leading-tight">WatchSnap</p>
                <p className="text-xs text-gray-400 mt-0.5">AI Watch Identifier</p>
                <p className="mt-1.5 inline-block rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 px-2 py-0.5 text-[10px] font-bold text-[#C9A84C]">
                  Free · No App Store needed
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Add WatchSnap to your Home Screen for instant, full-screen access — it works just like a native app.
            </p>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              <IOSStep n={1}
                icon={<Share className="h-5 w-5 text-[#C9A84C]" />}
                text={<>Tap the <strong className="text-white">Share</strong> button <span className="text-[#C9A84C]">⬆</span> at the bottom of Safari</>}
              />
              <IOSStep n={2}
                icon={<Plus className="h-5 w-5 text-[#C9A84C]" />}
                text={<>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong></>}
              />
              <IOSStep n={3}
                icon={<Smartphone className="h-5 w-5 text-[#C9A84C]" />}
                text={<>Tap <strong className="text-white">Add</strong> — WatchSnap icon appears on your Home Screen!</>}
              />
            </div>

            <button onClick={dismiss}
              className="w-full rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] py-3 text-sm text-gray-400 hover:text-white transition-colors">
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════ Android / Chrome banner ════════════════ */
  return (
    <div className={`fixed bottom-20 sm:bottom-6 left-3 right-3 z-[200] mx-auto max-w-md transition-all duration-300 ${animating ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
      <div className="overflow-hidden rounded-2xl border border-[#C9A84C]/35 bg-[#111111] shadow-2xl"
        style={{ boxShadow: "0 8px 40px rgba(201,168,76,0.15)" }}>

        <div className="flex items-center gap-3 px-4 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-96.png" alt="WatchSnap" className="h-12 w-12 rounded-xl flex-shrink-0 border border-[#C9A84C]/20" />
          <div className="flex-1 min-w-0">
            <p className="font-black text-white text-sm leading-tight">Install WatchSnap</p>
            <p className="text-xs text-gray-500 mt-0.5">Add to your Home Screen for quick access</p>
          </div>
          <button onClick={dismiss} className="flex-shrink-0 p-1.5 rounded-full text-gray-600 hover:text-white hover:bg-white/10 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 border-t border-[#1E1E1E]">
          <button onClick={dismiss}
            className="py-3 text-sm text-gray-500 hover:text-white transition-colors text-center border-r border-[#1E1E1E]">
            Not now
          </button>
          <button onClick={handleInstall}
            className="flex items-center justify-center gap-2 py-3 text-sm font-black text-black transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}>
            <Download className="h-4 w-4" />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── iOS step helper ── */
function IOSStep({ n, icon, text }: { n: number; icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 mt-0.5">
        <span className="text-[11px] font-black text-[#C9A84C]">{n}</span>
      </div>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex-shrink-0">{icon}</span>
        <p className="text-sm text-gray-400 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
