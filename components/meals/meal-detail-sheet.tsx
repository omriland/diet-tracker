"use client";

import { useState } from "react";
import { ExternalLink, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { BreakdownItem, Meal } from "@/types/meal";
import {
  scaleBreakdownItemGrams,
  updateBreakdownItemCalories,
} from "@/lib/meals/breakdown";
import { cn } from "@/lib/utils";

interface MealDetailSheetProps {
  open: boolean;
  meal: Meal | null;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
  onUpdateBreakdown: (breakdown: BreakdownItem[]) => Promise<void>;
  onRetryEstimate: () => Promise<void>;
}

function isSuspicious(calories: number | null): boolean {
  if (calories === null) return false;
  return calories < 10 || calories > 3000;
}

function MealDetailContent({
  meal,
  onClose,
  onDelete,
  onUpdateBreakdown,
  onRetryEstimate,
}: Omit<MealDetailSheetProps, "open" | "onOpenChange"> & {
  meal: Meal;
  onClose: () => void;
}) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isPending = meal.pending;
  const isFailed = !meal.pending && meal.calories === null;
  const suspicious = isSuspicious(meal.calories);
  const annotations: string[] = [];
  if (meal.searched) annotations.push("web");
  if (meal.confidence === "low") annotations.push("low confidence");
  if (suspicious && !isPending && !isFailed) annotations.push("verify");

  function keyFor(item: BreakdownItem) {
    return `${item.itemEn}__${item.itemHe}`;
  }

  return (
    <div className="flex max-h-[78dvh] flex-col gap-5 overflow-y-auto pb-2">
      <header className="border-b border-hairline pb-3 pr-10">
        <p
          dir="auto"
          lang="he"
          className="truncate text-[18px] font-bold text-foreground"
        >
          {meal.text}
        </p>
      </header>

      <section className="flex items-baseline justify-between">
        <span className="flex items-center text-[36px] font-bold leading-none tabular-nums text-foreground min-h-[36px]">
          {isPending ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : isFailed ? (
            <AlertCircle className="h-8 w-8 text-destructive" />
          ) : (
            meal.calories
          )}
        </span>
        <span className="text-sm text-muted-foreground">kcal</span>
      </section>

      {annotations.length > 0 && (
        <p className="text-xs text-muted-foreground">{annotations.join(" · ")}</p>
      )}

      {meal.confidence === "low" && meal.needsClarificationHe && (
        <div className="rounded-xl border border-warning/40 bg-warning/5 p-3">
          <p dir="auto" lang="he" className="text-end text-sm text-warning">
            {meal.needsClarificationHe}
          </p>
        </div>
      )}

      {meal.breakdown.length > 0 && (
        <section className="border-t border-hairline pt-4">
          <h3 className="mb-2 text-[15px] font-bold text-foreground">Breakdown</h3>
          <ul className="flex flex-col">
            {meal.breakdown.map((item) => (
              <li key={keyFor(item)} className="border-b border-hairline last:border-b-0">
                {editingKey === keyFor(item) ? (
                  <BreakdownEditor
                    item={item}
                    onCancel={() => setEditingKey(null)}
                    onSave={async (updated) => {
                      const next = meal.breakdown.map((b) =>
                        b.itemEn === item.itemEn && b.itemHe === item.itemHe ? updated : b
                      );
                      await onUpdateBreakdown(next);
                      setEditingKey(null);
                    }}
                    onRemove={async () => {
                      const next = meal.breakdown.filter(
                        (b) => b.itemEn !== item.itemEn || b.itemHe !== item.itemHe
                      );
                      if (next.length === 0) {
                        toast.error("Cannot remove the only component");
                        return;
                      }
                      await onUpdateBreakdown(next);
                      setEditingKey(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingKey(keyFor(item))}
                    className="flex w-full items-center justify-between gap-3 py-3 text-start"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span dir="auto" lang="he" className="text-[15px] text-foreground">
                        {item.itemHe}
                      </span>
                      {item.portionGrams != null && (
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {item.portionGrams} g
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-[15px] font-bold tabular-nums text-foreground">
                      {item.calories}
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(meal.reasoningHe || meal.assumptionsHe.length > 0) && (
        <details className="group border-t border-hairline pt-4">
          <summary className="cursor-pointer text-[13px] font-medium text-accent">
            <span className="group-open:hidden">Show reasoning</span>
            <span className="hidden group-open:inline">Hide reasoning</span>
          </summary>
          <div className="mt-3 flex flex-col gap-3">
            {meal.reasoningHe && (
              <p dir="auto" lang="he" className="text-end text-sm text-foreground/85">
                {meal.reasoningHe}
              </p>
            )}
            {meal.assumptionsHe.length > 0 && (
              <ul className="flex flex-col gap-1" dir="auto" lang="he">
                {meal.assumptionsHe.map((a) => (
                  <li key={a} className="text-end text-sm text-foreground/70">· {a}</li>
                ))}
              </ul>
            )}
          </div>
        </details>
      )}

      {meal.searched && meal.sources.length > 0 && (
        <section className="border-t border-hairline pt-4">
          <h3 className="mb-2 text-[13px] font-medium text-muted-foreground">Sources</h3>
          <ul className="flex flex-col gap-1">
            {meal.sources.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-accent underline-offset-2 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  {url.replace(/^https?:\/\//, "").slice(0, 48)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2 border-t border-hairline pt-4">
        {isFailed && (
          <Button variant="outline" size="lg" className="w-full" onClick={onRetryEstimate}>
            Re-estimate
          </Button>
        )}

        {!confirmingDelete ? (
          <Button
            variant="destructive"
            size="lg"
            className="w-full"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.75} />
            Delete entry
          </Button>
        ) : (
          <div className={cn("flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3")}>
            <p className="text-sm text-destructive">Delete this entry?</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                Keep
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  await onDelete();
                  onClose();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BreakdownEditor({
  item,
  onCancel,
  onSave,
  onRemove,
}: {
  item: BreakdownItem;
  onCancel: () => void;
  onSave: (updated: BreakdownItem) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const hasGrams = item.originalPortionGrams != null;
  const [grams, setGrams] = useState(item.portionGrams?.toString() ?? "");
  const [calories, setCalories] = useState(item.calories.toString());
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  function handleGramsChange(v: string) {
    setGrams(v);
    const g = parseFloat(v);
    if (!Number.isNaN(g) && g > 0 && item.originalPortionGrams) {
      setCalories(scaleBreakdownItemGrams(item, g).calories.toString());
    }
  }

  async function handleSave() {
    if (hasGrams) {
      const g = parseFloat(grams);
      if (Number.isNaN(g) || g <= 0) return;
      await onSave(scaleBreakdownItemGrams(item, g));
    } else {
      const c = parseInt(calories, 10);
      if (Number.isNaN(c) || c < 0) return;
      await onSave(updateBreakdownItemCalories(item, c));
    }
  }

  return (
    <div className="flex flex-col gap-3 py-3">
      <p dir="auto" lang="he" className="text-end text-[15px] font-bold text-foreground">
        {item.itemHe}
      </p>
      {hasGrams ? (
        <div className="flex items-center gap-3">
          <input
            type="number"
            inputMode="decimal"
            value={grams}
            autoFocus
            onChange={(e) => handleGramsChange(e.target.value)}
            className="flex-1 rounded-xl bg-subtle px-3 py-2 text-[15px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
          />
          <span className="text-xs text-muted-foreground">g</span>
          <span className="text-[15px] font-bold tabular-nums text-foreground">{calories}</span>
          <span className="text-xs text-muted-foreground">kcal</span>
        </div>
      ) : (
        <input
          type="number"
          inputMode="numeric"
          value={calories}
          autoFocus
          onChange={(e) => setCalories(e.target.value)}
          className="w-full rounded-xl bg-subtle px-3 py-2 text-[15px] tabular-nums text-foreground outline-none ring-2 ring-transparent focus:ring-accent"
        />
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="accent" size="sm" className="flex-1" onClick={() => void handleSave()}>
          Save
        </Button>
      </div>
      {!confirmingRemove ? (
        <button
          type="button"
          onClick={() => setConfirmingRemove(true)}
          className="text-xs text-destructive underline-offset-2 hover:underline"
        >
          Remove this component
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-destructive">Remove?</span>
          <button
            type="button"
            onClick={() => setConfirmingRemove(false)}
            className="text-muted-foreground"
          >
            No
          </button>
          <button
            type="button"
            onClick={() => void onRemove()}
            className="font-bold text-destructive"
          >
            Yes, remove
          </button>
        </div>
      )}
    </div>
  );
}

export function MealDetailSheet({
  open,
  meal,
  onOpenChange,
  onDelete,
  onUpdateBreakdown,
  onRetryEstimate,
}: MealDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" showCloseButton={true}>
        {meal && (
          <MealDetailContent
            key={meal.id}
            meal={meal}
            onClose={() => onOpenChange(false)}
            onDelete={onDelete}
            onUpdateBreakdown={onUpdateBreakdown}
            onRetryEstimate={onRetryEstimate}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
