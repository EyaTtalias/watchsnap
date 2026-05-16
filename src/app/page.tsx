"use client";

import Link from "next/link";
import { Camera, Shield, TrendingUp, Clock, Star, Zap, CheckCircle, ArrowRight, ChevronRight } from "lucide-react";
import { HomeInstallBanner } from "@/components/HomeInstallBanner";

const testimonials = [
  {
    name: "James M.",
    role: "Watch Collector",
    avatar: "JM",
    stars: 5,
    text: "Scanned my grandfather's old watch and found out it's a 1967 Rolex Submariner worth over $14,000. Absolutely mind-blowing app.",
  },
  {
    name: "Sarah K.",
    role: "Vintage Dealer",
    stars: 5,
    avatar: "SK",
    text: "I use WatchSnap every day at my shop. Saves me hours of research and my clients love seeing the instant valuation.",
  },
  {
    name: "David L.",
    role: "Watch Enthusiast",
    stars: 5,
    avatar: "DL",
    text: "Was about to buy a 'Patek Philippe' at a flea market for $200. WatchSnap flagged it as a replica in seconds. Saved me from a scam.",
  },
  {
    name: "Emma R.",
    role: "Estate Attorney",
    stars: 5,
    avatar: "ER",
    text: "Essential tool for estate valuations. The authentication report is detailed and the market value is accurate. Highly recommend.",
  },
  {
    name: "Michael T.",
    role: "Insurance Broker",
    stars: 5,
    avatar: "MT",
    text: "We now require clients to use WatchSnap before insuring high-value timepieces. The 30-point auth report is thorough and reliable.",
  },
  {
    name: "Anna C.",
    role: "Luxury Reseller",
    stars: 5,
    avatar: "AC",
    text: "Closed a $8,500 deal because I could show the buyer a full authentication report on the spot. WatchSnap pays for itself instantly.",
  },
];

const features = [
  {
    icon: Zap,
    title: "Instant Identification",
    desc: "Snap a photo and get brand, model, reference number, and production year in under 15 seconds.",
    color: "text-[#C9A84C]",
    bg: "bg-[#C9A84C]/10",
  },
  {
    icon: TrendingUp,
    title: "Live Market Value",
    desc: "Real-time valuations powered by Chrono24 and eBay secondary-market data. Know exactly what your watch is worth.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    title: "Authentication Report",
    desc: "A full 30-point AI authentication check. Spot replicas and counterfeits before you buy or sell.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

const steps = [
  { number: "01", title: "Take a Photo", desc: "Use your camera or upload from your gallery. Any angle works — we handle the rest." },
  { number: "02", title: "AI Analyses It", desc: "Our AI cross-references 10,000+ reference points across thousands of luxury watch models." },
  { number: "03", title: "Get Full Report", desc: "Receive brand, model, market value, and a complete authentication status in seconds." },
];

const stats = [
  { value: "50,000+", label: "Watches Scanned" },
  { value: "98%",     label: "Accuracy Rate"   },
  { value: "1,000+",  label: "Brands Covered"  },
  { value: "< 15s",   label: "Average Result"  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16 text-center">
        {/* Glow */}
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.14) 0%, transparent 70%)" }} />

        {/* Badge */}
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/5 px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-pulse" />
          <span className="text-xs font-semibold text-[#C9A84C]">AI-Powered · 50,000+ Watches Identified</span>
        </div>

        {/* Headline */}
        <h1 className="mb-5 max-w-xs text-5xl font-black leading-[1.05] tracking-tight sm:max-w-3xl sm:text-7xl">
          Identify Any Watch.<br />
          <span className="text-gradient-gold">Instantly.</span>
        </h1>

        <p className="mb-8 max-w-sm text-base text-gray-400 sm:max-w-xl sm:text-lg leading-relaxed">
          Point your camera at any luxury or vintage watch and get the brand, model,
          market value, and authentication status in under 15 seconds.
        </p>

        {/* CTA */}
        <div className="flex w-full max-w-xs justify-center sm:max-w-none">
          <Link href="/scan"
            className="group flex items-center justify-center gap-2.5 rounded-2xl px-10 py-4 text-base font-black text-black shadow-lg shadow-[#C9A84C]/20 transition-all active:scale-95 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}>
            <Camera className="h-5 w-5" />
            Scan a Watch — Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-600">Free to use · No sign-up required · Results in seconds</p>

        {/* Watch icon graphic */}
        <div className="relative mt-14 h-44 w-44 sm:mt-16 sm:h-56 sm:w-56">
          <div className="absolute inset-0 rounded-full border-2 border-[#C9A84C]/20 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border border-[#C9A84C]/30" />
          <div className="absolute inset-6 rounded-full border border-[#1E1E1E] bg-[#111111] flex items-center justify-center shadow-2xl">
            <Clock className="h-14 w-14 text-[#C9A84C]/60 sm:h-16 sm:w-16" />
          </div>
          <div className="absolute inset-0 rounded-full opacity-30 blur-xl"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)" }} />
        </div>
      </section>

      {/* ── AS SEEN ON ── */}
      <section className="border-b border-[#1E1E1E] bg-[#080808] py-8 px-4">
        <div className="mx-auto max-w-3xl">
          <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-600">
            As Seen On
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { name: "Reddit",      sub: "r/Watches · r/WatchHorology" },
              { name: "WatchUSeek", sub: "World's #1 Watch Forum"       },
              { name: "Chrono24",   sub: "Global Watch Marketplace"     },
              { name: "eBay",       sub: "Luxury Watches Community"     },
            ].map(({ name, sub }) => (
              <div key={name} className="flex flex-col items-center gap-1 opacity-50 hover:opacity-80 transition-opacity">
                <span className="text-base font-black text-white tracking-tight">{name}</span>
                <span className="text-[9px] text-gray-600 uppercase tracking-wide">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-b border-[#1E1E1E] bg-[#0D0D0D] py-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-black text-gradient-gold sm:text-4xl">{value}</p>
                <p className="mt-1 text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">What You Get</p>
            <h2 className="text-3xl font-black sm:text-4xl">
              Professional Watch Intelligence,<br />
              <span className="text-gradient-gold">In Your Pocket</span>
            </h2>
          </div>
          <div className="space-y-4">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-start gap-4 rounded-2xl border border-[#1E1E1E] bg-[#111111] p-5 hover:border-[#C9A84C]/20 transition-colors">
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                  <h3 className="font-black text-base mb-1">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 bg-[#0D0D0D] border-y border-[#1E1E1E]">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">How It Works</p>
            <h2 className="text-3xl font-black sm:text-4xl">Three Steps to a Full Report</h2>
          </div>
          <div className="space-y-6">
            {steps.map(({ number, title, desc }, i) => (
              <div key={number} className="flex gap-5">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10">
                    <span className="text-sm font-black text-[#C9A84C]">{number}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mx-auto mt-2 h-8 w-px bg-gradient-to-b from-[#C9A84C]/20 to-transparent" />
                  )}
                </div>
                <div className="pt-2.5 pb-4">
                  <h3 className="font-black text-base mb-1">{title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/scan"
              className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-black text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}>
              <Camera className="h-5 w-5" />
              Try It Now — It&apos;s Free
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">Reviews</p>
            <h2 className="text-3xl font-black sm:text-4xl">Trusted by Watch Lovers Worldwide</h2>
            <div className="mt-4 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-[#C9A84C] text-[#C9A84C]" />)}
              <span className="ml-2 text-sm text-gray-400 font-medium">4.9 out of 5</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map(({ name, role, avatar, stars, text }) => (
              <div key={name} className="rounded-2xl border border-[#1E1E1E] bg-[#111111] p-5 flex flex-col gap-3 hover:border-[#C9A84C]/20 transition-colors">
                <div className="flex items-center gap-0.5">
                  {[...Array(stars)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />)}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-1 border-t border-[#1E1E1E]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-xs font-black flex-shrink-0">
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-emerald-400 ml-auto flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED WATCH CARDS ── */}
      <section className="py-20 px-4 bg-[#0D0D0D] border-y border-[#1E1E1E]">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">Real Scans</p>
            <h2 className="text-3xl font-black sm:text-4xl">
              What WatchSnap <span className="text-gradient-gold">Identifies</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { brand: "Rolex", model: "Submariner Date", ref: "126610LN", value: "$14,200 – $17,800", status: "AUTHENTIC", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10 border-emerald-500/30", accent: "#22c55e", year: "2022" },
              { brand: "Patek Philippe", model: "Nautilus", ref: "5711/1A-010", value: "$120,000 – $145,000", status: "AUTHENTIC", statusColor: "text-emerald-400", statusBg: "bg-emerald-500/10 border-emerald-500/30", accent: "#C9A84C", year: "2020" },
              { brand: "Audemars Piguet", model: "Royal Oak", ref: "15500ST.OO.1220ST", value: "$38,000 – $46,000", status: "REPLICA", statusColor: "text-red-400", statusBg: "bg-red-500/10 border-red-500/30", accent: "#ef4444", year: "Unknown" },
            ].map(({ brand, model, ref, value, status, statusColor, statusBg, accent, year }) => (
              <div key={ref} className="rounded-2xl border border-[#1E1E1E] bg-[#111111] overflow-hidden hover:border-[#C9A84C]/25 hover:-translate-y-0.5 transition-all duration-200">
                {/* Watch visual */}
                <div className="relative h-40 flex items-center justify-center overflow-hidden"
                  style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${accent}18 0%, transparent 70%), #0D0D0D` }}>
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-2xl"
                    style={{ borderColor: `${accent}40`, background: `radial-gradient(circle, ${accent}15, #0A0A0A)` }}>
                    <span className="text-4xl">⌚</span>
                  </div>
                  <div className={`absolute top-3 right-3 rounded-full border px-2.5 py-1 text-[10px] font-black ${statusBg} ${statusColor}`}>
                    {status}
                  </div>
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="font-black text-sm text-gradient-gold">{brand}</p>
                  <p className="text-xs font-semibold text-white mt-0.5">{model}</p>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">Ref. {ref} · {year}</p>
                  <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-[#C9A84C]">
                    <TrendingUp className="h-3 w-3" />
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-gray-600">
            Sample results · Actual values depend on condition and market
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3">FAQ</p>
            <h2 className="text-3xl font-black sm:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "How accurate is the AI?",
                a: "WatchSnap achieves over 98% identification accuracy on clear, well-lit photos. The AI has been trained on thousands of reference timepieces across 1,000+ brands. If the image is unclear, we'll tell you rather than guessing.",
              },
              {
                q: "Which watch brands are supported?",
                a: "Over 1,000 brands are supported — from major luxury houses like Rolex, Patek Philippe, Audemars Piguet, Omega and IWC, to more affordable brands like Seiko, Tissot, Citizen, and TAG Heuer. Vintage models are also covered.",
              },
              {
                q: "Is my data private?",
                a: "Yes. Your photos are processed in real time to generate your result and are never stored on our servers. We do not sell or share your data with third parties. Read our full Privacy Policy for details.",
              },
              {
                q: "How does authentication work?",
                a: "Our AI runs a 30-point check on every scan — analysing dial text quality, crown logo sharpness, bezel alignment, hand finishing, bracelet construction, and more. The result is a verdict of Authentic, Replica, or Indeterminate.",
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. Cancel your subscription at any time from your Paddle account portal. You keep access until the end of your billing period. Annual subscribers get a 30-day money-back guarantee, no questions asked.",
              },
            ].map(({ q, a }, i) => (
              <details key={i} className="group rounded-2xl border border-[#1E1E1E] bg-[#111111] overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 list-none">
                  <span className="font-bold text-white text-sm">{q}</span>
                  <ChevronRight className="h-4 w-4 text-[#C9A84C] flex-shrink-0 transition-transform duration-200 group-open:rotate-90" />
                </summary>
                <div className="border-t border-[#1E1E1E] px-5 py-4">
                  <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-20 px-4">
        <div className="mx-auto max-w-lg text-center">
          <div className="rounded-3xl border border-[#C9A84C]/20 bg-[#111111] p-10"
            style={{ boxShadow: "0 0 60px rgba(201,168,76,0.06)" }}>
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}>
                <Clock className="h-8 w-8 text-black" />
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-black">Ready to Identify Your Watch?</h2>
            <p className="mb-6 text-sm text-gray-400">Free to use. No sign-up. Results in seconds.</p>
            <Link href="/scan"
              className="inline-flex items-center gap-2 rounded-2xl px-10 py-4 text-base font-black text-black transition-all hover:scale-105 active:scale-95 w-full justify-center"
              style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)", boxShadow: "0 8px 32px rgba(201,168,76,0.25)" }}>
              <Camera className="h-5 w-5" />
              Start Scanning Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── INSTALL BANNER ── */}
      <HomeInstallBanner />

      {/* ── LEGAL LINKS ── */}
      <section className="border-t border-[#1E1E1E] py-8 px-4 bg-[#080808]">
        <div className="mx-auto max-w-lg text-center space-y-3">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold">Legal &amp; Policies</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="/privacy" className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Privacy Policy</Link>
            <span className="text-gray-700">·</span>
            <Link href="/terms"   className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Terms of Service</Link>
            <span className="text-gray-700">·</span>
            <Link href="/refund"  className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Refund Policy</Link>
            <span className="text-gray-700">·</span>
            <a href="mailto:watchsnapapp@gmail.com" className="text-sm text-[#C9A84C]/70 hover:text-[#C9A84C] transition-colors">Contact</a>
          </div>
        </div>
      </section>
    </div>
  );
}
