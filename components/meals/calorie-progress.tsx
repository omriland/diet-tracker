"use client";

import { cn } from "@/lib/utils";

interface CalorieHeroProps {
  consumed: number;
  target: number;
  remaining: number;
}

export function CalorieHero({ consumed, target, remaining }: CalorieHeroProps) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const over = consumed > target;

  return (
    <section className="border-b border-hairline py-5">
      <div className="flex items-baseline gap-2">
        <span className="text-[36px] font-bold leading-none tabular-nums text-foreground">
          {consumed.toLocaleString()}
        </span>
        <span className="text-[16px] text-muted-foreground">
          / {target.toLocaleString()} kcal
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-subtle">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            over ? "bg-warning" : "bg-accent"
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      <p className={cn("mt-3 text-sm tabular-nums", over ? "text-warning" : "text-accent")}>
        {over
          ? `${(consumed - target).toLocaleString()} kcal over`
          : `${remaining.toLocaleString()} kcal remaining`}
      </p>
    </section>
  );
}

export const CalorieProgress = CalorieHero;
