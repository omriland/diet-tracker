"use client";

import { useState } from "react";
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
        "mt-6 mb-2 w-full rounded-xl py-4 text-sm font-medium tracking-wide transition-all duration-200",
        done
          ? "bg-subtle text-muted-foreground"
          : "bg-accent text-accent-foreground active:scale-[0.98]"
      )}
    >
      {done ? "✓ Logged today · tap to undo" : "Done logging for today"}
    </button>
  );
}
