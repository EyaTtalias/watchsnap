"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Camera, ImagePlus, X, RotateCcw, BookMarked, CheckCircle2, ScanLine, Zap } from "lucide-react";
import { ReviewPopup } from "@/components/ReviewPopup";
import { ScanAnimation } from "@/components/ScanAnimation";
import { ResultCard, WatchResult } from "@/components/ResultCard";
import { PaywallModal } from "@/components/PaywallModal";
import { CameraCapture } from "@/components/CameraCapture";
import { InstallBanner } from "@/components/InstallBanner";
import {
  saveToCollection, compressToThumbnail,
  isPro, getScanCount, incrementScanCount, FREE_SCAN_LIMIT, PRO_KEY,
} from "@/lib/collection";
import { getApiUrl } from "@/lib/apiUrl";

type Phase = "idle" | "camera" | "preview" | "scanning" | "result" | "error";

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const MAX_DIM = 1600;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width  = width;
        canvas.height = height;
        canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], file.name, { type: "image/jpeg" }) : file),
          "image/jpeg", 0.88
        );
      };
    };
  });
}

const PROGRESS_STEPS = [
  { label: "Uploading image...",           pct: 15  },
  { label: "Analyzing watch details...",   pct: 38  },
  { label: "Checking authentication...",  pct: 62  },
  { label: "Calculating market value...", pct: 84  },
  { label: "Done!",                        pct: 100 },
];

export default function ScanPage() {
  const [phase,             setPhase]             = useState<Phase>("idle");
  const [imageFile,         setImageFile]         = useState<File | null>(null);
  const [imageUrl,          setImageUrl]          = useState<string>("");
  const [result,            setResult]            = useState<WatchResult | null>(null);
  const [error,             setError]             = useState<string>("");
  const [dragOver,          setDragOver]          = useState(false);
  const [saved,             setSaved]             = useState(false);
  const [saving,            setSaving]            = useState(false);
  const [showPaywall,       setShowPaywall]       = useState(false);
  const [userIsPro,         setUserIsPro]         = useState(false);
  const [scansUsed,         setScansUsed]         = useState(0);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showReview,        setShowReview]        = useState(false);
  const [scanStepIdx,       setScanStepIdx]       = useState(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const scanTimersRef   = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      window.history.replaceState({}, "", "/scan");
    }
    setUserIsPro(isPro());
    setScansUsed(getScanCount());

    /* ── Server-side subscription verification ──
       Checks Supabase for the user's actual subscription status.
       Uses localStorage as a 60-minute cache to avoid hitting the
       API on every page load. Falls back silently to localStorage
       if the API is unreachable.
    ── */
    const verifySubscription = async () => {
      try {
        const storedEmail = localStorage.getItem("watchsnap_email");
        if (!storedEmail) return; // no email → localStorage-only mode

        const cachedAt  = parseInt(localStorage.getItem("watchsnap_verified_at") ?? "0", 10);
        const ONE_HOUR  = 60 * 60 * 1000;
        if (Date.now() - cachedAt < ONE_HOUR) return; // cache still fresh

        const res = await fetch(getApiUrl("/api/verify-subscription"), {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email: storedEmail }),
        });
        if (!res.ok) return; // server error → keep localStorage value

        const data = await res.json() as { isPro?: boolean | null; status?: string };

        if (data.isPro === null) return; // unknown (server error) → keep cache

        if (data.isPro === true) {
          localStorage.setItem(PRO_KEY, "1");
          setUserIsPro(true);
        } else if (data.isPro === false) {
          // Only downgrade if this is a definitive "not subscribed" response
          if (data.status !== "unknown") {
            localStorage.removeItem(PRO_KEY);
            setUserIsPro(false);
          }
        }

        localStorage.setItem("watchsnap_verified_at", String(Date.now()));
      } catch {
        // Network error — keep existing localStorage state
      }
    };

    verifySubscription();
  }, []);

  const scansLeft = Math.max(0, FREE_SCAN_LIMIT - scansUsed);
  const isDevOverride = typeof window !== "undefined" &&
    localStorage.getItem("watchsnap_dev") === "1";
  const canScan = userIsPro || isDevOverride || scansLeft > 0;

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, HEIC).");
      setPhase("error");
      return;
    }
    const compressed = await compressImage(file);
    setImageFile(compressed);
    setImageUrl(URL.createObjectURL(compressed));
    setPhase("preview");
    setResult(null);
    setError("");
    setSaved(false);
  }, []);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const startScan = async () => {
    if (!imageFile) return;

    // Refresh pro status (may have changed since page load)
    const pro = isPro();
    setUserIsPro(pro);
    const dev = typeof window !== "undefined" && localStorage.getItem("watchsnap_dev") === "1";
    const used = getScanCount();
    setScansUsed(used);

    if (!pro && !dev && used >= FREE_SCAN_LIMIT) {
      setShowPaywall(true);
      return;
    }

    setPhase("scanning");
    setScanStepIdx(0);
    scanTimersRef.current.forEach(clearTimeout);
    scanTimersRef.current = PROGRESS_STEPS.slice(0, 4).map((_, i) =>
      setTimeout(() => setScanStepIdx(i), i * 2600)
    );

    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const res  = await fetch(getApiUrl("/api/identify"), { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Identification failed");

      // Count the scan for free users
      if (!pro && !dev) {
        incrementScanCount();
        setScansUsed(getScanCount());
      }

      scanTimersRef.current.forEach(clearTimeout);
      setScanStepIdx(4);
      setResult(data);
      setPhase("result");
      setShowInstallBanner(true);
      try {
        if (!localStorage.getItem("ws_review_shown")) {
          localStorage.setItem("ws_review_shown", "1");
          setTimeout(() => setShowReview(true), 2000);
        }
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("error");
    }
  };

  const handleAddToCollection = async () => {
    if (!result || saved || saving) return;
    setSaving(true);
    const thumbnail = imageUrl ? await compressToThumbnail(imageUrl) : "";
    saveToCollection({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      brand:             result.brand,
      model:             result.model,
      reference_number:  result.reference_number,
      production_years:  result.production_years,
      value_low:         result.value_low,
      value_high:        result.value_high,
      currency:          result.currency,
      authenticity:      result.authenticity,
      confidence:        result.confidence,
      thumbnail,
      savedAt:           Date.now(),
    });
    setSaving(false);
    setSaved(true);
  };

  const reset = () => {
    setPhase("idle");
    setImageFile(null);
    setImageUrl("");
    setResult(null);
    setError("");
    setSaved(false);
    setScansUsed(getScanCount());
    setUserIsPro(isPro());
  };

  if (phase === "camera") {
    return <CameraCapture onCapture={(file) => handleFile(file)} onClose={() => setPhase("idle")} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-16 pb-safe">
      <div className="mx-auto max-w-lg px-4 w-full pt-6 pb-6">

        {/* ── Header ── */}
        <div className="mb-6 text-center">
          <h1 className="mb-1 text-3xl font-black">
            <span className="text-gradient-gold">Scan</span> a Watch
          </h1>
          <p className="text-sm text-gray-400">Upload or take a photo for instant AI identification</p>

          {/* Scan counter / upgrade badge */}
          <div className="mt-3 flex justify-center">
            {userIsPro ? (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-4 py-1.5">
                <Zap className="h-3.5 w-3.5 text-[#C9A84C]" />
                <span className="text-xs font-bold text-[#C9A84C]">Pro — unlimited scans</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#1E1E1E] bg-[#111111] px-4 py-1.5">
                {scansLeft > 0 ? (
                  <>
                    {/* Coloured dots */}
                    <div className="flex gap-1">
                      {Array.from({ length: FREE_SCAN_LIMIT }).map((_, i) => (
                        <span
                          key={i}
                          className="h-2 w-2 rounded-full"
                          style={{ background: i < scansLeft ? "#C9A84C" : "#2A2A2A" }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      <span className="font-bold text-white">{scansLeft}</span> free scan{scansLeft !== 1 ? "s" : ""} left
                    </span>
                  </>
                ) : (
                  <Link href="/paywall" className="text-xs text-[#C9A84C] font-semibold">
                    Upgrade for more scans →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── IDLE ── */}
        {phase === "idle" && (
          <div className="space-y-4">
            {/* Desktop drag-drop zone */}
            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`hidden sm:flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
                dragOver ? "border-[#C9A84C] bg-[#C9A84C]/5" : "border-[#2A2A2A] bg-[#111111]"
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A84C]/10">
                <Camera className="h-8 w-8 text-[#C9A84C]" />
              </div>
              <div>
                <p className="font-semibold">Drop your watch photo here</p>
                <p className="text-sm text-gray-500">or use the buttons below</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Take Photo — always uses in-app getUserMedia camera */}
              <button
                type="button"
                onClick={() => {
                  if (!canScan) { setShowPaywall(true); return; }
                  setPhase("camera");
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 p-5 text-[#C9A84C] transition-all active:scale-95 hover:bg-[#C9A84C]/20"
                style={{ minHeight: "120px" }}
              >
                <Camera className="h-10 w-10" />
                <span className="text-sm font-black">Take Photo</span>
                <span className="text-[11px] text-[#C9A84C]/60">Guided camera</span>
              </button>

              {/* From Gallery */}
              <button
                type="button"
                onClick={() => {
                  if (!canScan) { setShowPaywall(true); return; }
                  galleryInputRef.current?.click();
                }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-[#1E1E1E] bg-[#111111] p-5 text-gray-300 transition-all active:scale-95 hover:border-[#C9A84C]/30 hover:text-white"
                style={{ minHeight: "120px" }}
              >
                <ImagePlus className="h-10 w-10" />
                <span className="text-sm font-black">From Gallery</span>
                <span className="text-[11px] text-gray-600">JPG, PNG, HEIC</span>
              </button>
            </div>
            <p className="text-center text-xs text-gray-600">Supported: JPG · PNG · HEIC · WEBP · Max 10MB</p>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {phase === "preview" && imageUrl && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-3xl border border-[#1E1E1E]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Watch preview" className="h-72 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent" />
              <button onClick={reset}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white">
                <X className="h-5 w-5" />
              </button>
              <p className="absolute bottom-3 left-0 right-0 text-center text-sm text-gray-200 font-medium">
                Make sure the watch face is clear and well-lit
              </p>
            </div>

            {/* Scans left warning in preview */}
            {!userIsPro && scansLeft === 1 && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-center">
                <p className="text-xs font-semibold text-amber-400">Last free scan — upgrade for unlimited</p>
              </div>
            )}

            <button
              onClick={startScan}
              className="w-full rounded-2xl py-4 text-base font-black text-black transition-all active:scale-[0.98] hover:scale-[1.01]"
              style={{ minHeight: "60px", background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)", boxShadow: "0 8px 32px rgba(201,168,76,0.25)" }}
            >
              Identify This Watch →
            </button>
            <p className="text-center text-xs text-gray-600">AI analysis takes 5–15 seconds</p>
          </div>
        )}

        {/* ── SCANNING ── */}
        {phase === "scanning" && (
          <div className="space-y-5">
            <div className="relative h-64 overflow-hidden rounded-3xl border border-[#C9A84C]/20 bg-[#111111]">
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Scanning" className="h-full w-full object-cover opacity-30" />
              )}
              <div className="absolute inset-0"><ScanAnimation /></div>
            </div>

            <div className="rounded-2xl border border-[#1E1E1E] bg-[#111111] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ScanLine className="h-4 w-4 text-[#C9A84C] animate-pulse" />
                  <span className="text-sm font-black text-white">AI Analysing Watch</span>
                </div>
                <span className="text-sm font-black text-[#C9A84C]">
                  {PROGRESS_STEPS[scanStepIdx].pct}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1E1E1E]">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${PROGRESS_STEPS[scanStepIdx].pct}%`,
                    background: "linear-gradient(90deg, #A8882F, #C9A84C, #E2C06D)",
                    boxShadow: "0 0 8px rgba(201,168,76,0.5)",
                  }}
                />
              </div>

              <div className="space-y-2">
                {PROGRESS_STEPS.map((step, i) => {
                  const done    = i < scanStepIdx;
                  const current = i === scanStepIdx;
                  return (
                    <div key={step.label} className="flex items-center gap-2.5">
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-all ${
                        done    ? "bg-[#C9A84C] text-black" :
                        current ? "border border-[#C9A84C] text-[#C9A84C] animate-pulse" :
                                  "border border-[#2A2A2A] text-gray-700"
                      }`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={`text-sm transition-colors ${
                        done    ? "text-gray-500 line-through decoration-gray-600" :
                        current ? "text-white font-semibold" : "text-gray-700"
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {phase === "result" && result && (
          <div className="space-y-4">
            <ResultCard result={result} imageUrl={imageUrl} />

            <button
              onClick={handleAddToCollection}
              disabled={saving || saved}
              className={`flex w-full items-center justify-center gap-2.5 rounded-2xl border py-4 text-sm font-bold transition-all active:scale-[0.98] ${
                saved
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] hover:bg-[#C9A84C]/20"
              }`}
              style={{ minHeight: "56px" }}
            >
              {saved
                ? <><CheckCircle2 className="h-5 w-5 fill-emerald-400 text-emerald-400" /> Saved to Collection</>
                : saving
                ? <><BookMarked className="h-5 w-5" /> Saving...</>
                : <><BookMarked className="h-5 w-5" /> Add to My Collection</>
              }
            </button>

            {/* Post-scan upgrade nudge for free users on last/no scans */}
            {!userIsPro && scansLeft <= 0 && (
              <Link href="/paywall"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#C9A84C]/40 bg-[#C9A84C]/10 py-3.5 text-sm font-black text-[#C9A84C] hover:bg-[#C9A84C]/20 transition-all">
                <Zap className="h-4 w-4" />
                Unlock unlimited scans →
              </Link>
            )}

            <button onClick={reset}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-[#C9A84C]/35 bg-[#C9A84C]/8 py-4 text-base font-black text-[#C9A84C] hover:bg-[#C9A84C]/16 hover:border-[#C9A84C]/55 transition-all active:scale-[0.98]"
              style={{ minHeight: "60px" }}>
              <RotateCcw className="h-5 w-5" />
              Scan Another Watch
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {phase === "error" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
              <p className="font-bold text-red-400 text-base">Identification Failed</p>
              <p className="mt-2 text-sm text-red-400/70">{error}</p>
            </div>
            <button onClick={reset}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1E1E1E] bg-[#111111] py-4 text-sm font-bold text-gray-400 hover:text-white transition-colors"
              style={{ minHeight: "56px" }}>
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Gallery picker */}
        <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={onInputChange} />
      </div>

      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}
      <InstallBanner show={showInstallBanner} onClose={() => setShowInstallBanner(false)} />
      <ReviewPopup show={showReview} onClose={() => setShowReview(false)} />
    </div>
  );
}
