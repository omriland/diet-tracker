"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { setDayMetaDoneLogging } from "@/lib/firestore/day-meta";
import { cn } from "@/lib/utils";

interface DoneLoggingButtonProps {
  uid: string;
  date: string;
  done: boolean;
  onCelebrate: () => void;
}

export function DoneLoggingButton({
  uid,
  date,
  done,
  onCelebrate,
}: DoneLoggingButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    const next = !done;
    try {
      await setDayMetaDoneLogging(uid, date, next);
      if (next) onCelebrate();
    } catch (err) {
      console.error("Failed to toggle doneLogging", err);
      toast.error("Couldn't save — try again");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "mt-5 mb-2 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-all active:scale-[0.99]",
        done
          ? "glass text-muted-foreground"
          : "glow-accent bg-accent text-accent-foreground hover:brightness-105"
      )}
    >
      {done && <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />}
      {done ? "Done logging · tap to undo" : "Done logging"}
    </button>
  );
}
