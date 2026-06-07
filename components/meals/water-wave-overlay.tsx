"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatLiters } from "@/lib/meals/water";

interface WaterWaveOverlayProps {
  /** Fraction of the daily goal currently reached (0–1+). */
  fillPct: number;
  currentMl: number;
  targetMl: number;
  /** Called once the transient animation has fully faded out. */
  onDone: () => void;
}

// Two stacked wave periods across a doubled-width SVG so a -50% drift loops seamlessly.
const WAVE_PATH = "M0,22 q150,-18 300,0 t300,0 t300,0 t300,0 V44 H0 Z";

// Deterministic bubble field (no Math.random → no hydration surprises, stable across renders).
const BUBBLES = [
  { left: 12, size: 10, dur: 2.4, delay: 0.1 },
  { left: 22, size: 6, dur: 3.1, delay: 0.8 },
  { left: 33, size: 14, dur: 2.8, delay: 0.35 },
  { left: 44, size: 7, dur: 3.4, delay: 1.2 },
  { left: 55, size: 11, dur: 2.6, delay: 0.55 },
  { left: 63, size: 5, dur: 3.6, delay: 0.2 },
  { left: 71, size: 13, dur: 2.9, delay: 0.95 },
  { left: 80, size: 8, dur: 3.2, delay: 0.45 },
  { left: 88, size: 6, dur: 2.7, delay: 1.4 },
  { left: 18, size: 5, dur: 3.5, delay: 1.7 },
  { left: 50, size: 7, dur: 3.0, delay: 1.05 },
  { left: 76, size: 9, dur: 2.5, delay: 0.7 },
];

/**
 * Transient, full-screen "the screen is a glass filling with water" effect.
 * A translucent, refracting water body rises from the bottom of the viewport to
 * `fillPct` of the screen height (top edge = daily goal), sloshes to settle,
 * then the whole layer fades out (~3.5s) and unmounts itself.
 * Purely decorative: never blocks taps.
 */
export function WaterWaveOverlay({
  fillPct,
  currentMl,
  targetMl,
  onDone,
}: WaterWaveOverlayProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || typeof document === "undefined") return null;

  const reached = fillPct >= 1;
  // Keep a small minimum band so even a tiny sip is visibly "in the glass".
  const fillHeight = `${Math.min(Math.max(fillPct, 0.08), 1) * 100}%`;

  return createPortal(
    <div
      aria-hidden
      className="water-glass-fade pointer-events-none fixed inset-0 z-40 overflow-hidden"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone();
      }}
    >
      {/* Glass shell: edge shading + top sheen so the viewport reads as a vessel */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow:
            "inset 0 0 120px 10px rgba(8,47,73,0.16), inset 0 40px 60px -30px rgba(255,255,255,0.45)",
        }}
      />

      {/* Rising water column */}
      <div
        className="water-glass-rise absolute inset-x-0 bottom-0"
        style={{ ["--water-fill" as string]: fillHeight }}
      >
        {/* Surface band: wave crests + meniscus, gently bobbing as it settles */}
        <div className="water-surface-bob absolute -top-6 left-0 right-0 h-8">
          {/* Back wave (light, tall, slow) */}
          <svg
            className="water-wave-drift absolute inset-0 h-full"
            style={{ width: "200%", animationDuration: "4.2s" }}
            viewBox="0 0 1200 44"
            preserveAspectRatio="none"
          >
            <path d={WAVE_PATH} fill="rgba(125,211,252,0.20)" />
          </svg>
          {/* Mid wave */}
          <svg
            className="water-wave-drift absolute inset-0 h-full"
            style={{ width: "200%", animationDuration: "3.1s", animationDirection: "reverse" }}
            viewBox="0 0 1200 44"
            preserveAspectRatio="none"
          >
            <path d={WAVE_PATH} fill="rgba(56,189,248,0.28)" />
          </svg>
          {/* Front wave (densest) + bright meniscus line on its crest */}
          <svg
            className="water-wave-drift absolute inset-0 h-full"
            style={{ width: "200%", animationDuration: "2.4s" }}
            viewBox="0 0 1200 44"
            preserveAspectRatio="none"
          >
            <path d={WAVE_PATH} fill="rgba(14,165,233,0.40)" />
            <path
              d="M0,22 q150,-18 300,0 t300,0 t300,0 t300,0"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Water body: refracts page content behind it for a real "through glass" feel */}
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-t from-sky-600/35 via-sky-500/24 to-sky-300/14 backdrop-blur-[3px] backdrop-saturate-150">
          {/* Caustic shimmer sweeping across the water */}
          <div
            className="water-shimmer absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
            }}
          />
          {/* Rising bubbles */}
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              className="water-bubble absolute rounded-full bg-white/40 ring-1 ring-white/30"
              style={{
                left: `${b.left}%`,
                width: `${b.size}px`,
                height: `${b.size}px`,
                ["--bubble-dur" as string]: `${b.dur}s`,
                ["--bubble-delay" as string]: `${b.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Top scrim: a white veil at the very top that merges into transparency so the readout stays legible without a hard panel edge */}
      <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-white/95 via-white/60 to-transparent" />

      {/* Top-of-page goal readout */}
      <div className="water-label-pop absolute left-1/2 top-[max(env(safe-area-inset-top),1.5rem)] -translate-x-1/2 text-center">
        <p className="text-[40px] font-extrabold leading-none tabular-nums text-sky-600 drop-shadow-[0_1px_8px_rgba(255,255,255,0.8)]">
          {formatLiters(currentMl)}
        </p>
        <p className="mt-1.5 text-[13px] font-bold uppercase tracking-[0.12em] text-sky-700/80">
          {reached ? "Goal reached" : `of ${formatLiters(targetMl)} goal`}
        </p>
      </div>
    </div>,
    document.body
  );
}
