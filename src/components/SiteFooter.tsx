import Link from "next/link";
import { Clock } from "lucide-react";

/**
 * Shared site-wide footer — included on every page.
 * Dark luxury design with gold accents and legal links.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-[#1E1E1E] bg-[#080808] mt-auto">
      {/* Main row */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#A8882F] group-hover:opacity-90 transition-opacity">
              <Clock className="h-4 w-4 text-black" />
            </div>
            <span className="text-base font-black text-white">
              Watch<span className="text-gradient-gold">Snap</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/scan"     className="text-sm text-gray-500 hover:text-[#C9A84C] transition-colors">Scan</Link>
            <Link href="/history"  className="text-sm text-gray-500 hover:text-[#C9A84C] transition-colors">Collection</Link>
            <Link href="/paywall"  className="text-sm text-gray-500 hover:text-[#C9A84C] transition-colors">Pricing</Link>
            <Link href="/landing"  className="text-sm text-gray-500 hover:text-[#C9A84C] transition-colors">About</Link>
          </nav>

          {/* Legal links */}
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy"  className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Privacy Policy</Link>
            <Link href="/terms"    className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Terms of Service</Link>
            <Link href="/refund"   className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Refund Policy</Link>
            <a    href="mailto:watchsnapapp@gmail.com" className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Contact</a>
          </nav>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-[#111111]">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-700">© 2026 WatchSnap. All rights reserved.</p>
          <p className="text-xs text-gray-700">Powered by Claude AI · Payments by Paddle</p>
        </div>
      </div>
    </footer>
  );
}
