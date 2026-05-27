"use client";

import { cn } from "@/lib/utils";

interface CalorieHeroProps {
  consumed: number;
  target: number;
  remaining: number;
}

/**
 * Hero block at the top of Today view.
 * Big mono number, thin accent progress bar, "remaining" muted.
 */
export function CalorieHero({ consumed, target, remaining }: CalorieHeroProps) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  const over = consumed > target;

  return (
    <section className="pb-6">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-5xl leading-none tracking-tight tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {consumed.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm">
            of {target.toLocaleString()}
          </span>
        </div>
        <span
          className={cn(
            "text-xs tracking-[0.18em] uppercase",
            over ? "text-warning" : "text-muted-foreground"
          )}
        >
          {over ? "Over" : `${Math.round(pct)}%`}
        </span>
      </div>

      <div className="bg-hairline relative mt-5 h-px w-full overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out",
            over ? "bg-warning" : "bg-accent"
          )}
          style={{ width: `${Math.min(100, pct)}%`, height: "2px", top: "-0.5px" }}
        />
      </div>

      <p className="text-muted-foreground mt-3 text-xs">
        {over ? (
          <>
            <span className="text-warning tabular-nums">
              +{(consumed - target).toLocaleString()}
            </span>{" "}
            over budget
          </>
        ) : (
          <>
            <span className="text-foreground tabular-nums">
              {remaining.toLocaleString()}
            </span>{" "}
            remaining
          </>
        )}
      </p>
    </section>
  );
}

/** Back-compat alias for any external import paths */
export const CalorieProgress = CalorieHero;
