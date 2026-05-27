"use client";

import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { getClientDb } from "@/lib/firebase/client";
import { userDoc } from "@/lib/firestore/paths";
import { timestampToDate } from "@/lib/firestore/converters";
import {
  DEFAULT_CALORIE_TARGET,
  DEFAULT_WEEKDAY_TARGET,
  DEFAULT_WEEKEND_TARGET,
  type UserProfile,
} from "@/types/user";
import { isWeekend } from "@/lib/dates/jerusalem";

function profileFromDoc(data: Record<string, unknown>): UserProfile {
  const weekday =
    (data.weekdayCalorieTarget as number | undefined) ??
    (data.dailyCalorieTarget as number | undefined) ??
    DEFAULT_WEEKDAY_TARGET;
  const weekend =
    (data.weekendCalorieTarget as number | undefined) ??
    (data.dailyCalorieTarget as number | undefined) ??
    DEFAULT_WEEKEND_TARGET;
  return {
    email: (data.email as string) ?? "",
    weekdayCalorieTarget: weekday,
    weekendCalorieTarget: weekend,
    createdAt: timestampToDate(
      data.createdAt as Parameters<typeof timestampToDate>[0]
    ),
  };
}

// null = not yet loaded; UserProfile = loaded
export function useUserProfile(uid: string | undefined) {
  const [profileData, setProfileData] = useState<UserProfile | null | "not-found">(null);

  useEffect(() => {
    if (!uid) return;

    const ref = doc(getClientDb(), userDoc(uid));
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setProfileData("not-found");
        } else {
          setProfileData(profileFromDoc(snap.data()));
        }
      },
      (error) => {
        console.error("Profile snapshot error", error);
        if (
          error instanceof FirebaseError &&
          error.code === "permission-denied"
        ) {
          toast.error("Firestore permission denied", {
            description: "Deploy firestore.rules then reload.",
          });
        }
        setProfileData("not-found");
      }
    );
    return unsub;
  }, [uid]);

  const profile: UserProfile | null = (() => {
    if (!uid) return null;
    if (profileData === null) return null; // still loading
    if (profileData === "not-found") {
      return {
        email: "",
        weekdayCalorieTarget: DEFAULT_WEEKDAY_TARGET,
        weekendCalorieTarget: DEFAULT_WEEKEND_TARGET,
        createdAt: new Date(),
      };
    }
    return profileData;
  })();

  const loading = uid ? profileData === null : false;

  return { profile, loading };
}

/**
 * Pick the calorie target for a specific date based on the Israeli week.
 * Falls back to the legacy default if profile is missing.
 */
export function getTargetForDate(
  profile: UserProfile | null,
  dateStr: string
): number {
  if (!profile) return DEFAULT_CALORIE_TARGET;
  return isWeekend(dateStr)
    ? profile.weekendCalorieTarget
    : profile.weekdayCalorieTarget;
}
