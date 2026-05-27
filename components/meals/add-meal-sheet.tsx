"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { MealSlot } from "@/types/meal";
import { MEAL_SLOTS } from "@/types/meal";

interface AddMealSheetProps {
  open: boolean;
  slot: MealSlot | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (text: string) => Promise<void>;
}

export function AddMealSheet({
  open,
  slot,
  onOpenChange,
  onSubmit,
}: AddMealSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false}>
        {slot && (
          <AddMealForm
            key={slot}
            slot={slot}
            onSubmit={onSubmit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function AddMealForm({
  slot,
  onSubmit,
  onClose,
}: {
  slot: MealSlot;
  onSubmit: (text: string) => Promise<void>;
  onClose: () => void;
}) {
  const slotMeta = MEAL_SLOTS.find((s) => s.slot === slot);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Slight delay so the sheet finishes its enter transition first
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setText("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2 pb-1">
      <div className="flex items-baseline justify-between">
        <h2
          className="font-display text-2xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {slotMeta?.label}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-[11px] tracking-[0.18em] uppercase"
        >
          Cancel
        </button>
      </div>

      <textarea
        ref={inputRef}
        dir="auto"
        lang="he"
        rows={3}
        placeholder="חביתה משתי ביצים עם לחם"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            void handleSubmit(e);
          }
        }}
        disabled={submitting}
        className="border-hairline placeholder:text-muted-foreground/60 w-full resize-none border-b bg-transparent pb-3 text-[20px] leading-snug text-foreground outline-none focus:border-accent"
      />

      <Button
        type="submit"
        variant="accent"
        size="lg"
        disabled={submitting || !text.trim()}
        className="w-full"
      >
        {submitting ? "Saving…" : "Log meal"}
      </Button>
    </form>
  );
}
