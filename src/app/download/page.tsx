"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Star, Shield, Zap, ChevronRight, Smartphone, Monitor } from "lucide-react";

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  if (/android/i.test(ua))           return "android";
  if (/iphone|ipad|ipod/i.test(ua))  return "ios";
  return "desktop";
}

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.watchsnap.app";
const WEB_APP_URL    = "https://watchsnap.vercel.app";

/* ── Shared badge assets ── */
function PlayStoreBadge({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-6 py-4 hover:bg-[#C9A84C]/20 transition-all active:scale-[0.98] w-full justify-center"
    >
      {/* Google Play icon (SVG) */}
      <svg viewBox="0 0 24 24" className="h-7 w-7 flex-shrink-0" fill="none">
        <path d="M3.18 23.76c.3.17.64.24.98.2L14.93 12 11.07 8.14 3.18 23.76z" fill="#EA4335"/>
        <path d="M20.68 10.3l-2.9-1.67-4.14 3.73 4.14 3.72 2.93-1.69a2.06 2.06 0 0 0 0-4.09z" fill="#FBBC04"/>
        <path d="M3.18.24A2.06 2.06 0 0 0 2 2.11v19.78l.07.1L14.93 12 3.18.24z" fill="#4285F4"/>
        <path d="M3.18 23.76 14.93 12l-3.86-3.86L3.25.14l-.07.1v19.78a2.06 2.06 0 0 0 1.18 1.87l-.18-.13z" fill="#34A853"/>
      </svg>
      <div className="text-left">
        <p className="text-[10px] text-[#C9A84C]/70 uppercase tracking-widest font-bold">Get it on</p>
        <p className="text-lg font-black text-white leading-tight">Google Play</p>
      </div>
    </button>
  );
}

function WebAppBadge({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#111111] px-6 py-4 hover:border-[#C9A84C]/30 hover:bg-[#181818] transition-all active:scale-[0.98] w-full justify-center"
    >
      <Smartphone className="h-7 w-7 text-gray-400 flex-shrink-0" />
      <div className="text-left">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Open in browser</p>
        <p className="text-lg font-black text-white leading-tight">Web App</p>
      </div>
    </button>
  );
}

const features = [
  { icon: Zap,    text: "Instant AI watch identification" },
  { icon: Shield, text: "Authentication & replica detection" },
  { icon: Star,   text: "Live secondary-market pricing" },
];

/* ─────────────────────────────────────────────────────────────────
   Auto-redirect on mobile
───────────────────────────────────────────────────────────────── */
export default function DownloadPage() {
  const [platform,    setPlatform]    = useState<Platform>("unknown");
  const [redirecting, setRedirecting] = useState(false);
  const [countdown,   setCountdown]   = useState(3);

  useEffect(() => {
    const p = detectPlatform();
    setPlatform(p);

    if (p === "android") {
      // Auto-redirect to Google Play after countdown
      setRedirecting(true);
      let c = 3;
      const timer = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(timer);
          window.location.href = PLAY_STORE_URL;
        }
      }, 1000);
      return () => clearInterval(timer);
    }

    if (p === "ios") {
      // iOS: open web app (no App Store listing yet)
      setRedirecting(true);
      let c = 3;
      const timer = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(timer);
          window.location.href = WEB_APP_URL;
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, []);

  const goPlay = () => { window.location.href = PLAY_STORE_URL; };
  const goWeb  = () => { window.location.href = WEB_APP_URL;    };

  /* ── Android auto-redirect screen ── */
  if (platform === "android" && redirecting) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg,#C9A84C,#A8882F)", boxShadow: "0 0 60px rgba(201,168,76,0.4)" }}>
          <Crown className="h-12 w-12 text-black" />
        </div>
        <h1 className="text-3xl font-black mb-2">WatchSnap</h1>
        <p className="text-gray-400 text-sm mb-8">Opening Google Play…</p>

        {/* Countdown ring */}
        <div className="relative flex h-20 w-20 items-center justify-center mb-8">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#1E1E1E" strokeWidth="6"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#C9A84C" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 3)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <span className="text-3xl font-black text-[#C9A84C]">{countdown}</span>
        </div>

        <button onClick={goPlay}
          className="w-full max-w-xs rounded-2xl py-4 text-sm font-black text-black mb-3"
          style={{ background: "linear-gradient(135deg,#C9A84C,#E2C06D)" }}>
          Open Google Play Now
        </button>
        <button onClick={() => setRedirecting(false)}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
          Cancel
        </button>
      </div>
    );
  }

  /* ── iOS auto-redirect screen ── */
  if (platform === "ios" && redirecting) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg,#C9A84C,#A8882F)", boxShadow: "0 0 60px rgba(201,168,76,0.4)" }}>
          <Crown className="h-12 w-12 text-black" />
        </div>
        <h1 className="text-3xl font-black mb-2">WatchSnap</h1>
        <p className="text-gray-400 text-sm mb-2">Opening web app…</p>
        <p className="text-xs text-gray-600 mb-8">iOS App Store version coming soon</p>

        <div className="relative flex h-20 w-20 items-center justify-center mb-8">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#1E1E1E" strokeWidth="6"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke="#C9A84C" strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - countdown / 3)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <span className="text-3xl font-black text-[#C9A84C]">{countdown}</span>
        </div>

        <button onClick={goWeb}
          className="w-full max-w-xs rounded-2xl py-4 text-sm font-black text-black mb-3"
          style={{ background: "linear-gradient(135deg,#C9A84C,#E2C06D)" }}>
          Open Web App Now
        </button>
        <button onClick={() => setRedirecting(false)}
          className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
          Cancel
        </button>
      </div>
    );
  }

  /* ── Desktop / manual selection screen ── */
  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20 pb-12">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-md px-5">

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-5 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[28px]"
              style={{ background: "linear-gradient(135deg,#C9A84C,#A8882F)", boxShadow: "0 0 60px rgba(201,168,76,0.35)" }}>
              <Crown className="h-12 w-12 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            <span style={{ background: "linear-gradient(135deg,#C9A84C,#E2C06D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              WatchSnap
            </span>
          </h1>
          <p className="text-gray-400 text-base">AI watch authentication & valuation</p>
        </div>

        {/* Feature pills */}
        <div className="mb-8 space-y-2.5">
          {features.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 rounded-2xl border border-[#1E1E1E] bg-[#111111] px-4 py-3.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/15">
                <Icon className="h-4.5 w-4.5 text-[#C9A84C]" style={{ height: 18, width: 18 }} />
              </div>
              <span className="text-sm font-semibold text-gray-200">{text}</span>
            </div>
          ))}
        </div>

        {/* Platform detection badge */}
        {platform !== "unknown" && (
          <div className="mb-4 flex items-center justify-center gap-2 rounded-xl border border-[#1E1E1E] bg-[#0D0D0D] px-4 py-2.5">
            <Monitor className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs text-gray-500 font-semibold">Detected: {platform === "desktop" ? "Desktop / Laptop" : platform}</span>
          </div>
        )}

        {/* Download options */}
        <div className="space-y-3 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 px-1 mb-3">Choose your platform</p>

          {/* Android — Google Play */}
          <div className="space-y-1">
            <PlayStoreBadge onClick={goPlay} />
            <p className="text-center text-[10px] text-gray-600">Android 8.0+ · Free download · In-app purchases</p>
          </div>

          {/* Web App */}
          <div className="space-y-1">
            <WebAppBadge onClick={goWeb} />
            <p className="text-center text-[10px] text-gray-600">Works on any browser · No install needed</p>
          </div>

          {/* iOS — coming soon chip */}
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[#2A2A2A] bg-[#0D0D0D] px-6 py-4 opacity-60">
            <svg viewBox="0 0 24 24" className="h-7 w-7 flex-shrink-0 text-gray-500" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">App Store</p>
              <p className="text-base font-black text-gray-500 leading-tight">iOS — Coming Soon</p>
            </div>
            <span className="ml-auto rounded-full bg-[#1E1E1E] px-2.5 py-1 text-[9px] font-black text-gray-600 uppercase tracking-wider">Soon</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-center">
          {[
            { value: "10K+",  label: "Watches Scanned" },
            { value: "98%",   label: "Accuracy Rate"   },
            { value: "4.8★",  label: "User Rating"     },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-2xl border border-[#1E1E1E] bg-[#111111] py-4 px-2">
              <p className="text-xl font-black" style={{ background: "linear-gradient(135deg,#C9A84C,#E2C06D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {value}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <div className="text-center space-y-3">
          <Link href="/scan"
            className="inline-flex items-center gap-1.5 text-sm text-[#C9A84C] font-semibold hover:text-[#E2C06D] transition-colors">
            Try in browser without installing <ChevronRight className="h-4 w-4" />
          </Link>
          <br />
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
