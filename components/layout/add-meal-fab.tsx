"use client";

import { Plus } from "lucide-react";

export function AddMealFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add meal"
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform active:scale-95"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </button>
  );
}
