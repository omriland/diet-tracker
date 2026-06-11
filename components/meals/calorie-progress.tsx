"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAnimatedNumber } from "@/hooks/use-animated-number";

const SIZE = 208;
const STROKE = 13;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CalorieHeroProps {
  consumed: number;
  target: number;
  remaining: number;
  action?: ReactNode;
}

export function CalorieHero({ consumed, target, remaining, action }: CalorieHeroProps) {
  const over = consumed > target;
  const pct = target > 0 ? Math.min(1, consumed / target) : 0;
  // Lead with the actionable number: what's left in the budget (or how far over).
  const heroValue = useAnimatedNumber(over ? consumed - target : Math.max(0, remaining));

  // Start the arc at zero so it sweeps in on first paint and on day changes.
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setDrawn(pct));
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  return (
    <section className="relative mt-3 rounded-3xl border border-hairline bg-surface px-5 pb-5 pt-6 shadow-[0_8px_30px_rgba(19,43,33,0.06)] dark:shadow-none">
      {action && <div className="absolute right-4 top-4 z-10">{action}</div>}

      <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="-rotate-90"
          aria-hidden
        >
          <defs>
            <linearGradient id="cal-ring-ok" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--green-mid)" }} />
              <stop offset="100%" style={{ stopColor: "var(--green-dark)" }} />
            </linearGradient>
            <linearGradient id="cal-ring-over" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" style={{ stopColor: "var(--red-mid)" }} />
              <stop offset="100%" style={{ stopColor: "var(--red-dark)" }} />
            </linearGradient>
          </defs>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={over ? "url(#cal-ring-over)" : "url(#cal-ring-ok)"}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - drawn)}
            style={{
              transition: "stroke-dashoffset 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p
            className={cn(
              "text-[11px] font-extrabold uppercase tracking-[0.14em]",
              over ? "text-red-dark" : "text-muted-foreground"
            )}
          >
            {over ? "Over budget" : "Remaining"}
          </p>
          <p
            className="mt-1 text-[44px] font-extrabold leading-none tabular-nums text-foreground"
            aria-live="polite"
          >
            {heroValue.toLocaleString()}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-muted-foreground">kcal</p>
        </div>
      </div>

      <div className="mt-5 flex items-stretch justify-center border-t border-hairline pt-4">
        <HeroStat label="Eaten" value={consumed} />
        <div className="mx-7 w-px bg-hairline" aria-hidden />
        <HeroStat label="Target" value={target} />
      </div>
    </section>
  );
}

function HeroStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="mt-0.5 text-[17px] font-extrabold tabular-nums text-foreground">
        {value.toLocaleString()}
      </span>
    </div>
  );
}

export const CalorieProgress = CalorieHero;
