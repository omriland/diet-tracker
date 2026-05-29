"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MealSlot } from "@/types/meal";
import { MEAL_SLOTS } from "@/types/meal";

interface AddMealSheetProps {
  open: boolean;
  slot: MealSlot | null;
  uid: string | undefined;
  onOpenChange: (open: boolean) => void;
  onConfirm: (text: string) => Promise<void>;
}

export function AddMealSheet({
  open,
  slot,
  uid,
  onOpenChange,
  onConfirm,
}: AddMealSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
        {slot && uid && (
          <AddMealForm
            key={slot}
            slot={slot}
            uid={uid}
            onConfirm={onConfirm}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function AddMealForm({
  slot,
  uid,
  onConfirm,
  onClose,
}: {
  slot: MealSlot;
  uid: string;
  onConfirm: AddMealSheetProps["onConfirm"];
  onClose: () => void;
}) {
  const slotMeta = MEAL_SLOTS.find((s) => s.slot === slot);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(trimmed);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add meal";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const hasText = text.trim().length > 0;

  return (
    <div className="flex flex-col gap-5 pb-2">
      <header className="flex items-center justify-between border-b border-hairline pb-3 pr-10">
        <h2 className="text-[18px] font-bold text-foreground">
          Add {slotMeta?.label.toLowerCase()} entry
        </h2>
      </header>

      <div className="flex flex-col gap-2">
        <label className="text-[15px] font-bold text-foreground">What did you eat?</label>
        <textarea
          ref={inputRef}
          dir="auto"
          lang="he"
          rows={4}
          placeholder="…חביתה משתי ביצים עם פרוסת לחם"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              void handleAdd();
            }
          }}
          className="w-full resize-none rounded-xl bg-subtle p-4 text-[15px] leading-snug text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <p className="text-xs text-muted-foreground">Type in Hebrew for AI calorie estimation</p>
      </div>

      <Button
        type="button"
        variant="accent"
        size="lg"
        disabled={!hasText || submitting}
        aria-busy={submitting}
        onClick={() => void handleAdd()}
        className="w-full overflow-hidden"
      >
        Add meal
      </Button>
    </div>
  );
}
