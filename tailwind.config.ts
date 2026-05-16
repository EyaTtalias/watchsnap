import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // 'class' strategy: Tailwind dark: variants only activate when
  // the 'dark' class is on <html>. Prevents OS dark-mode from
  // accidentally overriding the app's hardcoded dark palette.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E2C06D",
          dark: "#A8882F",
        },
        dark: {
          DEFAULT: "#0A0A0A",
          card: "#111111",
          border: "#1E1E1E",
          muted: "#2A2A2A",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        serif: ["Georgia", "serif"],
      },
      animation: {
        "scan-line": "scanLine 2s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        scanLine: {
          "0%": { top: "0%", opacity: "1" },
          "50%": { top: "100%", opacity: "0.5" },
          "100%": { top: "0%", opacity: "1" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201,168,76,0.4)" },
          "50%": { boxShadow: "0 0 0 20px rgba(201,168,76,0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)",
        "dark-gradient": "linear-gradient(180deg, #0A0A0A 0%, #111111 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
