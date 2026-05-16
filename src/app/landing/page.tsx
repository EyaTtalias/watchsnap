import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera, Shield, TrendingUp, Clock, Star, CheckCircle,
  ArrowRight, Crown, Check, Lock, CreditCard, ChevronDown,
  Scan, DollarSign, Users, Zap,
} from "lucide-react";
import { StatsCounter } from "@/components/StatsCounter";

export const metadata: Metadata = {
  title: "WatchSnap — AI Watch Identifier & Value Estimator",
  description: "Instantly identify any watch with AI. Get brand, model, market value and authentication check. Try free — 3 scans on us.",
  alternates: { canonical: "https://watchsnap.vercel.app/landing" },
  openGraph: {
    title: "WatchSnap — AI Watch Identifier & Value Estimator",
    description: "Snap a photo of any watch. Get brand, model, market value & authentication in seconds. Free to try.",
    url: "https://watchsnap.vercel.app/landing",
    siteName: "WatchSnap",
    images: [{ url: "https://watchsnap.vercel.app/icons/icon-512.png", width: 512, height: 512, alt: "WatchSnap AI Watch Identifier" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WatchSnap — AI Watch Identifier & Value Estimator",
    description: "Snap a photo of any watch. Get brand, model, market value & authentication in seconds. Free to try.",
    images: ["https://watchsnap.vercel.app/icons/icon-512.png"],
  },
};

/* ─── DATA ─── */
const features = [
  {
    icon: Scan,
    emoji: "🔍",
    title: "Instant Identification",
    desc: "Snap any watch — our AI returns brand, model, reference number, and production year in under 15 seconds. Over 1,000 brands covered.",
    color: "text-[#C9A84C]",
    bg: "bg-[#C9A84C]/10",
    border: "border-[#C9A84C]/25",
    glow: "rgba(201,168,76,0.12)",
  },
  {
    icon: DollarSign,
    emoji: "💰",
    title: "Live Market Value",
    desc: "Real-time pricing from Chrono24, eBay, and auction houses worldwide. Know exactly what your watch is worth before you buy or sell.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/25",
    glow: "rgba(52,211,153,0.10)",
  },
  {
    icon: Shield,
    emoji: "🛡️",
    title: "Authenticate It",
    desc: "30-point AI authentication check catches replicas and counterfeits instantly. Never get scammed on a fake watch again.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/25",
    glow: "rgba(96,165,250,0.10)",
  },
];

const steps = [
  {
    number: "01",
    title: "Take a Photo",
    desc: "Use your phone camera live or upload any existing image. Any angle works — dial, side, caseback, or box.",
    icon: Camera,
    detail: "Works with blurry or vintage photos too",
  },
  {
    number: "02",
    title: "AI Analyses It",
    desc: "Our model cross-references 10,000+ reference points: dial text, crown shape, bezel, hands, case proportions and more.",
    icon: Scan,
    detail: "Results in under 15 seconds",
  },
  {
    number: "03",
    title: "Get Your Full Report",
    desc: "Brand, model, reference number, production years, current market value range, and a full authenticity verdict.",
    icon: CheckCircle,
    detail: "Download or save to your Collection",
  },
];

const testimonials = [
  {
    name: "James M.",
    role: "Watch Collector · London",
    avatar: "JM",
    stars: 5,
    highlight: "Found a $14,000 Rolex",
    text: "Scanned my grandfather's old watch and discovered it's a 1967 Rolex Submariner 5512 worth over $14,000. WatchSnap completely changed how I look at vintage watches. Absolutely mind-blowing.",
  },
  {
    name: "Sarah K.",
    role: "Vintage Dealer · New York",
    avatar: "SK",
    stars: 5,
    highlight: "Saves hours every day",
    text: "I use WatchSnap at my shop every single day. It cuts hours of research down to seconds and my clients love the instant on-the-spot valuation. An absolute must-have for any serious dealer.",
  },
  {
    name: "David L.",
    role: "Watch Enthusiast · Sydney",
    avatar: "DL",
    stars: 5,
    highlight: "Caught a fake instantly",
    text: "Was about to buy a 'Patek Philippe' at a flea market for $200. WatchSnap flagged it as a replica in 10 seconds flat. Saved me from a very costly mistake — the app paid for itself immediately.",
  },
];

const faqs = [
  {
    q: "How accurate is WatchSnap?",
    a: "WatchSnap achieves over 98% identification accuracy on clear photos of luxury and vintage watches. The AI has been trained on thousands of reference timepieces across 1,000+ brands. For very obscure or low-quality images, we'll tell you so — we never guess blindly.",
  },
  {
    q: "Does it work on fakes and replicas?",
    a: "Yes — that's one of WatchSnap's most popular features. Our 30-point authentication check analyses dial printing quality, crown logo sharpness, bezel alignment, hand finishing, and bracelet construction to detect replicas with high confidence.",
  },
  {
    q: "What watches does it support?",
    a: "Over 1,000 brands are supported — including Rolex, Patek Philippe, Audemars Piguet, Omega, IWC, Breitling, Cartier, TAG Heuer, Longines, Tissot, Seiko, Citizen, and hundreds more. Both luxury and affordable brands are covered.",
  },
  {
    q: "Do I need to create an account?",
    a: "No account is required for your first 3 free scans. To save scans to your Collection and unlock unlimited scans, you can upgrade to Pro — still no account setup, just a quick checkout.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We offer a 30-day money-back guarantee on all paid plans — no questions asked. If WatchSnap doesn't deliver what we promise, just email watchsnapapp@gmail.com and you'll get a full refund within 24 hours.",
  },
];

const stats = [
  { value: "50,000+", label: "Watches Scanned" },
  { value: "98%",     label: "ID Accuracy"     },
  { value: "1,000+",  label: "Brands Covered"  },
  { value: "< 15s",   label: "Average Result"  },
];

/* ─── PAGE ─── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-x-hidden text-white">

      {/* Smooth-scroll anchor links — overlaid on global Navbar */}
      <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
        <div className="mx-auto flex max-w-6xl items-center justify-end px-4 h-14 sm:h-16 pointer-events-auto">
          <div className="hidden sm:flex items-center gap-5 text-sm text-gray-400">
            <a href="#features"     className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing"      className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq"          className="hover:text-white transition-colors">FAQ</a>
          </div>
        </div>
      </div>

      {/* ─── HERO ─── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-20 text-center">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 90% 55% at 50% -5%, rgba(201,168,76,0.20) 0%, transparent 65%)" }} />
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-[32rem] bg-gradient-to-r from-transparent via-[#C9A84C]/25 to-transparent" />

        {/* Live badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
          <span className="text-xs font-semibold text-[#C9A84C]">Powered by Claude AI · 50,000+ Watches Identified</span>
        </div>

        {/* Headline */}
        <h1 className="mb-5 max-w-xs text-5xl font-black leading-[1.04] tracking-tight sm:max-w-4xl sm:text-[4.5rem] lg:text-[5.5rem]">
          Identify Any Watch<br className="hidden sm:block" />{" "}
          <span className="text-gradient-gold">Instantly with AI</span>
        </h1>

        <p className="mb-3 max-w-sm text-lg text-gray-300 sm:max-w-xl sm:text-xl leading-relaxed font-medium">
          Scan any watch. Get brand, model, market value &amp; authentication in seconds.
        </p>

        {/* Social proof */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex -space-x-2">
            {["JM", "SK", "DL", "ER", "MT"].map((initials, i) => (
              <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0A0A0A] bg-[#C9A84C]/20 text-[9px] font-black text-[#C9A84C]">
                {initials}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />
            ))}
          </div>
          <p className="text-sm text-gray-400 font-medium">
            Join <span className="text-white font-black">1,000+</span> watch enthusiasts
          </p>
        </div>

        {/* CTAs */}
        <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <Link href="/scan"
            className="group relative flex items-center justify-center gap-2.5 rounded-2xl px-10 py-4 text-lg font-black text-black shadow-2xl shadow-[#C9A84C]/25 transition-all active:scale-95 hover:scale-105 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)" }}>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Camera className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Try Free — 3 Scans on Us</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1 relative z-10" />
          </Link>
          <a href="#pricing"
            className="flex items-center justify-center gap-2 rounded-2xl border border-[#2A2A2A] bg-[#111111] px-8 py-4 text-base font-semibold text-gray-300 hover:border-[#C9A84C]/30 hover:text-white transition-all">
            <Crown className="h-4 w-4 text-[#C9A84C]" />
            View Pricing
          </a>
        </div>

        <p className="mt-4 text-xs text-gray-600">No sign-up required · No credit card · Results in under 15 seconds</p>

        {/* Animated watch graphic */}
        <div className="relative mt-16 h-52 w-52 sm:h-64 sm:w-64">
          <div className="absolute inset-0 rounded-full border border-[#C9A84C]/12 animate-spin" style={{ animationDuration: "25s" }} />
          <div className="absolute inset-3 rounded-full border border-[#C9A84C]/20 animate-spin" style={{ animationDuration: "18s", animationDirection: "reverse" }} />
          <div className="absolute inset-8 rounded-full border border-[#1E1E1E] bg-[#111111] flex items-center justify-center shadow-2xl">
            <div className="text-center">
              <Clock className="h-16 w-16 sm:h-20 sm:w-20 text-[#C9A84C]/55 mx-auto" />
              <p className="text-[10px] font-bold text-[#C9A84C]/40 mt-1.5 uppercase tracking-widest hidden sm:block">AI Ready</p>
            </div>
          </div>
          <div className="absolute inset-0 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.7) 0%, transparent 65%)" }} />
        </div>

        {/* Scroll hint */}
        <a href="#features" className="mt-10 flex flex-col items-center gap-2 opacity-40 hover:opacity-70 transition-opacity">
          <div className="h-10 w-6 rounded-full border border-gray-600 flex items-start justify-center pt-2">
            <div className="h-2 w-1 rounded-full bg-gray-400 animate-bounce" />
          </div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">Scroll</p>
        </a>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-y border-[#1E1E1E] bg-[#0D0D0D] py-14">
        <div className="mx-auto max-w-4xl px-4">
          <StatsCounter />
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">What You Get</p>
            <h2 className="text-4xl font-black sm:text-5xl">
              Three Tools.<br />
              <span className="text-gradient-gold">One Scan.</span>
            </h2>
            <p className="mt-4 text-gray-400 text-base max-w-lg mx-auto leading-relaxed">
              WatchSnap combines identification, valuation, and authentication into a single instant report.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {features.map(({ icon: Icon, emoji, title, desc, color, bg, border, glow }) => (
              <div key={title}
                className={`group relative rounded-3xl border ${border} bg-[#111111] p-7 hover:-translate-y-1 transition-all duration-200 overflow-hidden`}>
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-3xl"
                  style={{ boxShadow: `inset 0 0 40px ${glow}` }} />
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${bg} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <h3 className="font-black text-lg">{title}</h3>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Mini feature list */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              "1,000+ Brands",
              "Vintage Watches",
              "Works Offline",
              "Instant Results",
              "Save Collection",
              "Replica Detection",
              "Market Data",
              "No Account Needed",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-[#1E1E1E] bg-[#0D0D0D] px-3 py-2.5">
                <CheckCircle className="h-3.5 w-3.5 text-[#C9A84C] flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-400">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-4 bg-[#0D0D0D] border-y border-[#1E1E1E]">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">How It Works</p>
            <h2 className="text-4xl font-black sm:text-5xl">Three Steps.<br />Full Report.</h2>
            <p className="mt-4 text-gray-400 text-base">No expertise needed. Just take a photo.</p>
          </div>

          <div className="relative">
            {steps.map(({ number, title, desc, icon: Icon, detail }, i) => (
              <div key={number} className="flex gap-6 group">
                {/* Left column — step indicator */}
                <div className="flex flex-col items-center">
                  <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 shadow-lg shadow-[#C9A84C]/5 group-hover:border-[#C9A84C]/60 transition-colors">
                    <Icon className="h-6 w-6 text-[#C9A84C]" />
                    <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0A0A0A] border border-[#C9A84C]/40">
                      <span className="text-[9px] font-black text-[#C9A84C]">{i + 1}</span>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mt-2 h-14 w-px bg-gradient-to-b from-[#C9A84C]/30 to-transparent" />
                  )}
                </div>

                {/* Right column — content */}
                <div className="pb-10 pt-2.5">
                  <span className="text-xs font-black text-[#C9A84C]/40 uppercase tracking-widest">{number}</span>
                  <h3 className="font-black text-xl mt-0.5 mb-2">{title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm mb-2">{desc}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C]/8 border border-[#C9A84C]/20 px-3 py-1 text-[10px] font-bold text-[#C9A84C]">
                    <Zap className="h-3 w-3" /> {detail}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-2">
            <Link href="/scan"
              className="inline-flex items-center gap-2.5 rounded-2xl px-10 py-4 text-base font-black text-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#C9A84C]/15"
              style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)" }}>
              <Camera className="h-5 w-5" />
              Try It Now — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">Reviews</p>
            <h2 className="text-4xl font-black sm:text-5xl">Trusted by Watch Lovers Worldwide</h2>
            <div className="mt-4 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-[#C9A84C] text-[#C9A84C]" />)}
              <span className="ml-2 text-base text-gray-400 font-medium">4.9 / 5</span>
              <span className="ml-2 text-sm text-gray-600">· 200+ reviews</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {testimonials.map(({ name, role, avatar, stars, highlight, text }) => (
              <div key={name}
                className="rounded-2xl border border-[#1E1E1E] bg-[#111111] p-6 flex flex-col gap-4 hover:border-[#C9A84C]/25 hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-0.5">
                  {[...Array(stars)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />)}
                </div>
                {/* Highlight pill */}
                <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-3 py-1">
                  <span className="text-[10px] font-black text-[#C9A84C] uppercase tracking-wide">{highlight}</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-[#1E1E1E]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C9A84C]/15 text-[#C9A84C] text-sm font-black flex-shrink-0">
                    {avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{name}</p>
                    <p className="text-xs text-gray-500 truncate">{role}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-24 px-4 bg-[#0D0D0D] border-y border-[#1E1E1E]">
        <div className="mx-auto max-w-3xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">Pricing</p>
            <h2 className="text-4xl font-black sm:text-5xl">Simple, Honest Pricing</h2>
            <p className="mt-4 text-gray-400 text-base">Start free. Upgrade when you&apos;re ready. Cancel anytime.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* Free Trial */}
            <div className="relative overflow-hidden rounded-3xl border border-[#C9A84C]/40 bg-[#111111] flex flex-col"
              style={{ boxShadow: "0 0 60px rgba(201,168,76,0.08)" }}>
              <div className="bg-gradient-to-r from-[#C9A84C] to-[#E2C06D] px-5 py-3 text-center">
                <p className="text-xs font-black text-black tracking-wide">✨ Most Popular · 7-Day Free Trial</p>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C9A84C] mb-2">Monthly Plan</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">$9.99</span>
                  <span className="text-gray-400 text-base mb-1">/month</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">After 7-day free trial · Cancel anytime</p>
                <div className="mb-5 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/20 p-3 text-center">
                  <p className="text-xs text-[#C9A84C] font-semibold flex items-center justify-center gap-1.5">
                    <Lock className="h-3 w-3" /> Card saved — not charged yet
                  </p>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {[
                    "Unlimited watch scans",
                    "Full market value data",
                    "30-point authentication",
                    "My Collection portfolio",
                    "Priority AI analysis",
                    "Early access to features",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15">
                        <Check className="h-3 w-3 text-[#C9A84C]" />
                      </div>
                      <span className="text-sm text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/paywall"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)" }}>
                  <CreditCard className="h-4 w-4" />
                  Start Free Trial
                </Link>
                <p className="mt-2 text-center text-[10px] text-gray-600">Cancel before trial ends — no charge</p>
              </div>
            </div>

            {/* Annual */}
            <div className="relative overflow-hidden rounded-3xl border border-[#2A2A2A] bg-[#0D0D0D] flex flex-col">
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 px-5 py-3 text-center">
                <p className="text-xs font-black text-white tracking-wide">🏆 Best Value · Save 50%</p>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-2">Annual Plan</p>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-black text-white">$59.99</span>
                  <span className="text-gray-400 text-base mb-1">/year</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 line-through">$119.88/yr</span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-400">Save 50%</span>
                </div>
                <div className="mb-5 rounded-xl bg-emerald-500/8 border border-emerald-500/20 p-3 text-center">
                  <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5">
                    <Lock className="h-3 w-3" /> 7-day free trial included
                  </p>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {[
                    "Everything in monthly",
                    "50% off vs monthly billing",
                    "Instant full access",
                    "30-day money-back guarantee",
                    "Priority support",
                    "Annual receipt for expenses",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                        <Check className="h-3 w-3 text-emerald-400" />
                      </div>
                      <span className="text-sm text-gray-300">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/paywall"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-emerald-400 border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all active:scale-[0.98]">
                  <Crown className="h-4 w-4" />
                  Get Annual Access
                </Link>
                <p className="mt-2 text-center text-[10px] text-gray-600">30-day money-back guarantee</p>
              </div>
            </div>
          </div>

          {/* Free note */}
          <div className="mt-6 rounded-2xl border border-[#1E1E1E] bg-[#111111] p-5 text-center">
            <p className="text-sm text-gray-400">
              <span className="font-bold text-white">Not ready yet?</span> No problem.
              Your first <span className="text-[#C9A84C] font-bold">3 scans are completely free</span> — no account, no card required.
            </p>
            <Link href="/scan" className="mt-2 inline-flex items-center gap-1.5 text-sm text-[#C9A84C] font-semibold hover:underline">
              Try it free now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-14 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">FAQ</p>
            <h2 className="text-4xl font-black sm:text-5xl">Common Questions</h2>
            <p className="mt-4 text-gray-400 text-base">Everything you need to know before scanning your first watch.</p>
          </div>

          <div className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <details key={i} className="group rounded-2xl border border-[#1E1E1E] bg-[#111111] overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 list-none">
                  <span className="font-bold text-white text-sm sm:text-base">{q}</span>
                  <ChevronDown className="h-5 w-5 text-[#C9A84C] flex-shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="border-t border-[#1E1E1E] px-6 py-5">
                  <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-[#C9A84C]/20 bg-[#111111] p-6 text-center">
            <p className="text-sm text-gray-400 mb-3">
              Still have questions? We&apos;re happy to help.
            </p>
            <a href="mailto:watchsnapapp@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#C9A84C] hover:underline">
              Contact watchsnapapp@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-24 px-4 bg-[#0D0D0D] border-t border-[#1E1E1E]">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)", boxShadow: "0 0 80px rgba(201,168,76,0.35)" }}>
              <Clock className="h-12 w-12 text-black" />
            </div>
          </div>
          <h2 className="mb-4 text-4xl font-black sm:text-5xl leading-tight">
            Your Watch Has a Story.<br />
            <span className="text-gradient-gold">Find Out What It&apos;s Worth.</span>
          </h2>
          <p className="mb-8 text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
            Join 1,000+ collectors, dealers, and enthusiasts who trust WatchSnap for instant watch intelligence.
          </p>

          {/* Social proof bar */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">
              {["JM", "SK", "DL", "ER"].map((initials, i) => (
                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0D0D0D] bg-[#C9A84C]/20 text-[9px] font-black text-[#C9A84C]">
                  {initials}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />)}
            </div>
            <span className="text-sm text-gray-400">1,000+ happy users</span>
          </div>

          <Link href="/scan"
            className="inline-flex items-center gap-2.5 rounded-2xl px-12 py-5 text-lg font-black text-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[#C9A84C]/25"
            style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)" }}>
            <Camera className="h-6 w-6" />
            Try Free — 3 Scans on Us
          </Link>
          <p className="mt-4 text-xs text-gray-600">No sign-up · No credit card · Instant results</p>

          {/* Trust badges */}
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            {[
              { icon: "🔒", label: "SSL Encrypted" },
              { icon: "🛡️", label: "Paddle Secured" },
              { icon: "↩️", label: "30-Day Refund" },
              { icon: "🤖", label: "Claude AI" },
              { icon: "📱", label: "Works Offline" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                <span className="text-base">{icon}</span>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#1E1E1E] bg-[#080808] py-10 px-4">
        <div className="mx-auto max-w-lg text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#A8882F]">
              <Clock className="h-3.5 w-3.5 text-black" />
            </div>
            <span className="text-base font-bold tracking-tight">
              Watch<span className="text-gradient-gold">Snap</span>
            </span>
          </div>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            AI-powered watch identification, valuation, and authentication. Not affiliated with any watch brand or manufacturer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Privacy Policy</Link>
            <span className="text-gray-700">·</span>
            <Link href="/terms"   className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Terms of Service</Link>
            <span className="text-gray-700">·</span>
            <Link href="/refund"  className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Refund Policy</Link>
            <span className="text-gray-700">·</span>
            <a href="mailto:watchsnapapp@gmail.com" className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Contact</a>
          </div>
          <p className="text-xs text-gray-700 pt-2">© {new Date().getFullYear()} WatchSnap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
