"use client";

import { useEffect, useState } from "react";
import {
  Shield, AlertTriangle, HelpCircle,
  TrendingUp, TrendingDown, Minus, Flame,
  Calendar, Cog, Watch, XCircle, Camera, Info, CheckCircle,
  Share2, Link2, Palette, Link,
} from "lucide-react";
import Image from "next/image";
import clsx from "clsx";

/* ─────────────────────────── types ─── */
export interface PossibleModel {
  model: string;
  ref: string;
  probability: number;
}

export interface WatchResult {
  brand: string;
  model: string;
  reference_number: string;
  // v6 new fields (optional for backward compat)
  possible_models?: PossibleModel[];
  dial_color?: string;
  dial_condition?: string;
  bracelet_type?: string;
  // existing fields
  authenticity: "likely_authentic" | "replica" | "indeterminate";
  authenticity_reason: string;
  replica_flags: string[];
  value_low: number;
  value_high: number;
  is_replica_price: boolean;
  currency: string;
  market_status: "stable" | "rising" | "high_demand" | "declining";
  confidence: number;
  production_years: string;
  movement_type: string;
  case_material: string;
  needs_clearer_image: boolean;
  disclaimer: string;
}

interface ResultCardProps {
  result: WatchResult;
  imageUrl: string;
}

/* ─────────────────────── animated counter ─── */
function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!value) return;
    let cur = 0;
    const step = value / (900 / 16);
    const id = setInterval(() => {
      cur += step;
      if (cur >= value) { setN(value); clearInterval(id); }
      else setN(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <>{prefix}{n.toLocaleString()}</>;
}

/* ─────────────────────── confidence bar ─── */
function ConfidenceBar({ value, delay = 0 }: { value: number; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), delay + 100);
    return () => clearTimeout(t);
  }, [value, delay]);

  const color  = value >= 80 ? "#22c55e" : value >= 60 ? "#C9A84C" : "#ef4444";
  const label  = value >= 80 ? "High Confidence" : value >= 60 ? "Moderate Confidence" : "Low Confidence";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-300">AI Confidence</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color }}>{label}</span>
          <span className="text-base font-black" style={{ color }}>{value}%</span>
        </div>
      </div>
      <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#222]">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}99, ${color})` }}
        />
      </div>
      {value < 60 && (
        <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-semibold">
          <Camera className="h-3.5 w-3.5 flex-shrink-0" />
          Upload a clearer image for more accurate results
        </p>
      )}
    </div>
  );
}

/* ─────────────────────── authenticity badge — prominent on mobile ─── */
function AuthBadge({ status }: { status: WatchResult["authenticity"] }) {
  const cfg = {
    likely_authentic: {
      Icon: CheckCircle,
      label: "Likely Authentic",
      sublabel: "Passes AI authentication check",
      dot: "bg-emerald-400",
      border: "border-emerald-500/50",
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      subtextColor: "text-emerald-600",
      iconBg: "bg-emerald-500/20",
    },
    replica: {
      Icon: XCircle,
      label: "REPLICA DETECTED",
      sublabel: "Multiple authentication failures found",
      dot: "bg-red-400",
      border: "border-red-500/60",
      bg: "bg-red-500/18",
      text: "text-red-400",
      subtextColor: "text-red-600",
      iconBg: "bg-red-500/20",
    },
    indeterminate: {
      Icon: HelpCircle,
      label: "Indeterminate",
      sublabel: "Clearer image needed for authentication",
      dot: "bg-amber-400",
      border: "border-amber-400/50",
      bg: "bg-amber-500/12",
      text: "text-amber-400",
      subtextColor: "text-amber-600",
      iconBg: "bg-amber-500/20",
    },
  }[status] ?? {
    Icon: HelpCircle,
    label: "Indeterminate",
    sublabel: "Unable to authenticate",
    dot: "bg-gray-400",
    border: "border-gray-500/30",
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    subtextColor: "text-gray-600",
    iconBg: "bg-gray-500/20",
  };

  return (
    <div className={clsx(
      "flex items-center gap-4 rounded-2xl border-2 w-full px-5 py-4 sm:py-5",
      cfg.border, cfg.bg,
    )}>
      {/* Icon circle */}
      <div className={clsx("flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full", cfg.iconBg)}>
        <cfg.Icon className={clsx("h-6 w-6", cfg.text)} />
      </div>
      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={clsx("h-2.5 w-2.5 rounded-full flex-shrink-0 animate-pulse", cfg.dot)} />
          <p className={clsx("text-base font-black leading-tight tracking-tight", cfg.text)}>{cfg.label}</p>
        </div>
        <p className={clsx("text-xs font-semibold leading-relaxed", cfg.subtextColor)}>{cfg.sublabel}</p>
      </div>
    </div>
  );
}

/* ─────────────────────── replica warning banner ─── */
function ReplicaBanner({ flags }: { flags: string[] }) {
  return (
    <div className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 overflow-hidden">
      <div className="bg-red-500/25 px-5 py-3.5 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-black text-red-300">REPLICA DETECTED</p>
          <p className="text-xs text-red-400/70 mt-0.5">Do not pay authentic prices for this watch.</p>
        </div>
      </div>
      {flags.length > 0 && (
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-400/60 mb-3">Authentication Failures</p>
          <ul className="space-y-2.5">
            {flags.map((flag, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-300/90 leading-relaxed">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── market status badge ─── */
function MarketBadge({ status }: { status: WatchResult["market_status"] }) {
  const cfg = {
    rising:      { Icon: TrendingUp,  label: "Price Rising",  className: "text-emerald-400" },
    high_demand: { Icon: Flame,        label: "High Demand",   className: "text-orange-400"  },
    declining:   { Icon: TrendingDown, label: "Price Falling", className: "text-red-400"     },
    stable:      { Icon: Minus,        label: "Market Stable", className: "text-gray-400"    },
  }[status] ?? { Icon: Minus, label: "Market Stable", className: "text-gray-400" };

  return (
    <span className={clsx("flex items-center gap-1.5 text-sm font-semibold", cfg.className)}>
      <cfg.Icon className="h-4 w-4" />
      {cfg.label}
    </span>
  );
}

/* ─────────────────────── spec pill ─── */
function SpecPill({ icon: Icon, label, value, delay }: {
  icon: React.ElementType; label: string; value: string; delay: number;
}) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={clsx(
      "rounded-2xl border border-[#2A2A2A] bg-[#181818] p-4 transition-all duration-500",
      vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
    )}>
      <div className="mb-2 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-[#C9A84C]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
      </div>
      <p className="text-sm font-bold text-white leading-tight">{value || "—"}</p>
    </div>
  );
}

/* ─────────────────────── share button ─── */
function ShareButton({ result }: { result: WatchResult }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const statusLabel =
    result.authenticity === "likely_authentic" ? "✅ AUTHENTIC" :
    result.authenticity === "replica"          ? "⚠️ REPLICA DETECTED" : "❓ Indeterminate";

  const valueText =
    result.value_low > 0 && result.value_high > 0
      ? `$${result.value_low.toLocaleString()} – $${result.value_high.toLocaleString()}`
      : "N/A";

  const shareText =
    `🕐 ${result.brand} ${result.model}\n` +
    `${statusLabel}\n` +
    `💰 Market Value: ${valueText}\n\n` +
    `Scanned with WatchSnap · watchsnap.vercel.app`;

  const openWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    setOpen(false);
  };

  const copy = async (withLink: boolean) => {
    const text = withLink && typeof window !== "undefined"
      ? shareText + "\n" + window.location.href
      : shareText;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/8 px-4 py-3.5 text-sm font-bold text-[#C9A84C] hover:bg-[#C9A84C]/15 hover:border-[#C9A84C]/50 transition-all active:scale-95"
      >
        <Share2 className="h-4 w-4" />
        {copied ? "Copied!" : "Share Result"}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 z-20 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] shadow-2xl overflow-hidden">
            <p className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-[#222]">
              Share via
            </p>

            <button
              onClick={openWhatsApp}
              className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-[#222] transition-colors text-left"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-base">
                💬
              </div>
              <div>
                <p className="text-sm font-bold text-white">WhatsApp</p>
                <p className="text-xs text-gray-500">Send result via WhatsApp</p>
              </div>
            </button>

            <button
              onClick={() => copy(false)}
              className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-[#222] transition-colors text-left border-t border-[#222]"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#E1306C]/15 text-base">
                📸
              </div>
              <div>
                <p className="text-sm font-bold text-white">Copy for Instagram</p>
                <p className="text-xs text-gray-500">Copy text — paste into Instagram</p>
              </div>
            </button>

            <button
              onClick={() => copy(true)}
              className="flex w-full items-center gap-3 px-4 py-3.5 hover:bg-[#222] transition-colors text-left border-t border-[#222]"
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#C9A84C]/15">
                <Link2 className="h-4 w-4 text-[#C9A84C]" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Copy Link</p>
                <p className="text-xs text-gray-500">Copy result + page link</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────── main export ─── */
export function ResultCard({ result, imageUrl }: ResultCardProps) {
  const [hVis, setHVis] = useState(false);
  const [vVis, setVVis] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setHVis(true), 60);
    const t2 = setTimeout(() => setVVis(true), 380);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const isReplica       = result.authenticity === "replica";
  const isIndeterminate = result.authenticity === "indeterminate";
  const replicaFlags    = result.replica_flags ?? [];

  const specs = [
    { icon: Calendar, label: "Production",  value: result.production_years },
    { icon: Cog,      label: "Movement",    value: result.movement_type    },
    { icon: Watch,    label: "Case",        value: result.case_material    },
    ...(result.dial_color    ? [{ icon: Palette, label: "Dial",     value: result.dial_color    }] : []),
    ...(result.bracelet_type ? [{ icon: Link,    label: "Bracelet", value: result.bracelet_type }] : []),
  ];

  const possibleModels = result.possible_models?.filter(m => m.model && m.probability > 0) ?? [];

  // Market value card glow color
  const valueGlow = isReplica
    ? "0 0 40px rgba(239,68,68,0.18)"
    : "0 0 50px rgba(201,168,76,0.22)";

  return (
    <div className="space-y-3 sm:space-y-4">

      {/* ① Hero image + brand/model */}
      <div className={clsx(
        "relative h-64 sm:h-72 overflow-hidden rounded-3xl border-2 transition-all duration-700",
        isReplica ? "border-red-500/50" : "border-[#2A2A2A]",
        hVis ? "opacity-100 scale-100" : "opacity-0 scale-95",
      )}>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt="Scanned watch"
            fill
            unoptimized
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />
        )}
        {/* Stronger gradient overlay for better text contrast on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/70 to-transparent" />

        {/* Replica top strip */}
        {isReplica && (
          <div className="absolute top-0 left-0 right-0 bg-red-500/90 px-4 py-2 text-center">
            <p className="text-sm font-black text-white tracking-widest">⚠ REPLICA DETECTED</p>
          </div>
        )}

        {/* Brand & model overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p
            className={clsx(
              "text-5xl font-black tracking-tight leading-none transition-all duration-700 sm:text-5xl",
              isReplica ? "text-red-300" : "text-gradient-gold",
              hVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
            style={{ transitionDelay: "150ms" }}
          >
            {result.brand}
          </p>
          <p
            className={clsx(
              "text-xl font-bold text-white mt-1 transition-all duration-700",
              hVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
            )}
            style={{ transitionDelay: "240ms" }}
          >
            {result.model}
            {isReplica && (
              <span className="ml-2 text-base font-semibold text-red-400">(Replica)</span>
            )}
          </p>
          {result.reference_number && (
            <p
              className={clsx(
                "mt-1.5 inline-block bg-black/40 rounded-lg px-2.5 py-1 text-sm text-gray-200 font-mono font-semibold transition-all duration-700",
                hVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
              )}
              style={{ transitionDelay: "330ms" }}
            >
              Ref. {result.reference_number}
            </p>
          )}
        </div>
      </div>

      {/* ② Authenticity Badge — large and prominent */}
      <div
        className={clsx("transition-all duration-500", hVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "280ms" }}
      >
        <AuthBadge status={result.authenticity} />
      </div>

      {/* ③ Replica Warning Banner */}
      {isReplica && replicaFlags.length > 0 && (
        <div
          className={clsx("transition-all duration-500", hVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
          style={{ transitionDelay: "320ms" }}
        >
          <ReplicaBanner flags={replicaFlags} />
        </div>
      )}

      {/* ④ Market Value — BIG on mobile */}
      <div
        className={clsx(
          "rounded-3xl border-2 px-5 py-7 text-center transition-all duration-700 sm:px-6 sm:py-8",
          isReplica
            ? "border-red-500/30 bg-[#160a0a]"
            : "border-[#C9A84C]/30 bg-[#111111]",
          vVis ? "opacity-100 scale-100" : "opacity-0 scale-95",
        )}
        style={{ boxShadow: vVis ? valueGlow : "none", transitionDelay: "100ms" }}
      >
        {/* Label row */}
        <div className="mb-3 flex items-center justify-center gap-2">
          {isReplica ? (
            <AlertTriangle className="h-4 w-4 text-red-400" />
          ) : (
            <TrendingUp className="h-4 w-4 text-[#C9A84C]" />
          )}
          <span className={clsx(
            "text-xs font-bold uppercase tracking-widest",
            isReplica ? "text-red-400" : "text-[#C9A84C]",
          )}>
            {isReplica ? "Estimated Replica Value" : "Market Value"}
          </span>
        </div>

        {/* BIG price number */}
        <div className={clsx(
          "font-black leading-none",
          isReplica ? "text-red-300" : "text-white",
        )}>
          {!vVis ? (
            <span className="text-5xl opacity-0">$0</span>
          ) : result.value_low > 0 && result.value_high > 0 ? (
            <div className="flex items-baseline justify-center gap-1 flex-wrap">
              <span
                className="text-5xl sm:text-6xl"
                style={!isReplica ? {
                  background: "linear-gradient(135deg, #C9A84C, #E2C06D, #C9A84C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                } : {}}
              >
                <AnimatedNumber value={result.value_low} prefix="$" />
              </span>
              <span className="text-2xl sm:text-3xl text-gray-500 font-normal self-center">–</span>
              <span
                className="text-5xl sm:text-6xl"
                style={!isReplica ? {
                  background: "linear-gradient(135deg, #C9A84C, #E2C06D, #C9A84C)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                } : {}}
              >
                <AnimatedNumber value={result.value_high} prefix="$" />
              </span>
            </div>
          ) : (
            <span className="text-xl text-gray-500 font-semibold">Price data unavailable</span>
          )}
        </div>

        {/* Sub-label */}
        {isReplica ? (
          <p className="mt-3 text-xs text-red-400/70 max-w-xs mx-auto leading-relaxed">
            This is the estimated replica value — not the authentic watch price.
          </p>
        ) : (
          <div className="mt-3 flex flex-col items-center gap-1.5">
            <p className="text-xs text-gray-500 font-medium">Secondary market · Chrono24 / eBay</p>
            <MarketBadge status={result.market_status} />
          </div>
        )}
      </div>

      {/* ⑤ AI Confidence */}
      <div className={clsx(
        "rounded-2xl border border-[#2A2A2A] bg-[#181818] p-5 transition-all duration-500",
        vVis ? "opacity-100" : "opacity-0",
      )}>
        <ConfidenceBar value={result.confidence} delay={400} />
        {result.needs_clearer_image && !isIndeterminate && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3">
            <span className="text-amber-400 flex-shrink-0 mt-0.5 text-base">⚠</span>
            <p className="text-sm text-amber-400/90 leading-relaxed font-medium">
              Upload a clearer, well-lit photo for more accurate results.
            </p>
          </div>
        )}
      </div>

      {/* ⑥ Technical Specs */}
      {!isReplica && (
        <div>
          <p className="mb-2.5 px-1 text-xs font-bold uppercase tracking-widest text-gray-500">
            Technical Specs
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {specs.map((s, i) => (
              <SpecPill key={s.label} icon={s.icon} label={s.label} value={s.value} delay={450 + i * 70} />
            ))}
          </div>
        </div>
      )}

      {/* ⑦ Alternative Model Identifications */}
      {possibleModels.length > 1 && (
        <div
          className={clsx(
            "rounded-2xl border border-[#2A2A2A] bg-[#181818] p-5 transition-all duration-500",
            vVis ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDelay: "580ms" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="h-4 w-4 text-[#C9A84C]/70" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]/70">
              Possible Identifications
            </p>
          </div>
          <div className="space-y-2">
            {possibleModels.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{m.model}</p>
                  {m.ref && <p className="text-xs text-gray-500 font-mono">Ref. {m.ref}</p>}
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-[#2A2A2A] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${m.probability}%`,
                        background: i === 0
                          ? "linear-gradient(90deg,#A8882F,#C9A84C)"
                          : "linear-gradient(90deg,#3A3A3A,#555)",
                      }}
                    />
                  </div>
                  <span className={clsx(
                    "text-xs font-black w-8 text-right",
                    i === 0 ? "text-[#C9A84C]" : "text-gray-500",
                  )}>
                    {m.probability}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⑨ Authentication Analysis */}
      {result.authenticity_reason && (
        <div
          className={clsx(
            "rounded-2xl border p-5 transition-all duration-500",
            isReplica
              ? "border-red-500/25 bg-[#160a0a]"
              : "border-[#2A2A2A] bg-[#181818]",
            vVis ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className={clsx("h-4 w-4", isReplica ? "text-red-400/70" : "text-[#C9A84C]")} />
            <p className={clsx(
              "text-xs font-bold uppercase tracking-widest",
              isReplica ? "text-red-400/60" : "text-[#C9A84C]/70",
            )}>
              Authentication Analysis
            </p>
          </div>
          <p className={clsx(
            "text-sm leading-relaxed",
            isReplica ? "text-red-300/80" : "text-gray-200",
          )}>
            {result.authenticity_reason}
          </p>
        </div>
      )}

      {/* ⑩ Share Button */}
      <div
        className={clsx("transition-all duration-500", vVis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}
        style={{ transitionDelay: "650ms" }}
      >
        <ShareButton result={result} />
      </div>

      {/* ⑪ Legal Disclaimer */}
      <div
        className={clsx(
          "rounded-xl border px-4 py-3.5 transition-all duration-500",
          isReplica
            ? "border-red-500/15 bg-[#120808]"
            : "border-[#222] bg-[#111]",
          vVis ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDelay: "700ms" }}
      >
        <div className="flex items-start gap-2.5">
          <Info className={clsx("h-4 w-4 flex-shrink-0 mt-0.5", isReplica ? "text-red-400/50" : "text-gray-600")} />
          <p className={clsx("text-xs leading-relaxed", isReplica ? "text-red-400/55" : "text-gray-500")}>
            {result.disclaimer || "This is an AI estimate only. Always seek professional authentication before any high-value purchase or sale."}
          </p>
        </div>
      </div>
    </div>
  );
}
