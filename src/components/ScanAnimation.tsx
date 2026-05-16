"use client";

import { useEffect, useState } from "react";

export function ScanAnimation() {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        const next = prev + direction * 2;
        if (next >= 100) setDirection(-1);
        if (next <= 0) setDirection(1);
        return next;
      });
    }, 16);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl">
      {/* Corner brackets */}
      <div className="absolute top-4 left-4 h-8 w-8 border-t-2 border-l-2 border-[#C9A84C]" />
      <div className="absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 border-[#C9A84C]" />
      <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-[#C9A84C]" />
      <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-[#C9A84C]" />

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-0.5 transition-none"
        style={{
          top: `${position}%`,
          background: "linear-gradient(90deg, transparent 0%, #C9A84C 20%, #E2C06D 50%, #C9A84C 80%, transparent 100%)",
          boxShadow: "0 0 12px 3px rgba(201,168,76,0.6)",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center reticle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border border-[#C9A84C]/40 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-[#C9A84C]/60" />
          <div className="absolute inset-[22px] rounded-full bg-[#C9A84C]/80" />
        </div>
      </div>
    </div>
  );
}
