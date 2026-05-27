"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

function isBenignAbort(error: Error): boolean {
  return (
    error.name === "AbortError" ||
    error.message.includes("aborted a request") ||
    error.message.includes("The operation was aborted")
  );
}

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isBenignAbort(error)) reset();
  }, [error, reset]);

  if (isBenignAbort(error)) return null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-6 px-6 pb-24 text-center">
      <p
        className="text-3xl italic"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Something went sideways.
      </p>
      <p className="text-muted-foreground text-sm leading-relaxed">
        {error.message}
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
