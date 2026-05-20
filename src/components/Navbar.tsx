"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Crown, Home, Camera, BookMarked, Download } from "lucide-react";
import clsx from "clsx";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { InstallBanner } from "@/components/InstallBanner";
import { DevMenu } from "@/components/DevMenu";

export function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { canInstall, isIOS, isInstalled, install } = usePWAInstall();
  const [showIOSModal,  setShowIOSModal]  = useState(false);
  const [showDevMenu,   setShowDevMenu]   = useState(false);
  const [tapFeedback,   setTapFeedback]   = useState(0);   // 1-6 shows counter badge
  const [userIsPro,     setUserIsPro]     = useState(false);
  const tapCountRef        = useRef(0);

  // Keep Pro badge in sync with localStorage (current tab + other tabs + focus-on-return)
  useEffect(() => {
    const checkPro = () => {
      try { setUserIsPro(localStorage.getItem("watchsnap_pro") === "1"); } catch { /* ignore */ }
    };
    checkPro();
    window.addEventListener("storage", checkPro);
    window.addEventListener("focus",   checkPro);
    return () => {
      window.removeEventListener("storage", checkPro);
      window.removeEventListener("focus",   checkPro);
    };
  }, []);
  const tapTimerRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = useCallback(() => {
    tapCountRef.current += 1;
    const count = tapCountRef.current;

    // Short haptic pulse on supported devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(25);
    }

    // Show tap counter badge (disappears after 1500 ms of inactivity)
    setTapFeedback(count);
    if (tapFeedbackTimerRef.current) clearTimeout(tapFeedbackTimerRef.current);
    tapFeedbackTimerRef.current = setTimeout(() => setTapFeedback(0), 1500);

    // Clear main idle timer
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (count >= 7) {
      // 7 taps → open dev menu
      tapCountRef.current = 0;
      setTapFeedback(0);
      if (tapFeedbackTimerRef.current) clearTimeout(tapFeedbackTimerRef.current);
      setShowDevMenu(true);
      return;
    }

    // After 1500 ms with no further taps → treat as regular logo tap (navigate home)
    tapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current === 1) router.push("/");
      tapCountRef.current = 0;
      setTapFeedback(0);
    }, 1500);
  }, [router]);

  const showInstallBtn = !isInstalled && (canInstall || isIOS);

  const tabs = [
    { href: "/",        label: "Home",       Icon: Home       },
    { href: "/scan",    label: "Scan",        Icon: Camera     },
    { href: "/history", label: "Collection",  Icon: BookMarked },
  ];

  async function handleNavInstall() {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    await install();
  }

  return (
    <>
      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1E1E1E] bg-[#0A0A0A]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-14 sm:h-16">

          {/* Logo — single tap navigates home; 7 rapid taps opens dev menu */}
          <button
            type="button"
            onClick={handleLogoTap}
            className="relative flex items-center gap-2 select-none focus:outline-none"
          >
            <div className="relative">
              <Image
                src="/icons/icon-192.png"
                alt="WatchSnap"
                width={32}
                height={32}
                className="rounded-full"
              />
              {/* Tap counter badge — visible while tapping (1–6) */}
              {tapFeedback > 0 && tapFeedback < 7 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#C9A84C] text-[9px] font-black text-black leading-none pointer-events-none">
                  {tapFeedback}
                </span>
              )}
            </div>
            <span className="text-lg font-bold tracking-tight">
              Watch<span className="text-gradient-gold">Snap</span>
            </span>
          </button>

          {/* Desktop nav links */}
          <div className="hidden sm:flex items-center gap-6">
            {tabs.map(({ href, label }) => (
              <Link key={href} href={href}
                className={clsx("text-sm font-medium transition-colors",
                  pathname === href ? "text-[#C9A84C]" : "text-gray-400 hover:text-white")}>
                {label}
              </Link>
            ))}
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-2">
            {/* 📲 Install App button — shown when installable */}
            {showInstallBtn && (
              <button
                onClick={handleNavInstall}
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-3 py-1.5 text-xs font-bold text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-all"
                title="Install WatchSnap app"
              >
                <Download className="h-3.5 w-3.5" />
                Install App
              </button>
            )}

            {/* Upgrade / Pro badge */}
            {userIsPro ? (
              <div className="flex items-center gap-1.5 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 px-4 py-2 text-xs font-bold text-[#C9A84C]">
                <Crown className="h-3.5 w-3.5" />
                Pro ✓
              </div>
            ) : (
              <Link href="/paywall"
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#A8882F] px-4 py-2 text-xs font-bold text-black hover:opacity-90 transition-opacity">
                <Crown className="h-3.5 w-3.5" />
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#1E1E1E] bg-[#0A0A0A]/95 backdrop-blur-md pb-safe">
        <div className="flex">
          {tabs.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className={clsx("flex flex-1 flex-col items-center justify-center gap-1 py-3 transition-colors",
                pathname === href ? "text-[#C9A84C]" : "text-gray-500")}>
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          ))}

          {/* Install tab — shown when installable on mobile */}
          {showInstallBtn && (
            <button
              onClick={handleNavInstall}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-[#C9A84C] transition-colors"
            >
              <Download className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Install</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS install modal (triggered from navbar) */}
      <InstallBanner
        show={showIOSModal}
        forceShow
        onClose={() => setShowIOSModal(false)}
      />

      {/* Secret dev menu — unlocked by tapping logo 7× */}
      <DevMenu open={showDevMenu} onClose={() => setShowDevMenu(false)} />
    </>
  );
}
