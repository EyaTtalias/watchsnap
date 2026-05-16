"use client";

import { useEffect, useState } from "react";
import { X, Gift } from "lucide-react";
import Link from "next/link";

export function ExitIntentPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("ws_exit_shown")) return;

    const handle = (e: MouseEvent) => {
      if (e.clientY <= 2) {
        setShow(true);
        localStorage.setItem("ws_exit_shown", "1");
        document.removeEventListener("mouseleave", handle);
      }
    };
    document.addEventListener("mouseleave", handle);
    return () => document.removeEventListener("mouseleave", handle);
  }, []);

  const handleClaim = () => {
    try {
      localStorage.setItem("ws_exit_bonus", "1");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm rounded-3xl border border-[#C9A84C]/30 bg-[#111111] p-8 text-center"
        style={{ boxShadow: "0 0 80px rgba(201,168,76,0.18)" }}
      >
        <button
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/12">
            <Gift className="h-8 w-8 text-[#C9A84C]" />
          </div>
        </div>

        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Wait!</p>
        <h2 className="mb-2 text-2xl font-black">Get 1 Extra Free Scan</h2>
        <p className="mb-6 text-sm text-gray-400 leading-relaxed">
          Don&apos;t leave yet — claim your free bonus scan before you go.
          No sign-up, no credit card required.
        </p>

        <Link
          href="/scan"
          onClick={handleClaim}
          className="block w-full rounded-2xl py-4 text-base font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)" }}
        >
          Claim Free Scan →
        </Link>
        <button
          onClick={() => setShow(false)}
          className="mt-3 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          No thanks, I&apos;ll pass
        </button>
      </div>
    </div>
  );
}
