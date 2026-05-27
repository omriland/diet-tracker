"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BreakdownItem } from "@/types/meal";
import {
  scaleBreakdownItemGrams,
  updateBreakdownItemCalories,
} from "@/lib/meals/breakdown";

interface BreakdownEditSheetProps {
  open: boolean;
  item: BreakdownItem | null;
  onOpenChange: (open: boolean) => void;
  onSave: (item: BreakdownItem) => void;
  onDelete: () => void;
}

function BreakdownForm({
  item,
  onSave,
  onDelete,
  onCancel,
}: {
  item: BreakdownItem;
  onSave: (item: BreakdownItem) => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const hasGrams = item.originalPortionGrams != null;
  const [grams, setGrams] = useState(item.portionGrams?.toString() ?? "");
  const [calories, setCalories] = useState(item.calories.toString());
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function handleSave() {
    if (hasGrams) {
      const g = parseFloat(grams);
      if (Number.isNaN(g) || g <= 0) return;
      onSave(scaleBreakdownItemGrams(item, g));
    } else {
      const c = parseInt(calories, 10);
      if (Number.isNaN(c) || c < 0) return;
      onSave(updateBreakdownItemCalories(item, c));
    }
  }

  return (
    <div className="flex flex-col gap-5 pt-2 pb-1">
      <div className="flex items-baseline justify-between">
        <h2
          dir="auto"
          lang="he"
          className="text-end text-xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {item.itemHe}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground text-[11px] tracking-[0.18em] uppercase"
        >
          Cancel
        </button>
      </div>

      {hasGrams ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="grams">Portion (grams)</Label>
          <div className="flex items-baseline gap-3">
            <Input
              id="grams"
              type="number"
              inputMode="decimal"
              value={grams}
              autoFocus
              onChange={(e) => {
                setGrams(e.target.value);
                const g = parseFloat(e.target.value);
                if (!Number.isNaN(g) && g > 0 && item.originalPortionGrams) {
                  const scaled = scaleBreakdownItemGrams(item, g);
                  setCalories(scaled.calories.toString());
                }
              }}
              className="flex-1"
            />
            <span
              className="tabular-nums text-2xl text-foreground"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {calories}
            </span>
            <span className="text-muted-foreground text-xs">kcal</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="calories">Calories</Label>
          <Input
            id="calories"
            type="number"
            inputMode="numeric"
            value={calories}
            autoFocus
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
      )}

      <Button variant="accent" size="lg" className="w-full" onClick={handleSave}>
        Save
      </Button>

      {!confirmingDelete ? (
        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-destructive w-full"
          onClick={() => setConfirmingDelete(true)}
        >
          Remove this component
        </Button>
      ) : (
        <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-2 rounded-xl border p-3">
          <p className="text-destructive text-sm">Remove this component?</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmingDelete(false)}
            >
              Keep
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onDelete}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BreakdownEditSheet({
  open,
  item,
  onOpenChange,
  onSave,
  onDelete,
}: BreakdownEditSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={false}>
        {item && (
          <BreakdownForm
            key={`${item.itemEn}-${item.itemHe}`}
            item={item}
            onSave={(updated) => {
              onSave(updated);
              onOpenChange(false);
            }}
            onDelete={onDelete}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
