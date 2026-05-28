"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Meal } from "@/types/meal";

interface QuickEditSheetProps {
  open: boolean;
  meal: Meal | null;
  onOpenChange: (open: boolean) => void;
  onSaveText: (text: string) => Promise<void>;
  onSaveCalories: (calories: number) => Promise<void>;
}

export function QuickEditSheet({
  open,
  meal,
  onOpenChange,
  onSaveText,
  onSaveCalories,
}: QuickEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
        {meal && (
          <QuickEditForm
            key={meal.id}
            meal={meal}
            onSaveText={onSaveText}
            onSaveCalories={onSaveCalories}
            onClose={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function QuickEditForm({
  meal,
  onSaveText,
  onSaveCalories,
  onClose,
}: {
  meal: Meal;
  onSaveText: (text: string) => Promise<void>;
  onSaveCalories: (calories: number) => Promise<void>;
  onClose: () => void;
}) {
  const [text, setText] = useState(meal.text);
  const [cal, setCal] = useState(meal.calories?.toString() ?? "");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => textareaRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, []);

  const textChanged = text.trim() !== meal.text.trim();
  const calChanged = cal !== (meal.calories?.toString() ?? "");
  const calNum = parseInt(cal, 10);
  const calValid = !Number.isNaN(calNum) && calNum >= 0;
  const canSave = (textChanged && text.trim().length > 0) || (calChanged && calValid);

  async function handleSave() {
    setSaving(true);
    try {
      if (textChanged && text.trim().length > 0) {
        await onSaveText(text.trim());
      } else if (calChanged && calValid) {
        await onSaveCalories(calNum);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-2">
      <header className="flex items-center justify-between border-b border-hairline pb-3 pr-10">
        <h2 className="text-[18px] font-bold text-foreground">Edit entry</h2>
      </header>

      <div className="flex flex-col gap-2">
        <label className="text-[15px] font-bold text-foreground">What did you eat?</label>
        <textarea
          ref={textareaRef}
          dir="auto"
          lang="he"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full resize-none rounded-xl bg-subtle p-4 text-[15px] leading-snug text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <p className="text-xs text-muted-foreground">Editing text will re-run the AI estimate.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[15px] font-bold text-foreground">Calories</label>
        <input
          type="number"
          inputMode="numeric"
          value={cal}
          onChange={(e) => setCal(e.target.value)}
          className="w-full rounded-xl bg-subtle px-4 py-3 text-[17px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
        <p className="text-xs text-muted-foreground">Override the calorie count manually.</p>
      </div>

      <Button
        type="button"
        variant="accent"
        size="lg"
        disabled={!canSave || saving}
        onClick={() => void handleSave()}
        className="w-full"
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
