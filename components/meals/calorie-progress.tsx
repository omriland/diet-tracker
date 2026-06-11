"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAnimatedNumber } from "@/hooks/use-animated-number";

const SIZE = 240;
const TICKS = 48;
/** Instrument-style 270° sweep, opening at the bottom. */
const START_DEG = 135;
const SWEEP_DEG = 270;
const R_OUTER = SIZE / 2 - 6;
const R_INNER = R_OUTER - 16;

interface CalorieHeroProps {
  consumed: number;
  target: number;
  remaining: number;
  action?: ReactNode;
}

interface Tick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  frac: number;
}

const TICK_GEOMETRY: Tick[] = Array.from({ length: TICKS }, (_, i) => {
  const frac = i / (TICKS - 1);
  const rad = ((START_DEG + frac * SWEEP_DEG) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const c = SIZE / 2;
  return {
    x1: c + R_INNER * cos,
    y1: c + R_INNER * sin,
    x2: c + R_OUTER * cos,
    y2: c + R_OUTER * sin,
    frac,
  };
});

export function CalorieHero({ consumed, target, remaining, action }: CalorieHeroProps) {
  const over = consumed > target;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  // Lead with the actionable number: what's left in the budget (or how far over).
  const heroValue = useAnimatedNumber(over ? consumed - target : Math.max(0, remaining));

  // Start at zero so the ticks sweep on first paint and on day changes.
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  const litColor = over ? "var(--red-dark)" : "var(--accent)";

  return (
    <section className="glass relative mt-4 overflow-hidden rounded-3xl px-5 pb-5 pt-6">
      {/* Soft state-colored bloom behind the gauge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl transition-colors duration-700"
        style={{
          backgroundColor: over
            ? "rgba(255, 122, 110, 0.14)"
            : "rgba(205, 251, 81, 0.12)",
        }}
      />

      {action && <div className="absolute right-4 top-4 z-10">{action}</div>}

      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
          {TICK_GEOMETRY.map((t, i) => {
            const lit = drawn > 0 && t.frac <= drawn;
            return (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={lit ? litColor : "rgba(255,255,255,0.10)"}
                strokeWidth={3.5}
                strokeLinecap="round"
                style={{
                  transition: `stroke 300ms ease ${i * 14}ms`,
                }}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className={cn(
              "text-[11px] font-extrabold uppercase tracking-[0.2em]",
              over ? "text-red-dark" : "text-muted-foreground"
            )}
          >
            {over ? "Over budget" : "Remaining"}
          </p>
          <p
            className={cn(
              "font-display mt-1.5 text-[56px] font-bold leading-none tabular-nums",
              over ? "text-gradient-ember" : "text-gradient-volt"
            )}
            aria-live="polite"
          >
            {heroValue.toLocaleString()}
          </p>
          <p className="mt-1.5 text-[13px] font-semibold text-muted-foreground">kcal</p>
        </div>

        {/* Percent chip sits in the gauge's bottom opening */}
        <div className="absolute inset-x-0 bottom-1 flex justify-center">
          <span
            className={cn(
              "rounded-pill px-2.5 py-1 text-[11px] font-bold tabular-nums",
              over ? "bg-red-light text-red-dark" : "bg-accent-soft text-accent"
            )}
          >
            {target > 0 ? Math.round((consumed / target) * 100) : 0}%
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-stretch justify-center border-t border-white/5 pt-4">
        <HeroStat label="Eaten" value={consumed} />
        <div className="mx-8 w-px bg-white/8" aria-hidden />
        <HeroStat label="Target" value={target} />
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <span className="font-display mt-1 text-[18px] font-bold tabular-nums text-foreground">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export const CalorieProgress = CalorieHero;
