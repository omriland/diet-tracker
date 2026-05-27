"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase/client";
import {
  ensureUserProfile,
  signInWithGoogle,
  signOut as authSignOut,
} from "@/lib/firebase/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getClientAuth();
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        void ensureUserProfile(firebaseUser).catch((err) => {
          console.error("Failed to ensure user profile", err);
        });
      }
      setUser(firebaseUser);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await authSignOut();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle: signIn,
      signOut,
    }),
    [user, loading, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
