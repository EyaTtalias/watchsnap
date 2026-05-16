"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft, Shield, AlertTriangle, HelpCircle,
  TrendingUp, TrendingDown, Minus, Flame,
  Calendar, Cog, Watch, Trash2, Clock,
} from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { getCollection, removeFromCollection, CollectionItem } from "@/lib/collection";

interface Props {
  id: string;
  onBack: () => void;
}

function formatValue(low: number, high: number, currency = "USD") {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  return `${fmt(low)} – ${fmt(high)}`;
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

const AUTH_CFG = {
  likely_authentic: {
    Icon: Shield, label: "Likely Authentic", sub: "Passed 30-point AI authentication check",
    border: "border-emerald-500/40", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400",
  },
  replica: {
    Icon: AlertTriangle, label: "High Confidence Replica", sub: "Multiple authentication markers failed",
    border: "border-red-500/40", bg: "bg-red-500/10", text: "text-red-400", dot: "bg-red-400",
  },
  indeterminate: {
    Icon: HelpCircle, label: "Indeterminate", sub: "Insufficient data for conclusive result",
    border: "border-gray-500/30", bg: "bg-gray-500/10", text: "text-gray-400", dot: "bg-gray-400",
  },
};

const MARKET_CFG = {
  rising:      { Icon: TrendingUp,  label: "Price Rising",  className: "text-emerald-400" },
  high_demand: { Icon: Flame,        label: "High Demand",   className: "text-orange-400"  },
  declining:   { Icon: TrendingDown, label: "Price Falling", className: "text-red-400"     },
  stable:      { Icon: Minus,        label: "Market Stable", className: "text-gray-400"    },
};

function ConfidenceBar({ value }: { value: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 200);
    return () => clearTimeout(t);
  }, [value]);
  const color = value >= 80 ? "#10b981" : value >= 50 ? "#C9A84C" : "#ef4444";
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-400">AI Confidence Score</span>
        <span className="text-sm font-black" style={{ color }}>{value}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#1E1E1E]">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
        />
      </div>
    </div>
  );
}

export default function WatchDetailClient({ id, onBack }: Props) {
  const [item,     setItem]     = useState<CollectionItem | null>(null);
  const [visible,  setVisible]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const collection = getCollection();
    const found = collection.find((w) => w.id === id);
    if (!found) { onBack(); return; }
    setItem(found);
    setTimeout(() => setVisible(true), 60);
  }, [id, onBack]);

  const handleDelete = async () => {
    if (!item) return;
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 300));
    removeFromCollection(item.id);
    onBack();
  };

  if (!item) return null;

  const auth       = AUTH_CFG[item.authenticity as keyof typeof AUTH_CFG] ?? AUTH_CFG.indeterminate;
  const market     = MARKET_CFG["stable" as keyof typeof MARKET_CFG];
  const AuthIcon   = auth.Icon;
  const MarketIcon = market.Icon;

  const specs = [
    { icon: Calendar, label: "Production", value: item.production_years || "—" },
    { icon: Cog,      label: "Movement",   value: "Mechanical"                  },
    { icon: Watch,    label: "Reference",  value: item.reference_number || "—"  },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24 sm:pb-12">

      {/* Hero image */}
      <div
        className={clsx("relative w-full overflow-hidden transition-all duration-700", visible ? "opacity-100" : "opacity-0")}
        style={{ height: "55vw", maxHeight: 420, minHeight: 280 }}
      >
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={`${item.brand} ${item.model}`}
            fill
            unoptimized
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#111111]">
            <Clock className="h-20 w-20 text-[#C9A84C]/20" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/30 to-transparent" />

        <button
          onClick={onBack}
          className="absolute top-16 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-all hover:bg-black/90"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className={clsx("absolute bottom-0 left-0 right-0 p-5 transition-all duration-700", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6")}>
          <p className="text-4xl font-black text-gradient-gold leading-none">{item.brand}</p>
          <p className="mt-1 text-xl font-bold text-white">{item.model}</p>
          {item.reference_number && (
            <p className="mt-1 text-sm font-mono text-gray-400">Ref. {item.reference_number}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="mx-auto max-w-lg px-4 space-y-4 pt-4">

        <div className={clsx("rounded-2xl border p-5 transition-all duration-500", auth.border, auth.bg, visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: "100ms" }}>
          <div className="flex items-center gap-3">
            <span className={clsx("h-3 w-3 rounded-full flex-shrink-0 animate-pulse", auth.dot)} />
            <AuthIcon className={clsx("h-5 w-5 flex-shrink-0", auth.text)} />
            <div>
              <p className={clsx("font-black text-base", auth.text)}>{auth.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{auth.sub}</p>
            </div>
          </div>
        </div>

        <div className={clsx("rounded-2xl border border-[#C9A84C]/25 bg-[#111111] px-5 py-5 transition-all duration-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: "180ms" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">Market Value</span>
            <span className={clsx("flex items-center gap-1 text-xs font-semibold", market.className)}>
              <MarketIcon className="h-3.5 w-3.5" />
              {market.label}
            </span>
          </div>
          <p className="text-3xl font-black text-white">
            {formatValue(item.value_low, item.value_high, item.currency)}
          </p>
        </div>

        <div className={clsx("rounded-2xl border border-[#1E1E1E] bg-[#111111] p-5 transition-all duration-500", visible ? "opacity-100" : "opacity-0")} style={{ transitionDelay: "260ms" }}>
          <ConfidenceBar value={item.confidence} />
        </div>

        <div className={clsx("transition-all duration-500", visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")} style={{ transitionDelay: "340ms" }}>
          <p className="mb-2 px-1 text-xs font-bold uppercase tracking-widest text-gray-600">Technical Details</p>
          <div className="grid grid-cols-3 gap-3">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-[#1E1E1E] bg-[#111111] p-4">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-[#C9A84C]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
                </div>
                <p className="text-xs font-bold text-white leading-tight">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={clsx("rounded-2xl border border-[#1E1E1E] bg-[#111111] px-5 py-4 transition-all duration-500", visible ? "opacity-100" : "opacity-0")} style={{ transitionDelay: "420ms" }}>
          <p className="text-xs text-gray-600 font-medium">Scanned on {formatDate(item.savedAt)}</p>
        </div>

        <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] px-4 py-3 text-center">
          <p className="text-[11px] text-gray-600">⚖️ Analysis is for informational purposes only. Not an official appraisal.</p>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 py-4 text-sm font-bold text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-40"
          style={{ minHeight: "56px" }}
        >
          <Trash2 className="h-4 w-4" />
          {deleting ? "Removing..." : "Remove from Collection"}
        </button>
      </div>
    </div>
  );
}
