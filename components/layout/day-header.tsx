"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatMonthDay,
  formatWeekday,
  formatYear,
  getJerusalemDateString,
} from "@/lib/dates/jerusalem";

interface DayHeaderProps {
  date: string;
  onPrev: () => void;
  onNext: () => void;
}

export function DayHeader({ date, onPrev, onNext }: DayHeaderProps) {
  const today = getJerusalemDateString();
  const isToday = date === today;
  const subtitle = isToday ? `Today · ${formatWeekday(date)}` : formatWeekday(date);

  return (
    <header className="relative flex items-center justify-between pt-6 pb-7">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous day"
        className="text-muted-foreground hover:text-foreground -ms-2 inline-flex h-9 w-9 items-center justify-center transition-colors"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
      </button>
      <div className="text-center leading-none">
        <h1
          className="font-display text-3xl tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {formatMonthDay(date)}
        </h1>
        <p className="text-muted-foreground mt-2 text-[11px] tracking-[0.22em] uppercase">
          {subtitle} · {formatYear(date)}
        </p>
      </div>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next day"
        className="text-muted-foreground hover:text-foreground -me-2 inline-flex h-9 w-9 items-center justify-center transition-colors"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
      </button>
    </header>
  );
}
