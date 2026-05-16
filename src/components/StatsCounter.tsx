"use client";

import { useEffect, useRef, useState } from "react";

type Stat =
  | { kind: "number"; target: number; suffix: string; label: string }
  | { kind: "raw"; display: string; label: string };

const STATS: Stat[] = [
  { kind: "number", target: 50000, suffix: "+", label: "Watches Scanned" },
  { kind: "number", target: 98,    suffix: "%", label: "ID Accuracy"     },
  { kind: "number", target: 1000,  suffix: "+", label: "Brands Covered"  },
  { kind: "raw",    display: "< 15s",           label: "Average Result"  },
];

function AnimatedNumber({ target, suffix, started }: {
  target: number; suffix: string; started: boolean;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!started) return;
    let cur = 0;
    const inc = target / (1000 / 16);
    const id = setInterval(() => {
      cur = Math.min(cur + inc, target);
      setN(Math.floor(cur));
      if (cur >= target) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [started, target]);
  return <>{n.toLocaleString()}{suffix}</>;
}

export function StatsCounter() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setTimeout(() => setStarted(true), 200);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className="relative flex flex-col items-center text-center transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transitionDelay: `${i * 100}ms`,
          }}
        >
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: visible
                ? "0 0 40px 0px rgba(201,168,76,0.18), 0 0 80px 0px rgba(201,168,76,0.08)"
                : "none",
              transition: "box-shadow 1s ease",
              transitionDelay: `${i * 100 + 400}ms`,
            }}
          />

          {/* Card */}
          <div
            className="relative w-full rounded-3xl border border-[#C9A84C]/20 bg-[#0D0D0D] px-4 py-7 overflow-hidden"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 70%), #0D0D0D",
            }}
          >
            {/* Top gold line */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-px rounded-full transition-all duration-700"
              style={{
                width: visible ? "70%" : "0%",
                background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.7), transparent)",
                transitionDelay: `${i * 100 + 300}ms`,
              }}
            />

            {/* Number */}
            <p
              className="text-5xl font-black leading-none sm:text-6xl"
              style={{
                background: "linear-gradient(135deg, #C9A84C 0%, #F0D060 45%, #A8882F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: visible ? "drop-shadow(0 0 12px rgba(201,168,76,0.55))" : "none",
                transition: "filter 1s ease",
                transitionDelay: `${i * 100 + 400}ms`,
              }}
            >
              {stat.kind === "number"
                ? <AnimatedNumber target={stat.target} suffix={stat.suffix} started={started} />
                : stat.display}
            </p>

            {/* Label */}
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
