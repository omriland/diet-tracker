"use client";

import { Plus } from "lucide-react";

export function AddMealFab({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 mx-auto flex max-w-[480px] justify-end px-5"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="Add meal"
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform active:scale-95"
      >
        <Plus className="h-7 w-7" strokeWidth={2.5} />
      </button>
    </div>
  );
}
