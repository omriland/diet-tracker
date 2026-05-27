"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setDayMetaSport } from "@/lib/firestore/day-meta";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import { cn } from "@/lib/utils";

interface SportToggleProps {
  uid: string;
  date: string;
  active: boolean;
  bonusKcal: number;
}

export function SportToggle({ uid, date, active, bonusKcal }: SportToggleProps) {
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) return;
    setPending(true);
    try {
      await setDayMetaSport(uid, date, !active);
    } catch (err) {
      console.error("Failed to toggle sport", err);
      toast.error("Couldn't save sport flag");
    } finally {
      setPending(false);
    }
  }

  const bonus = bonusKcal || SPORT_BONUS_KCAL;

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={active}
      disabled={pending}
      className={cn(
        "border-hairline group flex w-full items-center justify-between border-b py-3 transition-colors",
        active && "border-accent/40"
      )}
    >
      <span className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
        Sport today
      </span>
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "text-xs tabular-nums transition-colors",
            active ? "text-accent" : "text-muted-foreground/60"
          )}
        >
          +{bonus} kcal
        </span>
        <Switch active={active} />
      </span>
    </button>
  );
}

function Switch({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200",
        active ? "bg-accent" : "bg-subtle"
      )}
      aria-hidden
    >
      <span
        className={cn(
          "block h-3.5 w-3.5 transform rounded-full bg-background transition-transform duration-200 ease-out",
          active ? "translate-x-[20px]" : "translate-x-[3px]"
        )}
      />
    </span>
  );
}
