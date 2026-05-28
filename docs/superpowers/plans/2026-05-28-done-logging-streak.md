# Done Logging Button + Streak Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Done logging for today" button that marks the day complete, persists the state to Firestore, computes a consecutive-day streak, and fires a confetti celebration overlay showing the streak count.

**Architecture:** `doneLogging` field is added to the existing `DayMeta` Firestore doc. A new `useStreak` hook queries all done days and walks backward from today (hybrid rule: today gets a grace period). The button lives at the bottom of `DayView` (today-only); on first tap it writes the doc and opens a celebration overlay that fires confetti via `canvas-confetti` and counts up the streak number.

**Tech Stack:** Next.js 16 / React 19, Firebase Firestore (client SDK v12), TypeScript, Tailwind CSS v4, `canvas-confetti`, `date-fns` + `date-fns-tz`.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `types/day-meta.ts` | Modify | Add `doneLogging?: boolean`, `doneLoggingAt?: Date` |
| `lib/firestore/day-meta.ts` | Modify | Parse new fields; add `setDayMetaDoneLogging` writer |
| `hooks/use-streak.ts` | Create | Query done days, compute streak, return `{ streak, todayDone, loading }` |
| `components/meals/done-logging-button.tsx` | Create | Button UI — two states (not-done / done-undo), writes to Firestore, fires celebration |
| `components/meals/streak-celebration.tsx` | Create | Full-screen overlay, confetti burst, animated count-up number |
| `components/meals/day-view.tsx` | Modify | Render `DoneLoggingButton` below meal slots (today only) |
| `package.json` | Modify | Add `canvas-confetti` + `@types/canvas-confetti` |

---

## Task 1: Install canvas-confetti

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

Expected output: updated `package-lock.json`, `canvas-confetti` appears in `dependencies`, `@types/canvas-confetti` in `devDependencies`.

- [ ] **Step 2: Verify TypeScript can see the types**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no new errors (zero output or same errors as before this task).

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add canvas-confetti dependency"
```

---

## Task 2: Extend DayMeta type

**Files:**
- Modify: `types/day-meta.ts`

- [ ] **Step 1: Add fields to the interface**

Open `types/day-meta.ts`. The current interface ends at `updatedAt: Date;`. Add two optional fields after `sportBonusKcal`:

```ts
export interface DayMeta {
  date: string;
  sport: boolean;
  sportBonusKcal: number;
  doneLogging: boolean;       // true = user marked this day done
  doneLoggingAt: Date | null; // server timestamp when done was set; null if not done
  createdAt: Date;
  updatedAt: Date;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: errors only from `lib/firestore/day-meta.ts` (missing field in `dayMetaFromDoc`) — that's correct, we fix it next task.

- [ ] **Step 3: Commit**

```bash
git add types/day-meta.ts
git commit -m "feat: add doneLogging fields to DayMeta type"
```

---

## Task 3: Update Firestore reader + add writer

**Files:**
- Modify: `lib/firestore/day-meta.ts`

- [ ] **Step 1: Update `dayMetaFromDoc` to parse new fields**

The existing `dayMetaFromDoc` function returns a `DayMeta`. Add parsing for the two new fields. The full updated function:

```ts
export function dayMetaFromDoc(date: string, data: DocumentData): DayMeta {
  return {
    date,
    sport: Boolean(data.sport),
    sportBonusKcal:
      typeof data.sportBonusKcal === "number"
        ? data.sportBonusKcal
        : SPORT_BONUS_KCAL,
    doneLogging: Boolean(data.doneLogging),
    doneLoggingAt: data.doneLoggingAt
      ? timestampToDate(data.doneLoggingAt)
      : null,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  };
}
```

- [ ] **Step 2: Add `setDayMetaDoneLogging` writer**

Add this function at the bottom of `lib/firestore/day-meta.ts`, after `setDayMetaSport`:

```ts
/**
 * Mark or un-mark the doneLogging flag for a given date.
 * Creates the doc on first write; updates in place thereafter.
 * doneLoggingAt is set to server timestamp when done=true, cleared to null when done=false.
 */
export async function setDayMetaDoneLogging(
  uid: string,
  date: string,
  done: boolean
): Promise<void> {
  const ref = doc(getClientDb(), dayMetaDoc(uid, date));
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      doneLogging: done,
      doneLoggingAt: done ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      date,
      sport: false,
      sportBonusKcal: SPORT_BONUS_KCAL,
      doneLogging: done,
      doneLoggingAt: done ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 4: Commit**

```bash
git add lib/firestore/day-meta.ts
git commit -m "feat: parse doneLogging in dayMetaFromDoc; add setDayMetaDoneLogging writer"
```

---

## Task 4: useStreak hook

**Files:**
- Create: `hooks/use-streak.ts`

- [ ] **Step 1: Create the hook**

```ts
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { dayMetaCol } from "@/lib/firestore/paths";
import { getJerusalemDateString, subtractDaysFromDateString } from "@/lib/dates/jerusalem";

interface StreakResult {
  streak: number;
  todayDone: boolean;
  loading: boolean;
}

/**
 * Computes the user's current logging streak.
 *
 * Rule (hybrid):
 *   - Walk backward from today.
 *   - If today is done: count it, continue backward.
 *   - If today is NOT done: skip it (grace), start counting from yesterday.
 *   - Each prior day must be done; first miss stops the count.
 *
 * Queries up to 60 done days for efficiency.
 */
export function useStreak(uid: string | undefined): StreakResult {
  const [doneDates, setDoneDates] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!uid) {
      setDoneDates(new Set());
      return;
    }

    const ref = collection(getClientDb(), dayMetaCol(uid));
    const q = query(
      ref,
      where("doneLogging", "==", true),
      orderBy("date", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const dates = new Set(snap.docs.map((d) => d.id));
        setDoneDates(dates);
      },
      (err) => {
        console.error("useStreak snapshot error", err);
        setDoneDates(new Set());
      }
    );

    return unsub;
  }, [uid]);

  if (doneDates === null) {
    return { streak: 0, todayDone: false, loading: true };
  }

  const today = getJerusalemDateString();
  const todayDone = doneDates.has(today);

  // Walk backward: if today not done, skip it (grace). Then count consecutive done days.
  let streak = 0;
  let cursor = todayDone ? today : subtractDaysFromDateString(today, 1);

  for (let i = 0; i < 60; i++) {
    if (doneDates.has(cursor)) {
      streak++;
      cursor = subtractDaysFromDateString(cursor, 1);
    } else {
      break;
    }
  }

  return { streak, todayDone, loading: false };
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-streak.ts
git commit -m "feat: add useStreak hook with hybrid grace-period rule"
```

---

## Task 5: StreakCelebration overlay component

**Files:**
- Create: `components/meals/streak-celebration.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

interface StreakCelebrationProps {
  streak: number;
  onClose: () => void;
}

export function StreakCelebration({ streak, onClose }: StreakCelebrationProps) {
  const numRef = useRef<HTMLSpanElement>(null);

  // Confetti burst
  useEffect(() => {
    const fire = (origin: { x: number; y: number }, angle: number) =>
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        angle,
        startVelocity: 45,
        gravity: 0.9,
        colors: ["#5ee7df", "#b490ca", "#f9d423", "#ff6b6b", "#ffffff"],
      });

    // Short delay so the overlay is visible first
    const t = setTimeout(() => {
      fire({ x: 0.1, y: 1 }, 60);
      fire({ x: 0.9, y: 1 }, 120);
    }, 80);

    return () => clearTimeout(t);
  }, []);

  // Count-up animation 0 → streak over 1.2s
  useEffect(() => {
    const el = numRef.current;
    if (!el || streak === 0) {
      if (el) el.textContent = String(streak);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * streak);
      if (el) el.textContent = String(current);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [streak]);

  // Auto-dismiss after 3s
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "oklch(0.165 0.005 270 / 88%)" }}
      onClick={onClose}
    >
      <div className="flex flex-col items-center gap-3 select-none pointer-events-none">
        <span
          ref={numRef}
          className="text-[96px] font-bold leading-none tabular-nums text-foreground"
          style={{ fontFamily: "var(--font-display)" }}
        >
          0
        </span>
        <span className="text-2xl tracking-wide text-muted-foreground">
          🔥 days in a row
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/meals/streak-celebration.tsx
git commit -m "feat: add StreakCelebration overlay with confetti and count-up"
```

---

## Task 6: DoneLoggingButton component

**Files:**
- Create: `components/meals/done-logging-button.tsx`

- [ ] **Step 1: Create the component**

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { setDayMetaDoneLogging } from "@/lib/firestore/day-meta";
import { cn } from "@/lib/utils";

interface DoneLoggingButtonProps {
  uid: string;
  date: string;
  done: boolean;
  onCelebrate: () => void;
}

export function DoneLoggingButton({
  uid,
  date,
  done,
  onCelebrate,
}: DoneLoggingButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    const next = !done;
    try {
      await setDayMetaDoneLogging(uid, date, next);
      if (next) onCelebrate();
    } catch (err) {
      console.error("Failed to toggle doneLogging", err);
      toast.error("Couldn't save — try again");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn(
        "mt-6 mb-2 w-full rounded-xl py-4 text-sm font-medium tracking-wide transition-all duration-200",
        done
          ? "bg-subtle text-muted-foreground"
          : "bg-accent text-accent-foreground active:scale-[0.98]"
      )}
    >
      {done ? "✓ Logged today · tap to undo" : "Done logging for today"}
    </button>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add components/meals/done-logging-button.tsx
git commit -m "feat: add DoneLoggingButton component"
```

---

## Task 7: Wire everything into DayView

**Files:**
- Modify: `components/meals/day-view.tsx`

- [ ] **Step 1: Import new components and hook**

At the top of `components/meals/day-view.tsx`, add these imports alongside the existing ones:

```ts
import { useState } from "react"; // already present
import { DoneLoggingButton } from "./done-logging-button";
import { StreakCelebration } from "./streak-celebration";
import { useStreak } from "@/hooks/use-streak";
import { getJerusalemDateString } from "@/lib/dates/jerusalem"; // already imported
```

- [ ] **Step 2: Add streak hook call and celebration state**

Inside `DayView`, after the existing hook calls (around line 49), add:

```ts
const { streak, todayDone } = useStreak(uid);
const [celebrating, setCelebrating] = useState(false);
const isToday = date === getJerusalemDateString();
```

- [ ] **Step 3: Render button and overlay**

In the JSX, after the last `MealSlotSection` map (around line 160), and before the closing `</>`, add:

```tsx
{uid && isToday && (
  <DoneLoggingButton
    uid={uid}
    date={date}
    done={todayDone}
    onCelebrate={() => setCelebrating(true)}
  />
)}

{celebrating && (
  <StreakCelebration
    streak={streak}
    onClose={() => setCelebrating(false)}
  />
)}
```

- [ ] **Step 4: Type-check the full file**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: zero errors.

- [ ] **Step 5: Build check**

```bash
npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` (or equivalent Next.js success output). Fix any build errors before proceeding.

- [ ] **Step 6: Commit**

```bash
git add components/meals/day-view.tsx
git commit -m "feat: wire DoneLoggingButton and StreakCelebration into DayView"
```

---

## Task 8: Firestore index (if needed)

**Files:**
- Possibly modify: `firebase/firestore.indexes.json` (or create if absent)

The `useStreak` query uses `where('doneLogging', '==', true)` + `orderBy('date', 'desc')`. Firestore requires a composite index for this combination.

- [ ] **Step 1: Check if index file exists**

```bash
ls firebase/
cat firebase/firestore.indexes.json 2>/dev/null || echo "FILE NOT FOUND"
```

- [ ] **Step 2: Add the index**

If `firestore.indexes.json` exists, add the index to the `indexes` array. If the file doesn't exist, create `firebase/firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "dayMeta",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "doneLogging", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 3: Deploy indexes**

```bash
npx firebase deploy --only firestore:indexes
```

Expected: `✔ Deploy complete!` — or follow the console link Firebase prints to create the index manually if CLI deploy isn't available.

- [ ] **Step 4: Commit**

```bash
git add firebase/firestore.indexes.json
git commit -m "feat: add Firestore composite index for doneLogging streak query"
```

---

## Task 9: Manual verification

No automated test runner is configured in this project. Verify manually:

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:3000` in browser (or use the preview tool).

- [ ] **Step 2: Verify button appears on today**

Navigate to today's date. Confirm "Done logging for today" button is visible at the bottom of the meal list.

- [ ] **Step 3: Tap the button**

Tap it. Confirm:
- Confetti fires from bottom corners.
- A large number counts up from 0 to your streak (1 on first use).
- "🔥 days in a row" caption shows below the number.
- Overlay auto-dismisses after ~3s, or dismisses on tap.
- Button changes to "✓ Logged today · tap to undo".

- [ ] **Step 4: Test undo**

Tap "✓ Logged today · tap to undo". Confirm button reverts to "Done logging for today" with no celebration.

- [ ] **Step 5: Verify hidden on past day**

Navigate to yesterday (swipe right). Confirm the button is not rendered.

- [ ] **Step 6: Final lint check**

```bash
npm run lint
```

Expected: no errors.
