"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatWeekday, formatMonthDay } from "@/lib/dates/jerusalem";

interface DayHeaderProps {
  date: string;
  onPrev: () => void;
  onNext: () => void;
}

export function DayHeader({ date, onPrev, onNext }: DayHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-hairline py-4">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous day"
        className="inline-flex h-9 w-9 items-center justify-center text-foreground transition-opacity hover:opacity-60"
      >
        <ChevronLeft className="h-6 w-6" strokeWidth={2} />
      </button>
      <h1 className="text-[17px] font-bold text-foreground">
        {formatWeekday(date)}, {formatMonthDay(date)}
      </h1>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next day"
        className="inline-flex h-9 w-9 items-center justify-center text-foreground transition-opacity hover:opacity-60"
      >
        <ChevronRight className="h-6 w-6" strokeWidth={2} />
      </button>
    </header>
  );
}
