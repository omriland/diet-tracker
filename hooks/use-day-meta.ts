"use client";

import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { subscribeDayMeta } from "@/lib/firestore/day-meta";
import type { DayMeta } from "@/types/day-meta";

/**
 * Subscribes to /users/{uid}/dayMeta/{date}.
 * Returns `meta = null` when the document doesn't exist (no flags set yet).
 */
export function useDayMeta(uid: string | undefined, date: string) {
  // null = not yet loaded; "absent" = loaded but doc doesn't exist
  const [state, setState] = useState<DayMeta | null | "absent">(null);

  useEffect(() => {
    if (!uid) return;
    return subscribeDayMeta(
      uid,
      date,
      (data) => setState(data ?? "absent"),
      (error) => {
        console.error("DayMeta snapshot error", error);
        if (
          error instanceof FirebaseError &&
          error.code === "permission-denied"
        ) {
          toast.error("Cannot load day flags", {
            description: "Deploy firestore.rules then reload.",
          });
        }
        setState("absent");
      }
    );
  }, [uid, date]);

  const meta: DayMeta | null = state === null || state === "absent" ? null : state;
  const loading = uid ? state === null : false;

  return { meta, loading };
}
