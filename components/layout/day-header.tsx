"use client";

import { Undo2 } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { parseISO } from "date-fns";
import {
  addDaysToDateString,
  formatMonthDay,
  formatWeekday,
  getJerusalemDateString,
  subtractDaysFromDateString,
  JERUSALEM_TZ,
} from "@/lib/dates/jerusalem";
import { cn } from "@/lib/utils";

interface DayHeaderProps {
  date: string;
  onSelectDate: (date: string) => void;
  onToday: () => void;
}

export function DayHeader({ date, onSelectDate, onToday }: DayHeaderProps) {
  const today = getJerusalemDateString();
  const isToday = date === today;

  const title = isToday
    ? "Today"
    : date === subtractDaysFromDateString(today, 1)
      ? "Yesterday"
      : date === addDaysToDateString(today, 1)
        ? "Tomorrow"
        : formatWeekday(date);

  // Rolling 7-day window centered on the selected date.
  const days = Array.from({ length: 7 }, (_, i) =>
    addDaysToDateString(date, i - 3)
  );

  return (
    <header className="pt-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {formatWeekday(date)} · {formatMonthDay(date)}
          </p>
          <h1 className="font-display mt-0.5 text-[34px] font-bold leading-none text-foreground">
            {title}
          </h1>
        </div>

        {!isToday && (
          <button
            type="button"
            onClick={onToday}
            className="mb-0.5 flex items-center gap-1.5 rounded-pill bg-accent-soft px-3.5 py-2 text-[13px] font-bold text-accent transition-all active:scale-95"
          >
            <Undo2 className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
            Today
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const selected = d === date;
          const isTodayPill = d === today;
          const future = d > today;
          const weekday = formatInTimeZone(parseISO(d), JERUSALEM_TZ, "EEEEEE");
          const dayNum = formatInTimeZone(parseISO(d), JERUSALEM_TZ, "d");
          return (
            <button
              key={d}
              type="button"
              onClick={() => onSelectDate(d)}
              aria-label={formatMonthDay(d)}
              aria-current={selected ? "date" : undefined}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-2xl py-2 transition-all duration-200 active:scale-90",
                selected
                  ? "glow-accent bg-accent text-accent-foreground"
                  : "glass text-muted-foreground hover:text-foreground",
                !selected && future && "opacity-45"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wide",
                  selected ? "text-accent-foreground/70" : ""
                )}
              >
                {weekday}
              </span>
              <span
                className={cn(
                  "font-display text-[15px] font-bold leading-none tabular-nums",
                  selected ? "text-accent-foreground" : "text-foreground"
                )}
              >
                {dayNum}
              </span>
              <span
                className={cn(
                  "h-[3px] w-[3px] rounded-full",
                  isTodayPill && !selected ? "bg-accent" : "bg-transparent"
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
    </header>
  );
}
