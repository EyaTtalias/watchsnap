/** @type {import('next').NextConfig} */

const isCapacitorBuild = process.env.BUILD_TARGET === "capacitor";

const nextConfig = {
  // Static export only when building for Capacitor (Android/iOS).
  // Normal `npm run build` keeps server-side API routes alive on Vercel.
  ...(isCapacitorBuild ? { output: "export", trailingSlash: true } : {}),

  images: {
    remotePatterns: [],
    // next/image optimisation requires a server; disable it in the static bundle.
    ...(isCapacitorBuild ? { unoptimized: true } : {}),
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

module.exports = nextConfig;
