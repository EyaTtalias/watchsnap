import Link from "next/link";
import { WifiOff, Camera } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#1E1E1E] bg-[#111111]">
        <WifiOff className="h-12 w-12 text-gray-600" />
      </div>
      <h1 className="mb-3 text-3xl font-black text-white">You&apos;re Offline</h1>
      <p className="mb-8 text-gray-500 max-w-xs leading-relaxed">
        WatchSnap needs an internet connection to identify watches.
        Please check your connection and try again.
      </p>
      <Link
        href="/scan"
        className="flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-black text-black transition-all hover:scale-105"
        style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}
      >
        <Camera className="h-5 w-5" />
        Try Again
      </Link>
    </div>
  );
}
