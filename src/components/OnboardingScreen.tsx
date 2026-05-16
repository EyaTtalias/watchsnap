"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Zap } from "lucide-react";

const PLANS = [
  {
    id: "free",
    Icon: Zap,
    title: "Free",
    price: "3 Free Scans",
    desc: "Try WatchSnap at no cost",
    features: ["3 AI scans", "Brand & model ID", "Basic market value"],
    iconColor: "text-gray-300",
    iconBg: "bg-[#1E1E1E]",
    border: "border-[#2A2A2A]",
    activeBorder: "border-white/40",
  },
  {
    id: "weekly",
    Icon: Crown,
    title: "Weekly Trial",
    price: "$4.99 / week",
    desc: "Try Pro — cancel anytime",
    features: ["Unlimited scans", "Full auth report", "Market data"],
    badge: "Try Premium",
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    border: "border-blue-500/20",
    activeBorder: "border-blue-400",
  },
  {
    id: "monthly",
    Icon: Crown,
    title: "Monthly Pro",
    price: "$9.99 / month",
    desc: "Best for serious collectors",
    features: ["Unlimited scans", "30-pt auth check", "Priority AI"],
    badge: "Most Popular",
    iconColor: "text-[#C9A84C]",
    iconBg: "bg-[#C9A84C]/10",
    border: "border-[#C9A84C]/30",
    activeBorder: "border-[#C9A84C]",
  },
];

export function OnboardingScreen() {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem("ws_onboarding_done")) setShow(true);
    } catch {}
  }, []);

  const handleContinue = () => {
    if (!selected) return;
    try {
      localStorage.setItem("ws_onboarding_done", "1");
      localStorage.setItem("ws_onboarding_plan", selected);
    } catch {}
    setShow(false);
    if (selected !== "free") window.location.href = "/paywall";
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-y-auto bg-[#0A0A0A] p-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(201,168,76,0.14) 0%, transparent 65%)" }}
      />

      <div className="relative w-full max-w-md py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/8 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C] animate-pulse" />
            <span className="text-xs font-semibold text-[#C9A84C]">Welcome to WatchSnap</span>
          </div>
          <h1 className="text-4xl font-black">
            Choose Your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E2C06D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Plan
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Start free or go Pro — upgrade or cancel anytime.</p>
        </div>

        {/* Plans */}
        <div className="space-y-3 mb-6">
          {PLANS.map((plan) => {
            const active = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                className={`relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
                  active ? plan.activeBorder + " bg-[#141208]" : plan.border + " bg-[#111111]"
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#A8882F] px-3 py-0.5 text-[10px] font-black text-black">
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${plan.iconBg}`}>
                    <plan.Icon className={`h-4 w-4 ${plan.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-black text-white">{plan.title}</span>
                      <span className={`text-sm font-bold ${plan.iconColor}`}>{plan.price}</span>
                    </div>
                    <p className="text-xs text-gray-500">{plan.desc}</p>
                  </div>
                  <div
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      active ? "border-[#C9A84C] bg-[#C9A84C]" : "border-[#333]"
                    }`}
                  >
                    {active && <Check className="h-3 w-3 text-black" />}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {plan.features.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-[11px] text-gray-500">
                      <span className="text-[#C9A84C]">✓</span> {f}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA */}
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="w-full rounded-2xl py-4 text-base font-black text-black transition-all disabled:opacity-35 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #C9A84C 0%, #E2C06D 50%, #A8882F 100%)" }}
        >
          Continue →
        </button>
        <p className="mt-3 text-center text-xs text-gray-600">
          Secure checkout · Cancel anytime · No hidden fees
        </p>
      </div>
    </div>
  );
}
