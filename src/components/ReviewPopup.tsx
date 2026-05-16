"use client";

import { X, Star } from "lucide-react";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.watchsnap.app";

export function ReviewPopup({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[100] sm:bottom-6 sm:left-auto sm:right-6 sm:w-80">
      <div
        className="relative rounded-2xl border border-[#C9A84C]/25 bg-[#111111] p-4 shadow-2xl"
        style={{ boxShadow: "0 0 40px rgba(201,168,76,0.10)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full text-gray-600 hover:text-white transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex gap-3 items-start">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#C9A84C]/12 text-lg">
            ⌚
          </div>
          <div className="flex-1 pr-4">
            <p className="text-sm font-black text-white mb-0.5">Enjoying WatchSnap?</p>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              It takes 10 seconds and means the world to us!
            </p>
            <div className="flex items-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[#C9A84C] text-[#C9A84C]" />
              ))}
            </div>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/12 px-3 py-2 text-xs font-bold text-[#C9A84C] hover:bg-[#C9A84C]/22 transition-all"
            >
              Rate on Google Play →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
