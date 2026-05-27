import {
  FIREBASE_AUTH_SETUP_STEPS,
  getMissingFirebaseEnvKeys,
} from "@/lib/firebase/config";

const CONSOLE_AUTH_URL =
  "https://console.firebase.google.com/project/diet-tracker-249d4/authentication/providers";

export function FirebaseSetupHelp() {
  const missingEnv = getMissingFirebaseEnvKeys();

  return (
    <div className="border-warning/30 bg-warning/5 mt-3 rounded-xl border p-4">
      <p className="text-warning text-[11px] tracking-[0.18em] uppercase">
        Firebase setup required
      </p>
      {missingEnv.length > 0 ? (
        <p className="text-foreground/85 mt-2 text-sm leading-relaxed">
          Missing in <code className="font-mono text-xs">.env.local</code>:{" "}
          {missingEnv.join(", ")}. Restart the dev server after fixing.
        </p>
      ) : (
        <ol className="text-foreground/85 mt-2 list-decimal space-y-1 ps-5 text-sm leading-relaxed">
          {FIREBASE_AUTH_SETUP_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      <a
        href={CONSOLE_AUTH_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent mt-3 inline-block text-xs underline underline-offset-2"
      >
        Open Firebase Authentication →
      </a>
    </div>
  );
}
