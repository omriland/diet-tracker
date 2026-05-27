import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { DEFAULT_WEEKDAY_TARGET, DEFAULT_WEEKEND_TARGET } from "@/types/user";
import { getClientAuth, getClientDb } from "./client";
import { userDoc } from "@/lib/firestore/paths";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User> {
  const auth = getClientAuth();
  const result = await signInWithPopup(auth, googleProvider);
  // Profile creation runs in AuthProvider onAuthStateChanged
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getClientAuth());
}

export async function ensureUserProfile(user: User): Promise<void> {
  const ref = doc(getClientDb(), userDoc(user.uid));
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email ?? "",
      weekdayCalorieTarget: DEFAULT_WEEKDAY_TARGET,
      weekendCalorieTarget: DEFAULT_WEEKEND_TARGET,
      createdAt: serverTimestamp(),
    });
  }
}
