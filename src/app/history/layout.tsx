import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Collection — WatchSnap",
  description: "Browse your saved watch scans. View brand, model, market value, and authentication status for every watch in your collection.",
  openGraph: {
    title: "My Watch Collection — WatchSnap",
    description: "Browse your saved watch scans. View brand, model, market value, and authentication status for every watch in your collection.",
    url: "https://watchsnap.vercel.app/history",
    siteName: "WatchSnap",
    images: [{ url: "https://watchsnap.vercel.app/icons/icon-512.png", width: 512, height: 512, alt: "WatchSnap Watch Collection" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Watch Collection — WatchSnap",
    description: "Browse your saved watch scans with full market value and authentication status.",
    images: ["https://watchsnap.vercel.app/icons/icon-512.png"],
  },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
