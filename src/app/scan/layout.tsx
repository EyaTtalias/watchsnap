import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scan a Watch — WatchSnap",
  description: "Instantly identify any watch with AI. Get brand, model, market value and authentication check. Try free — 3 scans on us.",
  openGraph: {
    title: "Scan a Watch — WatchSnap AI",
    description: "Point your camera at any watch and get brand, model, market value and authentication in under 15 seconds.",
    url: "https://watchsnap.vercel.app/scan",
    siteName: "WatchSnap",
    images: [{ url: "https://watchsnap.vercel.app/icons/icon-512.png", width: 512, height: 512, alt: "WatchSnap AI Watch Scanner" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scan a Watch — WatchSnap AI",
    description: "Point your camera at any watch and get brand, model, market value and authentication in under 15 seconds.",
    images: ["https://watchsnap.vercel.app/icons/icon-512.png"],
  },
};

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
