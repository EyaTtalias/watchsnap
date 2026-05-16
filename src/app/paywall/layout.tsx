import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade to Pro — WatchSnap",
  description: "Unlock unlimited watch scans, full market value data, and 30-point authentication. Start your 7-day free trial today.",
  openGraph: {
    title: "Upgrade to WatchSnap Pro",
    description: "Unlock unlimited watch scans, full market value data, and 30-point authentication. Start your 7-day free trial today.",
    url: "https://watchsnap.vercel.app/paywall",
    siteName: "WatchSnap",
    images: [{ url: "https://watchsnap.vercel.app/icons/icon-512.png", width: 512, height: 512, alt: "WatchSnap Pro" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upgrade to WatchSnap Pro",
    description: "Unlock unlimited scans, market value data, and 30-point authentication. 7-day free trial.",
    images: ["https://watchsnap.vercel.app/icons/icon-512.png"],
  },
  robots: { index: false, follow: false },
};

export default function PaywallLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
