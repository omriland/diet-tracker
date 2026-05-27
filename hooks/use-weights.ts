"use client";

import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";
import { subscribeWeights } from "@/lib/firestore/weights";
import type { WeightEntry } from "@/types/weight";

export function useWeights(uid: string | undefined) {
  // null = not yet loaded
  const [entriesData, setEntriesData] = useState<WeightEntry[] | null>(null);

  useEffect(() => {
    if (!uid) return;

    return subscribeWeights(
      uid,
      (data) => setEntriesData(data),
      (error) => {
        console.error("Weights snapshot error", error);
        if (
          error instanceof FirebaseError &&
          error.code === "permission-denied"
        ) {
          toast.error("Cannot load weight data", {
            description: "Deploy firestore.rules then reload.",
          });
        }
        setEntriesData([]);
      }
    );
  }, [uid]);

  // Derived — avoids setState in effect for the !uid case
  const entries: WeightEntry[] = uid ? (entriesData ?? []) : [];
  const loading = uid ? entriesData === null : false;

  return { entries, loading };
}
