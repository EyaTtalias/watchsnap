"use client";

import { useState } from "react";
import { Download, Smartphone, Share, Plus, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";

/**
 * HomeInstallBanner
 * Shown at the bottom of the home page when the app is installable.
 * Always visible (not gated by post-scan trigger).
 */
export function HomeInstallBanner() {
  const { canInstall, isIOS, isInstalled, install } = usePWAInstall();
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [dismissed, setDismissed]       = useState(false);
  const [installing, setInstalling]     = useState(false);

  // Don't show if already installed, or dismissed, or nothing to offer
  if (isInstalled || dismissed) return null;
  if (!canInstall && !isIOS) return null;

  async function handleInstall() {
    if (isIOS) {
      setShowIOSSteps(true);
      return;
    }
    setInstalling(true);
    await install();
    setInstalling(false);
  }

  return (
    <section className="border-t border-[#C9A84C]/15 bg-[#0A0A0A] py-8 px-4">
      <div className="mx-auto max-w-lg">

        {!showIOSSteps ? (
          /* ── Main install card ── */
          <div className="relative overflow-hidden rounded-3xl border border-[#C9A84C]/30 bg-[#111111] p-6"
            style={{ boxShadow: "0 0 40px rgba(201,168,76,0.08)" }}>

            {/* Dismiss */}
            <button onClick={() => setDismissed(true)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-gray-600 hover:text-white hover:bg-white/10 transition-all">
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/icon-96.png" alt="WatchSnap"
                className="h-14 w-14 rounded-2xl border border-[#C9A84C]/20 flex-shrink-0" />

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="h-4 w-4 text-[#C9A84C]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
                    Install App
                  </p>
                </div>
                <h3 className="font-black text-white text-base mb-1 leading-tight">
                  Install WatchSnap on Your Phone
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Add to your Home Screen for the best experience — instant access, full-screen, works offline.
                </p>
              </div>
            </div>

            {/* Features row */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: "⚡", label: "Instant Access" },
                { icon: "📱", label: "Full Screen" },
                { icon: "🔒", label: "Works Offline" },
              ].map(({ icon, label }) => (
                <div key={label} className="rounded-xl bg-[#0D0D0D] border border-[#1E1E1E] p-2.5 text-center">
                  <p className="text-base mb-0.5">{icon}</p>
                  <p className="text-[10px] font-semibold text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button onClick={handleInstall} disabled={installing}
              className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70"
              style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)", boxShadow: "0 6px 24px rgba(201,168,76,0.25)" }}>
              <Download className="h-5 w-5" />
              {installing ? "Opening Install..." : isIOS ? "How to Install on iPhone" : "📲 Install WatchSnap — Free"}
            </button>
            <p className="mt-2 text-center text-[10px] text-gray-600">
              No App Store needed · Free forever
            </p>
          </div>

        ) : (
          /* ── iOS step-by-step instructions ── */
          <div className="overflow-hidden rounded-3xl border border-[#C9A84C]/30 bg-[#111111]"
            style={{ boxShadow: "0 0 40px rgba(201,168,76,0.08)" }}>

            <div className="bg-gradient-to-r from-[#C9A84C] to-[#E2C06D] px-5 py-3 flex items-center justify-between">
              <p className="text-sm font-black text-black">📲 Add to Home Screen</p>
              <button onClick={() => setShowIOSSteps(false)} className="text-black/50 hover:text-black transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-300 leading-relaxed">
                Follow these 3 steps in <strong className="text-white">Safari</strong> to install WatchSnap:
              </p>

              <div className="space-y-4">
                <IOSStep n={1}
                  icon={<Share className="h-5 w-5 text-[#C9A84C]" />}
                  title="Tap Share"
                  desc={<>Tap the <strong className="text-white">Share button ⬆</strong> at the bottom of your browser</>}
                />
                <div className="ml-9 h-px bg-gradient-to-r from-[#C9A84C]/20 to-transparent" />
                <IOSStep n={2}
                  icon={<Plus className="h-5 w-5 text-[#C9A84C]" />}
                  title="Add to Home Screen"
                  desc={<>Scroll the share sheet and tap <strong className="text-white">"Add to Home Screen"</strong></>}
                />
                <div className="ml-9 h-px bg-gradient-to-r from-[#C9A84C]/20 to-transparent" />
                <IOSStep n={3}
                  icon={<Smartphone className="h-5 w-5 text-[#C9A84C]" />}
                  title="Tap Add"
                  desc={<>Tap <strong className="text-white">Add</strong> in the top-right — done! 🎉</>}
                />
              </div>

              <button onClick={() => { setShowIOSSteps(false); setDismissed(true); }}
                className="w-full rounded-2xl border border-[#2A2A2A] py-3 text-sm text-gray-500 hover:text-white transition-colors mt-2">
                Got it, thanks
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function IOSStep({ n, icon, title, desc }: { n: number; icon: React.ReactNode; title: string; desc: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30">
        <span className="text-sm font-black text-[#C9A84C]">{n}</span>
      </div>
      <div className="flex items-start gap-2.5 pt-0.5">
        <span className="mt-0.5 flex-shrink-0">{icon}</span>
        <div>
          <p className="text-sm font-bold text-white mb-0.5">{title}</p>
          <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}
