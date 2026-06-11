"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAnimatedNumber } from "@/hooks/use-animated-number";

interface CalorieHeroProps {
  consumed: number;
  target: number;
  remaining: number;
  action?: ReactNode;
}

export function CalorieHero({ consumed, target, remaining, action }: CalorieHeroProps) {
  const over = consumed > target;
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  // Lead with the actionable number: what's left in the budget (or how far over).
  const heroValue = useAnimatedNumber(over ? consumed - target : Math.max(0, remaining));

  return (
    <section
      className={cn(
        "relative mt-2 rounded-2xl px-5 py-5",
        over ? "bg-red-light" : "bg-green-light"
      )}
    >
      {action && <div className="absolute right-4 top-4">{action}</div>}
      <p
        className={cn(
          "text-[11px] font-extrabold uppercase tracking-wider",
          over ? "text-red-dark" : "text-green-dark"
        )}
      >
        {over ? "Over budget" : "Remaining today"}
      </p>
      <p className="mt-1 flex items-baseline gap-1.5 text-[40px] font-extrabold leading-none tabular-nums text-foreground">
        {heroValue.toLocaleString()}
        <span className="text-[15px] font-bold text-subtle-foreground/70">kcal</span>
      </p>
      <p className="mt-1.5 text-sm tabular-nums text-subtle-foreground">
        {consumed.toLocaleString()} of {target.toLocaleString()} kcal eaten
      </p>
      <div
        className={cn(
          "mt-4 h-2 w-full overflow-hidden rounded-full",
          over ? "bg-red-mid/50" : "bg-green-mid/60"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
            over ? "bg-red-dark" : "bg-green-dark"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}

export const CalorieProgress = CalorieHero;
