/** Static access required — Next.js only inlines NEXT_PUBLIC_* with literal keys. */
const FIREBASE_ENV = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

const ENV_LABELS: Record<keyof typeof FIREBASE_ENV, string> = {
  apiKey: "NEXT_PUBLIC_FIREBASE_API_KEY",
  authDomain: "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  projectId: "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  appId: "NEXT_PUBLIC_FIREBASE_APP_ID",
};

export function getMissingFirebaseEnvKeys(): string[] {
  return (Object.keys(FIREBASE_ENV) as (keyof typeof FIREBASE_ENV)[])
    .filter((key) => !FIREBASE_ENV[key]?.trim())
    .map((key) => ENV_LABELS[key]);
}

export function assertFirebaseClientConfig(): void {
  const missing = getMissingFirebaseEnvKeys();
  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase env: ${missing.join(", ")}. Copy .env.example to .env.local and restart the dev server.`
    );
  }
}

export const FIREBASE_AUTH_SETUP_STEPS = [
  "Open Firebase Console → Build → Authentication.",
  'If you see "Get started", click it (required once per project).',
  "Open the Sign-in method tab → enable Google → Save.",
  'Under Settings → Authorized domains, ensure "localhost" is listed.',
  "Restart `npm run dev` and try signing in again.",
] as const;

export function getFirebaseAuthErrorMessage(code: string): string | null {
  switch (code) {
    case "auth/configuration-not-found":
      return "Firebase Authentication is not set up for this project. Enable Google sign-in in the Firebase Console (see steps below).";
    case "auth/operation-not-allowed":
      return "Google sign-in is disabled. Enable the Google provider under Authentication → Sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized. Add it under Authentication → Settings → Authorized domains.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Pop-up was blocked. Allow pop-ups for this site and try again.";
    default:
      return null;
  }
}
