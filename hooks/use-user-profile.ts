"use client";

import { useEffect, useState } from "react";
import { FirebaseError } from "firebase/app";
import { doc, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { getClientDb } from "@/lib/firebase/client";
import { userDoc } from "@/lib/firestore/paths";
import { timestampToDate } from "@/lib/firestore/converters";
import { DEFAULT_CALORIE_TARGET, type UserProfile } from "@/types/user";

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
          const data = snap.data();
          setProfileData({
            email: (data.email as string) ?? "",
            dailyCalorieTarget:
              (data.dailyCalorieTarget as number) ?? DEFAULT_CALORIE_TARGET,
            createdAt: timestampToDate(data.createdAt),
          });
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

  // Derived — avoids setState in effect for the !uid case
  const profile: UserProfile | null = (() => {
    if (!uid) return null;
    if (profileData === null) return null; // still loading
    if (profileData === "not-found") {
      return {
        email: "",
        dailyCalorieTarget: DEFAULT_CALORIE_TARGET,
        createdAt: new Date(),
      };
    }
    return profileData;
  })();

  const loading = uid ? profileData === null : false;

  return { profile, loading };
}
