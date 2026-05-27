"use client";

import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BreakdownEditSheet } from "./breakdown-edit-sheet";
import type { BreakdownItem, Meal } from "@/types/meal";

interface MealDetailSheetProps {
  open: boolean;
  meal: Meal | null;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
  onEditText: (text: string) => Promise<void>;
  onManualCalories: (calories: number) => Promise<void>;
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
  onEditText,
  onManualCalories,
  onUpdateBreakdown,
  onRetryEstimate,
}: Omit<MealDetailSheetProps, "open" | "onOpenChange"> & {
  meal: Meal;
  onClose: () => void;
}) {
  const [editingText, setEditingText] = useState(false);
  const [text, setText] = useState(meal.text);
  const [manualCal, setManualCal] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [editItem, setEditItem] = useState<BreakdownItem | null>(null);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isPending = meal.pending || meal.calories === null;
  const suspicious = isSuspicious(meal.calories);

  async function handleDeleteItem() {
    if (!editItem) return;
    const next = meal.breakdown.filter(
      (b) => b.itemEn !== editItem.itemEn || b.itemHe !== editItem.itemHe
    );
    if (next.length === 0) {
      toast.error("Cannot remove the only component");
      return;
    }
    await onUpdateBreakdown(next);
    setEditItemOpen(false);
    setEditItem(null);
  }

  const annotations: string[] = [];
  if (meal.searched) annotations.push("web");
  if (meal.confidence === "low") annotations.push("low confidence");
  if (suspicious && !isPending) annotations.push("verify");

  return (
    <div className="flex max-h-[78dvh] flex-col gap-5 overflow-y-auto pt-2 pb-1">
      {/* Hero: meal text in Hebrew + total */}
      <div className="flex flex-col gap-3">
        <p
          dir="auto"
          lang="he"
          className="text-[22px] leading-snug"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {meal.text}
        </p>
        <div className="flex items-baseline justify-between">
          <span
            className="text-4xl leading-none tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {isPending ? (
              <span className="pulse-dot text-muted-foreground">·</span>
            ) : (
              meal.calories
            )}
          </span>
          <span className="text-muted-foreground text-xs">kcal</span>
        </div>
        {annotations.length > 0 && (
          <p className="text-muted-foreground text-[10px] tracking-[0.18em] uppercase">
            {annotations.map((a, i) => (
              <span key={a}>
                {i > 0 && " · "}
                {a}
              </span>
            ))}
          </p>
        )}
      </div>

      {/* Pending: manual entry + retry */}
      {isPending && (
        <div className="border-hairline space-y-3 rounded-xl border p-4">
          <p className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
            Estimating…
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="enter calories manually"
              value={manualCal}
              onChange={(e) => setManualCal(e.target.value)}
            />
            <Button
              variant="accent"
              onClick={async () => {
                const c = parseInt(manualCal, 10);
                if (Number.isNaN(c) || c <= 0) return;
                await onManualCalories(c);
              }}
            >
              Save
            </Button>
          </div>
          <Button variant="outline" className="w-full" onClick={onRetryEstimate}>
            Retry estimate
          </Button>
        </div>
      )}

      {/* Low confidence callout */}
      {meal.confidence === "low" && meal.needsClarificationHe && (
        <div className="border-warning/30 bg-warning/5 rounded-xl border p-3">
          <p
            dir="auto"
            lang="he"
            className="text-warning text-end text-sm"
          >
            {meal.needsClarificationHe}
          </p>
        </div>
      )}

      {/* Breakdown */}
      {meal.breakdown.length > 0 && (
        <section>
          <h3 className="text-muted-foreground mb-2 text-[11px] tracking-[0.18em] uppercase">
            Breakdown
          </h3>
          <ul className="divide-hairline divide-y">
            {meal.breakdown.map((item) => (
              <li key={`${item.itemEn}-${item.itemHe}`}>
                <button
                  type="button"
                  className="hover:bg-subtle/40 -mx-2 flex w-full items-center justify-between rounded-md px-2 py-2.5 text-start transition-colors"
                  onClick={() => {
                    setEditItem(item);
                    setEditItemOpen(true);
                  }}
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span
                      dir="auto"
                      lang="he"
                      className="text-[15px] leading-snug"
                    >
                      {item.itemHe}
                    </span>
                    {item.portionGrams != null && (
                      <span
                        className="text-muted-foreground text-xs tabular-nums"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {item.portionGrams} g
                      </span>
                    )}
                  </span>
                  <span
                    className="shrink-0 text-sm tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item.calories}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reasoning */}
      {meal.reasoningHe && (
        <section>
          <h3 className="text-muted-foreground mb-1.5 text-[11px] tracking-[0.18em] uppercase">
            Reasoning
          </h3>
          <p
            dir="auto"
            lang="he"
            className="text-foreground/85 text-end text-[14px] leading-relaxed"
          >
            {meal.reasoningHe}
          </p>
        </section>
      )}

      {/* Assumptions */}
      {meal.assumptionsHe.length > 0 && (
        <section>
          <h3 className="text-muted-foreground mb-1.5 text-[11px] tracking-[0.18em] uppercase">
            Assumptions
          </h3>
          <ul className="space-y-1" dir="auto" lang="he">
            {meal.assumptionsHe.map((a) => (
              <li key={a} className="text-foreground/80 text-end text-sm">
                · {a}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Sources */}
      {meal.searched && meal.sources.length > 0 && (
        <section>
          <h3 className="text-muted-foreground mb-1.5 text-[11px] tracking-[0.18em] uppercase">
            Sources
          </h3>
          <ul className="space-y-1">
            {meal.sources.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent inline-flex items-center gap-1 text-xs underline-offset-2 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  {url.replace(/^https?:\/\//, "").slice(0, 48)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Actions */}
      <div className="border-hairline mt-2 flex flex-col gap-2 border-t pt-4">
        {!editingText ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setText(meal.text);
              setEditingText(true);
            }}
          >
            Edit text & re-estimate
          </Button>
        ) : (
          <div className="space-y-2">
            <Label>Edit text</Label>
            <Input
              dir="auto"
              lang="he"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditingText(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                className="flex-1"
                onClick={async () => {
                  if (!text.trim()) return;
                  await onEditText(text.trim());
                  setEditingText(false);
                  onClose();
                }}
              >
                Re-estimate
              </Button>
            </div>
          </div>
        )}

        {!isPending && !showManualInput && (
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setManualCal(meal.calories?.toString() ?? "");
              setShowManualInput(true);
            }}
          >
            Override calories
          </Button>
        )}
        {!isPending && showManualInput && (
          <div className="space-y-2">
            <Label htmlFor="override-cal">Override calories</Label>
            <div className="flex gap-2">
              <Input
                id="override-cal"
                type="number"
                inputMode="numeric"
                value={manualCal}
                onChange={(e) => setManualCal(e.target.value)}
              />
              <Button
                variant="accent"
                onClick={async () => {
                  const c = parseInt(manualCal, 10);
                  if (Number.isNaN(c) || c <= 0) return;
                  await onManualCalories(c);
                  setShowManualInput(false);
                }}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {!confirmingDelete ? (
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-destructive w-full"
            onClick={() => setConfirmingDelete(true)}
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            Delete
          </Button>
        ) : (
          <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-2 rounded-xl border p-3">
            <p className="text-destructive text-sm">Delete this meal?</p>
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
                onClick={async () => {
                  await onDelete();
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      <BreakdownEditSheet
        open={editItemOpen}
        item={editItem}
        onOpenChange={setEditItemOpen}
        onSave={async (updated) => {
          const next = meal.breakdown.map((b) =>
            b.itemEn === updated.itemEn && b.itemHe === updated.itemHe
              ? updated
              : b
          );
          await onUpdateBreakdown(next);
        }}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}

export function MealDetailSheet({
  open,
  meal,
  onOpenChange,
  onDelete,
  onEditText,
  onManualCalories,
  onUpdateBreakdown,
  onRetryEstimate,
}: MealDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        {meal && (
          <MealDetailContent
            key={meal.id}
            meal={meal}
            onClose={() => onOpenChange(false)}
            onDelete={onDelete}
            onEditText={onEditText}
            onManualCalories={onManualCalories}
            onUpdateBreakdown={onUpdateBreakdown}
            onRetryEstimate={onRetryEstimate}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
