import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { PwaInit } from "@/components/PwaInit";
import { DevReset } from "@/components/DevReset";
import { InitialPaywallModal } from "@/components/InitialPaywallModal";

export const metadata: Metadata = {
  metadataBase: new URL("https://watchsnap.vercel.app"),
  title: {
    default: "WatchSnap — AI Watch Identifier & Value Estimator",
    template: "%s | WatchSnap",
  },
  description: "Instantly identify any watch with AI. Get brand, model, market value and authentication check. Try free — 3 scans on us.",
  keywords: [
    "watch identifier", "AI watch", "luxury watch identifier", "watch authentication",
    "watch value estimator", "rolex identifier", "watch scanner", "fake watch detector",
    "watch price checker", "vintage watch identifier",
  ],
  manifest: "/manifest.json",

  /* ── iOS PWA ── */
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "WatchSnap",
    startupImage: [{ url: "/icons/icon-512.png" }],
  },

  /* ── Icons ── */
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/icons/icon-192.png",
  },

  /* ── Open Graph (WhatsApp / Facebook) ── */
  openGraph: {
    title: "WatchSnap — AI Watch Identifier & Value Estimator",
    description: "Snap a photo of any watch. Get brand, model, market value & authentication in seconds. Try free.",
    url: "https://watchsnap.vercel.app",
    siteName: "WatchSnap",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://watchsnap.vercel.app/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "WatchSnap — AI Watch Identifier",
      },
    ],
  },

  /* ── Twitter / X Card ── */
  twitter: {
    card: "summary_large_image",
    title: "WatchSnap — AI Watch Identifier & Value Estimator",
    description: "Snap a photo of any watch. Get brand, model, market value & authentication in seconds. Try free.",
    images: ["https://watchsnap.vercel.app/icons/icon-512.png"],
    creator: "@watchsnapapp",
    site: "@watchsnapapp",
  },

  /* ── Robots ── */
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },

  /* ── Verification (add when available) ── */
  // verification: { google: "YOUR_GSC_TOKEN" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "dark" }}>
      <head>
        {/* iOS PWA additional meta tags */}
        <meta name="theme-color" content="#0A0A0A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WatchSnap" />
        <meta name="application-name" content="WatchSnap" />
        <meta name="msapplication-TileColor" content="#0A0A0A" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        {/*
          CRITICAL: Capture beforeinstallprompt BEFORE React hydrates.
          This runs synchronously as HTML is parsed — guaranteed to run
          before any React useEffect, so we never miss the event.
        */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            function capture(e) {
              e.preventDefault();
              window.__wsPrompt = e;
              window.dispatchEvent(new Event('ws-install-ready'));
              window.removeEventListener('beforeinstallprompt', capture);
            }
            window.addEventListener('beforeinstallprompt', capture);
          })();
        `}} />
      </head>
      <body className="min-h-screen bg-[#0A0A0A] text-white antialiased">
        {/* overflow-x-hidden on wrapper div (not body) — avoids breaking
            Capacitor WebView's vertical scroll container on body */}
        <div className="overflow-x-hidden">
          <PwaInit />
          <DevReset />
          <InitialPaywallModal />
          <Navbar />
          {/* Extra bottom padding on mobile for bottom tab bar */}
          <main className="sm:pb-0 pb-20">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
