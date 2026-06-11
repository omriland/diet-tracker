"use client";

import { ChevronLeft, ChevronRight, Undo2 } from "lucide-react";
import {
  addDaysToDateString,
  formatDayHeader,
  formatWeekday,
  formatMonthDay,
  getJerusalemDateString,
  subtractDaysFromDateString,
} from "@/lib/dates/jerusalem";

interface DayHeaderProps {
  date: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DayHeader({ date, onPrev, onNext, onToday }: DayHeaderProps) {
  const today = getJerusalemDateString();
  const isToday = date === today;

  const title = isToday
    ? "Today"
    : date === subtractDaysFromDateString(today, 1)
      ? "Yesterday"
      : date === addDaysToDateString(today, 1)
        ? "Tomorrow"
        : formatDayHeader(date);

  return (
    <header className="flex items-center justify-between border-b border-hairline py-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous day"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all hover:bg-subtle active:scale-90"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2} />
      </button>

      <button
        type="button"
        onClick={isToday ? undefined : onToday}
        disabled={isToday}
        aria-label={isToday ? undefined : "Back to today"}
        className="flex min-w-0 flex-col items-center transition-transform active:scale-95 disabled:active:scale-100"
      >
        <h1 className="text-[17px] font-bold leading-tight text-foreground">{title}</h1>
        {isToday ? (
          <span className="text-xs font-medium text-muted-foreground">
            {formatWeekday(date)}, {formatMonthDay(date)}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-semibold text-accent">
            <Undo2 className="h-3 w-3" strokeWidth={2.5} aria-hidden />
            Back to today
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next day"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all hover:bg-subtle active:scale-90"
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2} />
      </button>
    </header>
  );
}
