"use client";

import { useState, useRef, useEffect } from "react";
import { X, Terminal, RotateCcw, Crown, ShieldOff } from "lucide-react";

interface DevMenuProps {
  open: boolean;
  onClose: () => void;
}

const DEV_PASSWORD = "watchsnap2024";

type Screen = "password" | "menu";

export function DevMenu({ open, onClose }: DevMenuProps) {
  const [screen, setScreen]     = useState<Screen>("password");
  const [input, setInput]       = useState("");
  const [pwError, setPwError]   = useState(false);
  const [toast, setToast]       = useState("");
  const inputRef                = useRef<HTMLInputElement>(null);

  // Reset state every time the menu opens
  useEffect(() => {
    if (open) {
      setScreen("password");
      setInput("");
      setPwError(false);
      setToast("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === DEV_PASSWORD) {
      setPwError(false);
      setScreen("menu");
    } else {
      setPwError(true);
      setInput("");
      setTimeout(() => setPwError(false), 1200);
    }
  }

  function resetScans() {
    localStorage.removeItem("watchsnap_scans_used");   // unified key
    showToast("Scan counter reset — refresh to see changes");
  }

  function activatePro() {
    localStorage.setItem("watchsnap_pro", "1");
    showToast("Pro activated — refresh the app");
  }

  function removePro() {
    localStorage.removeItem("watchsnap_pro");
    showToast("Pro removed — refresh the app");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xs rounded-3xl border border-[#2A2A2A] bg-[#111111] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E1E1E]">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-[#C9A84C]" />
            <span className="text-sm font-black text-white tracking-wide">
              DEV MENU
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Password screen ── */}
        {screen === "password" && (
          <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
            <p className="text-xs text-gray-500 text-center">
              Enter developer password to continue
            </p>
            <input
              ref={inputRef}
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Password"
              className={`w-full rounded-xl border px-4 py-3 text-sm bg-[#0A0A0A] text-white outline-none transition-all placeholder:text-gray-600 ${
                pwError
                  ? "border-red-500/70 animate-[shake_0.3s_ease-in-out]"
                  : "border-[#2A2A2A] focus:border-[#C9A84C]/60"
              }`}
            />
            {pwError && (
              <p className="text-xs text-red-400 text-center -mt-1">
                Wrong password
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-black text-black transition-all active:scale-95"
              style={{ background: "linear-gradient(135deg, #C9A84C, #A8882F)" }}
            >
              Unlock
            </button>
          </form>
        )}

        {/* ── Dev actions screen ── */}
        {screen === "menu" && (
          <div className="p-5 space-y-3">
            <p className="text-[11px] text-gray-600 text-center uppercase tracking-widest mb-4">
              Developer Tools
            </p>

            <button
              onClick={resetScans}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3.5 text-left text-sm font-semibold text-white hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all active:scale-[0.97]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 flex-shrink-0">
                <RotateCcw className="h-4 w-4 text-orange-400" />
              </div>
              <div>
                <p className="font-black text-white">Reset scans</p>
                <p className="text-[11px] text-gray-500 font-normal">
                  Clears watchsnap_scans_used
                </p>
              </div>
            </button>

            <button
              onClick={activatePro}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3.5 text-left text-sm font-semibold text-white hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/5 transition-all active:scale-[0.97]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A84C]/10 flex-shrink-0">
                <Crown className="h-4 w-4 text-[#C9A84C]" />
              </div>
              <div>
                <p className="font-black text-white">Activate Pro</p>
                <p className="text-[11px] text-gray-500 font-normal">
                  Sets watchsnap_pro = "1"
                </p>
              </div>
            </button>

            <button
              onClick={removePro}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-3.5 text-left text-sm font-semibold text-white hover:border-red-500/30 hover:bg-red-500/5 transition-all active:scale-[0.97]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 flex-shrink-0">
                <ShieldOff className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="font-black text-white">Remove Pro</p>
                <p className="text-[11px] text-gray-500 font-normal">
                  Removes watchsnap_pro
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Toast notification */}
        <div
          className={`px-5 pb-5 transition-all duration-300 ${
            toast ? "opacity-100 max-h-12" : "opacity-0 max-h-0 overflow-hidden"
          }`}
        >
          <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-2.5 text-center">
            <p className="text-xs font-bold text-emerald-400">{toast}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-6px); }
          75%       { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
