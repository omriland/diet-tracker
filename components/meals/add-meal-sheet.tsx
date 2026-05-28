"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { fetchMealEstimate, EstimateCancelledError } from "@/lib/estimation/fetch-estimate";
import type { MealEstimate } from "@/lib/anthropic/schemas";
import type { MealSlot } from "@/types/meal";
import { MEAL_SLOTS } from "@/types/meal";

type EstimateSource = "AI" | "AI_CACHED";

interface AddMealSheetProps {
  open: boolean;
  slot: MealSlot | null;
  uid: string | undefined;
  onOpenChange: (open: boolean) => void;
  onConfirm: (params: {
    text: string;
    estimate: MealEstimate;
    source: EstimateSource;
  }) => Promise<void>;
  onManualSave: (params: { text: string; calories: number }) => Promise<void>;
}

export function AddMealSheet({
  open,
  slot,
  uid,
  onOpenChange,
  onConfirm,
  onManualSave,
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
            onManualSave={onManualSave}
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
  onManualSave,
  onClose,
}: {
  slot: MealSlot;
  uid: string;
  onConfirm: AddMealSheetProps["onConfirm"];
  onManualSave: AddMealSheetProps["onManualSave"];
  onClose: () => void;
}) {
  const slotMeta = MEAL_SLOTS.find((s) => s.slot === slot);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const { estimate, source } = await fetchMealEstimate(uid, trimmed, ctrl.signal);
      if (ctrl.signal.aborted) return;
      await onConfirm({ text: trimmed, estimate, source });
      onClose();
    } catch (err) {
      if (err instanceof EstimateCancelledError) return;
      try {
        await onManualSave({ text: trimmed, calories: 0 });
        const message = err instanceof Error ? err.message : "Estimate failed";
        toast.error(message, { description: "Open the entry to set calories manually." });
        onClose();
      } finally {
        setSubmitting(false);
      }
      return;
    } finally {
      setSubmitting(false);
    }
  }

  const canAdd = text.trim().length > 0 && !submitting;

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
        disabled={!canAdd}
        onClick={() => void handleAdd()}
        className="w-full"
      >
        {submitting ? "Estimating…" : "Add meal"}
      </Button>
    </div>
  );
}
