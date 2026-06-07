"use client";

import { formatInTimeZone } from "date-fns-tz";
import { parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { JERUSALEM_TZ } from "@/lib/dates/jerusalem";
import type { DayCalorieEntry } from "@/lib/stats/compute";

function shortDay(dateStr: string): string {
  return formatInTimeZone(parseISO(dateStr), JERUSALEM_TZ, "EEEEEE");
}

export function WeeklyCaloriesChart({
  entries,
  today,
}: {
  entries: DayCalorieEntry[];
  today: string;
}) {
  const maxVal = Math.max(...entries.flatMap((e) => [e.consumed, e.target]), 1);

  const daysOver = entries.filter(
    (e) => e.mealCount > 0 && e.consumed > e.target && e.date !== today
  ).length;

  return (
    <div className="rounded-2xl bg-muted p-4">
      <p className="text-[13px] font-extrabold uppercase tracking-wide text-muted-foreground">
        Last 7 days
      </p>

      <div className="mt-3 flex gap-1.5" style={{ height: "8rem" }}>
        {entries.map((entry) => {
          const consumedPct = Math.min((entry.consumed / maxVal) * 100, 100);
          const targetPct = Math.min((entry.target / maxVal) * 100, 100);
          const isToday = entry.date === today;
          const hasData = entry.mealCount > 0;
          const over = hasData && entry.consumed > entry.target;

          return (
            <div key={entry.date} className="flex flex-1 flex-col items-center">
              <div className="relative w-full flex-1 mb-1.5">
                {/* Bar background */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-lg transition-colors",
                    isToday ? "bg-green-light ring-2 ring-accent/25" : "bg-subtle"
                  )}
                />

                {/* Consumed fill */}
                {hasData && (
                  <div
                    className={cn(
                      "absolute bottom-0 w-full rounded-lg transition-[height] duration-500",
                      over ? "bg-red-dark" : "bg-green-dark"
                    )}
                    style={{ height: `max(${consumedPct}%, 0.5rem)` }}
                  />
                )}

                {/* Target line */}
                <div
                  className="absolute w-full border-t-2 border-dashed border-foreground/35"
                  style={{ bottom: `calc(${targetPct}% - 1px)` }}
                />
              </div>

              <span
                className={cn(
                  "shrink-0 text-[11px]",
                  isToday
                    ? "font-extrabold text-foreground"
                    : "font-medium text-muted-foreground"
                )}
              >
                {shortDay(entry.date)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground">
        <span>
          <span className="font-bold text-foreground">{daysOver}</span> over prior to today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 border-t-2 border-dashed border-foreground/35" />
          target
        </span>
      </div>
    </div>
  );
}
