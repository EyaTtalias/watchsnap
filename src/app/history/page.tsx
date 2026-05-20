"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookMarked, Trash2, TrendingUp, Shield, AlertTriangle, HelpCircle, Clock, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  getCollection, removeFromCollection, removeFromCollectionRemote,
  syncCollectionFromSupabase, CollectionItem, isPro,
} from "@/lib/collection";
import { supabase } from "@/lib/supabase";
import WatchDetailClient from "./WatchDetailClient";

const AUTH_CFG: Record<string, { label: string; Icon: React.ElementType; className: string; dot: string }> = {
  likely_authentic: { label: "Authentic",    Icon: Shield,        className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  replica:          { label: "Replica",       Icon: AlertTriangle, className: "text-red-400 bg-red-500/10 border-red-500/30",             dot: "bg-red-400"     },
  indeterminate:    { label: "Indeterminate", Icon: HelpCircle,    className: "text-gray-400 bg-gray-500/10 border-gray-500/20",           dot: "bg-gray-400"    },
};

function formatValue(low: number, high: number, currency = "USD") {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  return `${fmt(low)} – ${fmt(high)}`;
}

function WatchCard({
  item, index, onDelete, onSelect,
}: {
  item: CollectionItem; index: number;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const [visible,  setVisible]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const auth     = AUTH_CFG[item.authenticity] ?? AUTH_CFG.indeterminate;
  const AuthIcon = auth.Icon;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    await new Promise((r) => setTimeout(r, 280));
    onDelete(item.id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(item.id)}
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-[#111111] cursor-pointer transition-all duration-500",
        "hover:border-[#C9A84C]/50 hover:shadow-lg hover:shadow-[#C9A84C]/8 hover:-translate-y-0.5",
        deleting
          ? "opacity-0 scale-95 border-[#1E1E1E]"
          : visible
          ? "opacity-100 translate-y-0 border-[#1E1E1E]"
          : "opacity-0 translate-y-4 border-[#1E1E1E]",
      )}
      style={{ transitionDuration: deleting ? "280ms" : "500ms" }}
    >
      {/* Image */}
      <div className="relative aspect-square w-full bg-[#0D0D0D] overflow-hidden">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={`${item.brand} ${item.model}`}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Clock className="h-12 w-12 text-[#C9A84C]/15" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/90 via-[#111111]/20 to-transparent" />

        {/* Auth badge */}
        <div className={clsx("absolute top-2 left-2 flex items-center gap-1 rounded-full border px-2 py-0.5 backdrop-blur-sm text-[10px] font-bold", auth.className)}>
          <span className={clsx("h-1.5 w-1.5 rounded-full", auth.dot)} />
          {auth.label}
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all duration-200 backdrop-blur-sm"
        >
          <Trash2 className="h-3 w-3" />
        </button>

        {/* Confidence bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
          <div
            className="h-full bg-gradient-to-r from-[#C9A84C]/60 to-[#C9A84C] transition-all duration-1000"
            style={{ width: `${item.confidence}%` }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <p className="font-black text-sm text-gradient-gold leading-tight truncate">{item.brand}</p>
        <p className="text-xs font-semibold text-white/90 leading-tight truncate">{item.model}</p>
        {item.reference_number && (
          <p className="text-[10px] text-gray-600 font-mono truncate">Ref. {item.reference_number}</p>
        )}
        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-[#C9A84C]/80 font-semibold">
          <TrendingUp className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{formatValue(item.value_low, item.value_high, item.currency)}</span>
        </div>
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const router = useRouter();
  const [items,      setItems]      = useState<CollectionItem[]>([]);
  const [search,     setSearch]     = useState("");
  const [mounted,    setMounted]    = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userId,     setUserId]     = useState<string | null>(null);

  useEffect(() => {
    if (!isPro()) {
      router.replace("/paywall");
      return;
    }

    // Load local collection immediately so UI shows instantly
    setItems(getCollection());
    setMounted(true);

    // Then sync from Supabase in background (if logged in via Google)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user?.id) return;
      const uid = session.user.id;
      setUserId(uid);
      syncCollectionFromSupabase(uid).then((merged) => setItems(merged));
    });
  }, [router]);

  const handleDelete = (id: string) => {
    removeFromCollection(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (userId) removeFromCollectionRemote(id, userId);
  };

  // ── Show detail view when a watch is selected ──
  if (selectedId) {
    return (
      <WatchDetailClient
        id={selectedId}
        onBack={() => setSelectedId(null)}
      />
    );
  }

  const filtered = search.trim()
    ? items.filter((i) =>
        [i.brand, i.model, i.reference_number].join(" ").toLowerCase().includes(search.toLowerCase())
      )
    : items;

  if (!mounted) return null;

  /* ── EMPTY STATE ── */
  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0A0A0A] pt-20 px-4 text-center">
        <div className="relative mb-6">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#1E1E1E] bg-[#111111]"
            style={{ boxShadow: "0 0 40px rgba(201,168,76,0.05)" }}
          >
            <BookMarked className="h-11 w-11 text-[#C9A84C]/25" />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20">
            <Plus className="h-4 w-4 text-[#C9A84C]" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-black">Your collection is empty</h1>
        <p className="mb-8 max-w-xs text-sm text-gray-500 leading-relaxed">
          Scan your first watch to start building your personal collection — complete with value, authentication, and specs.
        </p>
        <Link
          href="/scan"
          className="flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-black text-black shadow-lg shadow-[#C9A84C]/15 transition-all hover:scale-105 active:scale-95"
          style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}
        >
          <Clock className="h-4 w-4" />
          Scan Your First Watch
        </Link>
      </div>
    );
  }

  /* ── COLLECTION ── */
  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-20 pb-24 sm:pb-12">
      <div className="mx-auto max-w-5xl px-4">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">
              My <span className="text-gradient-gold">Collection</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {items.length} watch{items.length !== 1 ? "es" : ""} saved
            </p>
          </div>
          <Link
            href="/scan"
            className="flex items-center gap-1.5 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-2.5 text-sm font-bold text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-colors flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Scan
          </Link>
        </div>

        {/* Search */}
        {items.length >= 4 && (
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search brand, model, reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#1E1E1E] bg-[#111111] py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#C9A84C]/40 focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item, i) => (
              <WatchCard
                key={item.id}
                item={item}
                index={i}
                onDelete={handleDelete}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500 text-sm">No watches match &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")} className="mt-3 text-sm text-[#C9A84C] hover:underline">
              Clear search
            </button>
          </div>
        )}

        {/* Summary row */}
        {items.length > 0 && (
          <div className="mt-8 rounded-2xl border border-[#1E1E1E] bg-[#111111] p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-black text-gradient-gold">{items.length}</p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Total Watches</p>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-400">
                  {items.filter((i) => i.authenticity === "likely_authentic").length}
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Authenticated</p>
              </div>
              <div>
                <p className="text-xl font-black text-[#C9A84C]">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
                    .format(items.reduce((s, i) => s + (i.value_low + i.value_high) / 2, 0))}
                </p>
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mt-0.5">Est. Portfolio Value</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
