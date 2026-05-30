"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CalorieHeroProps {
  consumed: number;
  target: number;
  remaining: number;
  action?: ReactNode;
}

export function CalorieHero({ consumed, target, remaining, action }: CalorieHeroProps) {
  const over = consumed > target;
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;

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
        Calories today
      </p>
      <p className="mt-1 text-[40px] font-extrabold leading-none tabular-nums text-foreground">
        {consumed.toLocaleString()}
      </p>
      <p className="mt-1 text-sm tabular-nums text-subtle-foreground">
        {over
          ? `${(consumed - target).toLocaleString()} kcal over · target ${target.toLocaleString()}`
          : `${remaining.toLocaleString()} kcal remaining · target ${target.toLocaleString()}`}
      </p>
      <div
        className={cn(
          "mt-4 h-2 w-full overflow-hidden rounded-full",
          over ? "bg-red-mid/50" : "bg-green-mid/60"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            over ? "bg-red-dark" : "bg-green-dark"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}

export const CalorieProgress = CalorieHero;
