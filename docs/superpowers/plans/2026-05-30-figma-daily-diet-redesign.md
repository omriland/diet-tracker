# Daily-Diet Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the diet-tracker in the Rocketseat "Daily Diet" design system (palette, Nunito Sans + Rubik type, Figma components) while keeping current behavior, and add two approved behaviors: FAB-only meal adding with drag-and-drop slot moves, and a new Statistics screen.

**Architecture:** Token-first reskin in `globals.css` + font swap in `app/layout.tsx`, then component restyles that consume the new tokens. Pure logic (time formatting, slot inference, stats aggregation) is extracted into testable helpers under `lib/` and TDD'd with Vitest. New behavior layers onto existing Firestore calls (`slot` field reuse) with no schema change.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, Firebase/Firestore, `@dnd-kit/core` + `@dnd-kit/sortable` (new), Vitest (new, logic only), date-fns-tz.

**Reference spec:** `docs/superpowers/specs/2026-05-30-figma-daily-diet-redesign-design.md`

---

## File Structure

**Create**
- `vitest.config.ts` — Vitest config (node env, logic tests only).
- `lib/meals/slot.ts` — `defaultSlotForTime`, slot labels/icons source of truth.
- `lib/meals/slot.test.ts`
- `lib/dates/jerusalem.test.ts` — covers new `formatMealTime`.
- `lib/stats/compute.ts` — `DayCalorieEntry`, `DietStats`, `computeStats`.
- `lib/stats/compute.test.ts`
- `hooks/use-stats.ts` — windowed aggregation hook.
- `app/(app)/stats/page.tsx` — Statistics route.
- `components/stats/stats-view.tsx` — Statistics screen UI.
- `components/layout/add-meal-fab.tsx` — floating "+" button.

**Modify**
- `app/globals.css` — color tokens + accent remap.
- `app/layout.tsx` — fonts (Nunito Sans + Rubik; remove Inter/Heebo).
- `lib/dates/jerusalem.ts` — add `formatMealTime`.
- `lib/firestore/meals.ts` — add `updateMealSlot`.
- `components/meals/meal-entry-row.tsx` — Figma meal row.
- `components/meals/meal-slot-section.tsx` — remove add button; become drop target.
- `components/meals/day-view.tsx` — DnD context, FAB, slot move.
- `components/meals/calorie-progress.tsx` — green/red hero.
- `components/meals/add-meal-sheet.tsx` — slot selector.
- `components/layout/bottom-nav.tsx` — 4 tabs + restyle.
- `components/ui/button.tsx` — variant palette.
- `components/weight/*`, `app/(app)/settings/page.tsx`, `app/(auth)/login/page.tsx`, `components/meals/quick-edit-sheet.tsx`, `components/meals/meal-detail-sheet.tsx` — restyle pass.
- `package.json` — deps + `test` script.

---

## Task 1: Install dependencies and Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install runtime + dev deps**

Run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D vitest
```

- [ ] **Step 2: Add test script to `package.json`**

In `"scripts"`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 4: Verify Vitest runs (no tests yet = ok)**

Run: `npm test`
Expected: exits 0 with "No test files found" or runs 0 tests. (If it errors on config, fix before continuing.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add dnd-kit and vitest for redesign"
```

---

## Task 2: Design tokens + fonts

**Files:**
- Modify: `app/globals.css:48-69` (the `:root` block) and `app/globals.css:36-38` (font vars)
- Modify: `app/layout.tsx:1-48`

- [ ] **Step 1: Swap fonts in `app/layout.tsx`**

Replace the font imports/instances (lines 2-25) with:
```tsx
import { Nunito_Sans, Rubik } from "next/font/google";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
```
Update the `<html className=...>` (line ~58) to:
```tsx
className={`${nunito.variable} ${rubik.variable} h-full antialiased`}
```
Update `themeColor` (line 47) to `"#FAFAFA"`.

- [ ] **Step 2: Update font vars in `app/globals.css` `@theme inline`**

Replace lines 36-38 with:
```css
  --font-sans: var(--font-nunito), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-hebrew-sans: var(--font-rubik), var(--font-nunito), ui-sans-serif, system-ui, sans-serif;
```
(Remove the `--font-mono` line if JetBrains is no longer referenced; leave if still used elsewhere — grep `font-mono` first; if no matches, remove it.)

- [ ] **Step 3: Replace the `:root` palette in `app/globals.css` (lines 48-69)**

```css
:root {
  --background: #FAFAFA;
  --foreground: #1B1D1E;
  --surface: #FFFFFF;
  --surface-foreground: #1B1D1E;
  --elevated: #FFFFFF;
  --muted: #EFF0F0;
  --muted-foreground: #5C6265;
  --subtle: #EFF0F0;
  --subtle-foreground: #333638;
  --border: #DDDEDF;
  --hairline: #EFF0F0;
  --input: #EFF0F0;
  --ring: #639339;
  --accent: #639339;
  --accent-foreground: #FFFFFF;
  --accent-soft: rgba(99, 147, 57, 0.30);
  --destructive: #BF3B44;
  --destructive-foreground: #FFFFFF;
  --success: #639339;
  --warning: #BF3B44;
}
```

- [ ] **Step 4: Add brand scale tokens to `@theme inline`**

After the existing `--color-*` mappings (around line 24), add:
```css
  --color-green-light: #E5F0DB;
  --color-green-mid: #CBE4B4;
  --color-green-dark: #639339;
  --color-red-light: #F4E6E7;
  --color-red-mid: #F3BABD;
  --color-red-dark: #BF3B44;
  --color-gray-300: #5C6265;
```

- [ ] **Step 5: Apply Hebrew font to RTL/he content (base layer)**

In `app/globals.css` `@layer base`, add:
```css
  [lang="he"], [dir="rtl"] {
    font-family: var(--font-hebrew-sans);
  }
```

- [ ] **Step 6: Verify build + lint**

Run: `npm run lint && npm run build`
Expected: build succeeds; the app renders with the new background/fonts (accent now green). Spot-check `npm run dev` on a phone viewport.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: adopt Daily-Diet palette and Nunito Sans + Rubik fonts"
```

---

## Task 3: `formatMealTime` helper (TDD)

**Files:**
- Modify: `lib/dates/jerusalem.ts`
- Create: `lib/dates/jerusalem.test.ts`

- [ ] **Step 1: Write failing test**

`lib/dates/jerusalem.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatMealTime } from "./jerusalem";

describe("formatMealTime", () => {
  it("formats a UTC instant to Asia/Jerusalem HH:mm", () => {
    // 2026-05-30T05:30:00Z => 08:30 in Jerusalem (UTC+3 DST)
    const d = new Date("2026-05-30T05:30:00Z");
    expect(formatMealTime(d)).toBe("08:30");
  });

  it("zero-pads hours and minutes", () => {
    const d = new Date("2026-01-01T05:05:00Z"); // 07:05 in winter (UTC+2)
    expect(formatMealTime(d)).toBe("07:05");
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `npx vitest run lib/dates/jerusalem.test.ts`
Expected: FAIL — `formatMealTime is not a function`.

- [ ] **Step 3: Implement**

Append to `lib/dates/jerusalem.ts`:
```ts
/** Time-of-day in Asia/Jerusalem as HH:mm (24h). For displaying meal log time. */
export function formatMealTime(date: Date): string {
  return formatInTimeZone(date, JERUSALEM_TZ, "HH:mm");
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npx vitest run lib/dates/jerusalem.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/dates/jerusalem.ts lib/dates/jerusalem.test.ts
git commit -m "feat: add formatMealTime (Jerusalem HH:mm)"
```

---

## Task 4: `defaultSlotForTime` helper (TDD)

**Files:**
- Create: `lib/meals/slot.ts`
- Create: `lib/meals/slot.test.ts`

- [ ] **Step 1: Write failing test**

`lib/meals/slot.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { defaultSlotForTime } from "./slot";

describe("defaultSlotForTime", () => {
  it("morning -> BREAKFAST", () => {
    expect(defaultSlotForTime(new Date("2026-05-30T05:00:00Z"))).toBe("BREAKFAST"); // 08:00 IL
  });
  it("midday -> LUNCH", () => {
    expect(defaultSlotForTime(new Date("2026-05-30T10:00:00Z"))).toBe("LUNCH"); // 13:00 IL
  });
  it("evening -> DINNER", () => {
    expect(defaultSlotForTime(new Date("2026-05-30T16:30:00Z"))).toBe("DINNER"); // 19:30 IL
  });
  it("late night -> SNACK", () => {
    expect(defaultSlotForTime(new Date("2026-05-30T21:30:00Z"))).toBe("SNACK"); // 00:30 IL next day
  });
});
```

- [ ] **Step 2: Run test, verify fails**

Run: `npx vitest run lib/meals/slot.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`lib/meals/slot.ts`:
```ts
import { formatInTimeZone } from "date-fns-tz";
import { JERUSALEM_TZ } from "@/lib/dates/jerusalem";
import type { MealSlot } from "@/types/meal";

/**
 * Best-guess slot from the current Jerusalem hour, used to pre-select the slot
 * in the add-meal sheet. Boundaries: breakfast <11, lunch 11–16, dinner 16–22,
 * else snack.
 */
export function defaultSlotForTime(now: Date = new Date()): MealSlot {
  const hour = Number(formatInTimeZone(now, JERUSALEM_TZ, "H"));
  if (hour < 11) return "BREAKFAST";
  if (hour < 16) return "LUNCH";
  if (hour < 22) return "DINNER";
  return "SNACK";
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npx vitest run lib/meals/slot.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/meals/slot.ts lib/meals/slot.test.ts
git commit -m "feat: add defaultSlotForTime helper"
```

---

## Task 5: Stats aggregation `computeStats` (TDD)

**Files:**
- Create: `lib/stats/compute.ts`
- Create: `lib/stats/compute.test.ts`

- [ ] **Step 1: Write failing test**

`lib/stats/compute.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeStats, type DayCalorieEntry } from "./compute";

const day = (date: string, consumed: number, target: number, mealCount = 1): DayCalorieEntry =>
  ({ date, consumed, target, mealCount });

describe("computeStats", () => {
  it("returns zeros for no logged days", () => {
    const s = computeStats([]);
    expect(s.loggedDays).toBe(0);
    expect(s.pctDaysOnTarget).toBe(0);
    expect(s.avgCaloriesPerDay).toBe(0);
    expect(s.bestStreak).toBe(0);
    expect(s.currentStreak).toBe(0);
  });

  it("ignores days with no meals", () => {
    const s = computeStats([day("2026-05-01", 0, 1800, 0), day("2026-05-02", 1500, 1800, 2)]);
    expect(s.loggedDays).toBe(1);
    expect(s.mealsLogged).toBe(2);
  });

  it("counts on-target vs over-target and percentage", () => {
    const s = computeStats([
      day("2026-05-01", 1500, 1800),
      day("2026-05-02", 2000, 1800),
      day("2026-05-03", 1800, 1800),
    ]);
    expect(s.daysOnTarget).toBe(2); // <= target
    expect(s.daysOverTarget).toBe(1);
    expect(s.pctDaysOnTarget).toBe(67); // round(2/3*100)
  });

  it("computes best and current on-target streaks over sorted dates", () => {
    const s = computeStats([
      day("2026-05-01", 1500, 1800), // on
      day("2026-05-02", 1500, 1800), // on
      day("2026-05-03", 2500, 1800), // over -> breaks
      day("2026-05-04", 1500, 1800), // on (current run = 1)
    ]);
    expect(s.bestStreak).toBe(2);
    expect(s.currentStreak).toBe(1);
  });

  it("averages calories over logged days", () => {
    const s = computeStats([day("2026-05-01", 1000, 1800), day("2026-05-02", 2000, 1800)]);
    expect(s.avgCaloriesPerDay).toBe(1500);
  });
});
```

- [ ] **Step 2: Run test, verify fails**

Run: `npx vitest run lib/stats/compute.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

`lib/stats/compute.ts`:
```ts
export interface DayCalorieEntry {
  date: string; // YYYY-MM-DD
  consumed: number;
  target: number;
  mealCount: number;
}

export interface DietStats {
  loggedDays: number;
  mealsLogged: number;
  daysOnTarget: number;
  daysOverTarget: number;
  pctDaysOnTarget: number;
  avgCaloriesPerDay: number;
  bestStreak: number;
  currentStreak: number;
}

const EMPTY: DietStats = {
  loggedDays: 0,
  mealsLogged: 0,
  daysOnTarget: 0,
  daysOverTarget: 0,
  pctDaysOnTarget: 0,
  avgCaloriesPerDay: 0,
  bestStreak: 0,
  currentStreak: 0,
};

/** Aggregate per-day calorie data into headline stats. Only days with >=1 meal count. */
export function computeStats(entries: DayCalorieEntry[]): DietStats {
  const logged = entries.filter((e) => e.mealCount > 0);
  if (logged.length === 0) return { ...EMPTY };

  const sorted = [...logged].sort((a, b) => a.date.localeCompare(b.date));

  let daysOnTarget = 0;
  let mealsLogged = 0;
  let totalConsumed = 0;
  let bestStreak = 0;
  let run = 0;

  for (const e of sorted) {
    mealsLogged += e.mealCount;
    totalConsumed += e.consumed;
    const onTarget = e.consumed <= e.target;
    if (onTarget) {
      daysOnTarget += 1;
      run += 1;
      if (run > bestStreak) bestStreak = run;
    } else {
      run = 0;
    }
  }

  // Current streak: consecutive on-target days counting back from the most recent logged day.
  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].consumed <= sorted[i].target) currentStreak += 1;
    else break;
  }

  const loggedDays = sorted.length;
  return {
    loggedDays,
    mealsLogged,
    daysOnTarget,
    daysOverTarget: loggedDays - daysOnTarget,
    pctDaysOnTarget: Math.round((daysOnTarget / loggedDays) * 100),
    avgCaloriesPerDay: Math.round(totalConsumed / loggedDays),
    bestStreak,
    currentStreak,
  };
}
```

- [ ] **Step 4: Run test, verify pass**

Run: `npx vitest run lib/stats/compute.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/stats/compute.ts lib/stats/compute.test.ts
git commit -m "feat: add computeStats calorie aggregation"
```

---

## Task 6: Button variant palette

**Files:**
- Modify: `components/ui/button.tsx:6-45`

- [ ] **Step 1: Update variants to the new system**

Replace the `variant` block (lines 10-29) so `default`/`accent` use the green accent, `destructive` uses red, and radii use `rounded-xl`:
```tsx
      variant: {
        default:
          "rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent-soft disabled:text-white",
        accent:
          "rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-accent-soft disabled:text-white",
        outline:
          "rounded-xl border border-border bg-transparent text-foreground hover:bg-subtle",
        ghost:
          "rounded-lg text-foreground hover:bg-subtle",
        secondary:
          "rounded-xl bg-subtle text-foreground hover:bg-subtle/70",
        link:
          "text-accent underline-offset-4 hover:underline",
        destructive:
          "rounded-xl bg-transparent text-destructive hover:bg-destructive/10",
        pill:
          "rounded-pill bg-subtle text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground",
        "icon-circle":
          "rounded-full bg-accent text-accent-foreground hover:bg-accent/90",
      },
```
(Accent already maps to `--accent` = `#639339`, so most buttons update via tokens; this step only adjusts radii/border token names.)

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add components/ui/button.tsx
git commit -m "style: retune button variants to Daily-Diet palette"
```

---

## Task 7: Figma meal row

**Files:**
- Modify: `components/meals/meal-entry-row.tsx` (full rewrite)

- [ ] **Step 1: Rewrite the row to `time · divider · name · kcal`**

```tsx
"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import type { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";
import { formatMealTime } from "@/lib/dates/jerusalem";

interface MealEntryRowProps {
  meal: Meal;
  onEdit: () => void;
  onShowDetail: () => void;
}

export function MealEntryRow({ meal, onEdit, onShowDetail }: MealEntryRowProps) {
  const pending = meal.pending;
  const failed = !meal.pending && meal.calories === null;
  const time = formatMealTime(meal.createdAt);

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        "flex w-full items-center gap-3 rounded-md border border-border bg-surface px-4 py-3.5 text-start",
        pending && "opacity-70"
      )}
    >
      <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">{time}</span>
      <span className="h-3.5 w-px shrink-0 bg-gray-400" aria-hidden />
      <span
        dir="auto"
        lang="he"
        className="min-w-0 flex-1 truncate text-base text-subtle-foreground"
      >
        {meal.text}
      </span>
      <span
        className={cn(
          "flex w-[68px] shrink-0 items-center justify-end gap-1 text-sm font-bold tabular-nums text-foreground",
          (pending || failed) && "text-muted-foreground"
        )}
        onClick={(e) => {
          if (!pending && !failed) {
            e.stopPropagation();
            onShowDetail();
          }
        }}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : failed ? (
          <AlertCircle className="h-5 w-5 text-destructive" />
        ) : (
          <>
            {meal.calories}
            <span className="text-[11px] font-semibold text-muted-foreground">kcal</span>
          </>
        )}
      </span>
    </button>
  );
}
```
Note: detail open moves onto the kcal area tap (the standalone info button is removed); confirm this UX is acceptable, otherwise keep a small trailing info button.

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add components/meals/meal-entry-row.tsx
git commit -m "feat: Figma-style meal row (time, divider, name, kcal)"
```

---

## Task 8: Green/red calorie hero

**Files:**
- Modify: `components/meals/calorie-progress.tsx` (full rewrite of `CalorieHero`)

- [ ] **Step 1: Rewrite hero as a green/red card**

```tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CalorieHeroProps {
  consumed: number;
  target: number;
  remaining: number;
  action?: ReactNode;
}

export function CalorieHero({ consumed, target, remaining, action }: CalorieHeroProps) {
  const over = consumed > target;
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;

  return (
    <section
      className={cn(
        "relative mt-2 rounded-2xl px-5 py-5",
        over ? "bg-red-light" : "bg-green-light"
      )}
    >
      {action && <div className="absolute right-4 top-4">{action}</div>}
      <p
        className={cn(
          "text-[11px] font-extrabold uppercase tracking-wider",
          over ? "text-red-dark" : "text-green-dark"
        )}
      >
        Calories today
      </p>
      <p className="mt-1 text-[40px] font-extrabold leading-none tabular-nums text-foreground">
        {consumed.toLocaleString()}
      </p>
      <p className="mt-1 text-sm text-subtle-foreground tabular-nums">
        {over
          ? `${(consumed - target).toLocaleString()} kcal over · target ${target.toLocaleString()}`
          : `${remaining.toLocaleString()} kcal remaining · target ${target.toLocaleString()}`}
      </p>
      <div
        className={cn(
          "mt-4 h-2 w-full overflow-hidden rounded-full",
          over ? "bg-red-mid/50" : "bg-green-mid/60"
        )}
      >
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", over ? "bg-red-dark" : "bg-green-dark")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </section>
  );
}

export const CalorieProgress = CalorieHero;
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add components/meals/calorie-progress.tsx
git commit -m "feat: green/red calorie hero card"
```

---

## Task 9: `updateMealSlot` Firestore helper

**Files:**
- Modify: `lib/firestore/meals.ts` (add export near other updates, after `updateMealManualCalories`)

- [ ] **Step 1: Add the function**

```ts
export async function updateMealSlot(
  uid: string,
  mealId: string,
  slot: MealSlot
): Promise<void> {
  await updateDoc(doc(getClientDb(), mealsCol(uid), mealId), {
    slot,
    updatedAt: serverTimestamp(),
  });
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add lib/firestore/meals.ts
git commit -m "feat: add updateMealSlot for slot moves"
```

---

## Task 10: Add-meal sheet — slot selector

**Files:**
- Read first: `components/meals/add-meal-sheet.tsx` (understand current props/flow)
- Modify: `components/meals/add-meal-sheet.tsx`

- [ ] **Step 1: Add a slot selector to the sheet**

Change the sheet so it accepts an initial slot and lets the user change it. Add to props: `defaultSlot: MealSlot | null`. Render a row of 4 pill buttons (use `MEAL_SLOTS` from `@/types/meal`) above the text input, controlled by local state initialized from `defaultSlot ?? defaultSlotForTime()`. On confirm, pass the chosen slot up.

Representative selector markup (place above the text field):
```tsx
import { MEAL_SLOTS, type MealSlot } from "@/types/meal";
import { defaultSlotForTime } from "@/lib/meals/slot";
// ...
const [slot, setSlot] = useState<MealSlot>(defaultSlot ?? defaultSlotForTime());

<div className="flex gap-2">
  {MEAL_SLOTS.map(({ slot: s, label }) => (
    <button
      key={s}
      type="button"
      data-active={slot === s}
      onClick={() => setSlot(s)}
      className="flex-1 rounded-pill bg-subtle px-2 py-2 text-[13px] font-semibold text-foreground data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
    >
      {label}
    </button>
  ))}
</div>
```

- [ ] **Step 2: Update `onConfirm` to include the slot**

Change the confirm callback signature to `onConfirm(text: string, slot: MealSlot)`. (DayView wiring updated in Task 12.)

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: success (DayView may show a type error until Task 12 — if so, proceed to Task 12 before building, or stub the new arg).

- [ ] **Step 4: Commit**

```bash
git add components/meals/add-meal-sheet.tsx
git commit -m "feat: slot selector in add-meal sheet"
```

---

## Task 11: Meal slot section — drop target, no add button

**Files:**
- Modify: `components/meals/meal-slot-section.tsx`

- [ ] **Step 1: Remove the per-slot add button and make the section a droppable**

Rewrite using `useDroppable` from `@dnd-kit/core`, keyed by slot; remove the `Plus`/`onAdd` button and `onAdd` prop. Keep the icon + label header and the meal list. Highlight when a draggable hovers.

```tsx
"use client";

import { Croissant, Salad, UtensilsCrossed, Cookie } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { MealEntryRow } from "./meal-entry-row";
import { DraggableMeal } from "./draggable-meal";
import { cn } from "@/lib/utils";
import type { Meal, MealSlot } from "@/types/meal";

const SLOT_ICON: Record<MealSlot, LucideIcon> = {
  BREAKFAST: Croissant,
  LUNCH: Salad,
  DINNER: UtensilsCrossed,
  SNACK: Cookie,
};

interface MealSlotSectionProps {
  label: string;
  slot: MealSlot;
  meals: Meal[];
  onSelectMeal: (meal: Meal) => void;
  onShowDetail: (meal: Meal) => void;
}

export function MealSlotSection({ label, slot, meals, onSelectMeal, onShowDetail }: MealSlotSectionProps) {
  const Icon = SLOT_ICON[slot];
  const { setNodeRef, isOver } = useDroppable({ id: slot });

  return (
    <section ref={setNodeRef} className={cn("py-4", isOver && "rounded-xl bg-green-light/40")}>
      <h2 className="flex items-center gap-2 text-[17px] font-bold text-foreground">
        <Icon className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={2} aria-hidden />
        {label}
      </h2>
      <div className="mt-3">
        {meals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No meals logged</p>
        ) : (
          <div className="flex flex-col gap-2">
            {meals.map((meal) => (
              <DraggableMeal key={meal.id} id={meal.id}>
                <MealEntryRow
                  meal={meal}
                  onEdit={() => onSelectMeal(meal)}
                  onShowDetail={() => onShowDetail(meal)}
                />
              </DraggableMeal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create `components/meals/draggable-meal.tsx`**

```tsx
"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export function DraggableMeal({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn("touch-none", isDragging && "z-50 opacity-80")}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Verify build (DayView wiring next task)**

Run: `npm run build`
Expected: type error in `day-view.tsx` for removed `onAdd` — fixed in Task 12.

- [ ] **Step 4: Commit**

```bash
git add components/meals/meal-slot-section.tsx components/meals/draggable-meal.tsx
git commit -m "feat: droppable meal sections + draggable meals"
```

---

## Task 12: DayView — DnD context, FAB, slot move

**Files:**
- Create: `components/layout/add-meal-fab.tsx`
- Modify: `components/meals/day-view.tsx`

- [ ] **Step 1: Create the FAB**

`components/layout/add-meal-fab.tsx`:
```tsx
"use client";

import { Plus } from "lucide-react";

export function AddMealFab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add meal"
      className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg shadow-accent/30 transition-transform active:scale-95"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <Plus className="h-7 w-7" strokeWidth={2.5} />
    </button>
  );
}
```

- [ ] **Step 2: Wire DnD + FAB in `day-view.tsx`**

- Import: `DndContext`, `DragEndEvent`, `PointerSensor`, `TouchSensor`, `useSensor`, `useSensors` from `@dnd-kit/core`; `AddMealFab`; `updateMealSlot`; `MealSlot`.
- Replace `addSlot` state usage: keep a single `addOpen` boolean (FAB opens the sheet with `defaultSlot = null`).
- Add sensors with activation constraints so taps/swipes still work:
```tsx
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
);
```
- Add handler:
```tsx
async function handleDragEnd(e: DragEndEvent) {
  const mealId = String(e.active.id);
  const overSlot = e.over?.id as MealSlot | undefined;
  if (!uid || !overSlot) return;
  const meal = meals.find((m) => m.id === mealId);
  if (!meal || meal.slot === overSlot) return;
  await updateMealSlot(uid, mealId, overSlot);
  toast.success(`Moved to ${overSlot.toLowerCase()}`);
}
```
- Wrap the meal sections in `<DndContext sensors={sensors} onDragEnd={handleDragEnd}>…</DndContext>`.
- Remove `onAdd` from `MealSlotSection` usage.
- Render `<AddMealFab onClick={() => setAddOpen(true)} />` (only for today/any day — keep for all days for consistency).
- Update `AddMealSheet` usage: `open={addOpen}`, `defaultSlot={null}`, `onConfirm={(text, slot) => handleConfirmAdd(text, slot)}`, and change `handleConfirmAdd` to accept `slot`:
```tsx
async function handleConfirmAdd(text: string, slot: MealSlot) {
  if (!uid) return;
  const mealId = await createMealPending(uid, { date, slot, text });
  void runEstimateAfterEdit(mealId, text);
  setAddOpen(false);
}
```

- [ ] **Step 3: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: success.

- [ ] **Step 4: Manual check**

Run `npm run dev`, open a day on a phone viewport: tap FAB → sheet with slot pills → add meal; long-press a meal and drag it onto another section → it moves; horizontal swipe still changes day.

- [ ] **Step 5: Commit**

```bash
git add components/layout/add-meal-fab.tsx components/meals/day-view.tsx
git commit -m "feat: FAB add + drag-and-drop slot moves on day view"
```

---

## Task 13: Bottom nav — 4 tabs + restyle

**Files:**
- Modify: `components/layout/bottom-nav.tsx`

- [ ] **Step 1: Add Stats tab and restyle**

Add a Stats link (icon `BarChart3` from lucide) between Today and Weight; set `max-w-[480px]`; active color `text-accent`, inactive `text-muted-foreground`. Links array:
```tsx
import { Home, BarChart3, Scale, Settings as SettingsIcon } from "lucide-react";
// ...
const links = [
  { href: `/day/${today}`, label: "Today", icon: Home, match: (p: string) => p === "/" || p.startsWith("/day/") },
  { href: "/stats", label: "Stats", icon: BarChart3, match: (p: string) => p === "/stats" },
  { href: "/weight", label: "Weight", icon: Scale, match: (p: string) => p === "/weight" },
  { href: "/settings", label: "Settings", icon: SettingsIcon, match: (p: string) => p === "/settings" },
];
```
Keep the existing structure; ensure border uses `border-hairline` and bg `bg-surface`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success (the `/stats` route 404s until Task 15 — that's fine for build).

- [ ] **Step 3: Commit**

```bash
git add components/layout/bottom-nav.tsx
git commit -m "feat: add Stats tab to bottom nav"
```

---

## Task 14: `use-stats` aggregation hook

**Files:**
- Create: `hooks/use-stats.ts`

- [ ] **Step 1: Implement the windowed hook**

Reads meals and dayMeta for the last 90 days, builds `DayCalorieEntry[]`, returns `computeStats` output plus `loading`.

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getClientDb } from "@/lib/firebase/client";
import { mealsCol, dayMetaCol } from "@/lib/firestore/paths";
import { mealFromDoc } from "@/lib/firestore/meals";
import { computeStats, type DayCalorieEntry, type DietStats } from "@/lib/stats/compute";
import { getTargetForDate, type useUserProfile } from "@/hooks/use-user-profile";
import { getJerusalemDateString, subtractDaysFromDateString } from "@/lib/dates/jerusalem";
import { SPORT_BONUS_KCAL } from "@/types/day-meta";
import type { UserProfile } from "@/types/user";

const WINDOW_DAYS = 90;

export function useStats(uid: string | undefined, profile: UserProfile | null) {
  const [stats, setStats] = useState<DietStats | null>(null);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const start = subtractDaysFromDateString(getJerusalemDateString(), WINDOW_DAYS - 1);

    (async () => {
      const db = getClientDb();
      const [mealsSnap, metaSnap] = await Promise.all([
        getDocs(query(collection(db, mealsCol(uid)), where("date", ">=", start))),
        getDocs(query(collection(db, dayMetaCol(uid)), where("date", ">=", start))),
      ]);

      const sportByDate = new Map<string, number>();
      metaSnap.forEach((d) => {
        const data = d.data() as { sport?: boolean; sportBonusKcal?: number };
        if (data.sport) sportByDate.set(d.id, data.sportBonusKcal ?? SPORT_BONUS_KCAL);
      });

      const byDate = new Map<string, { consumed: number; mealCount: number }>();
      mealsSnap.forEach((d) => {
        const m = mealFromDoc(d.id, d.data());
        const cur = byDate.get(m.date) ?? { consumed: 0, mealCount: 0 };
        cur.consumed += m.calories ?? 0;
        cur.mealCount += 1;
        byDate.set(m.date, cur);
      });

      const entries: DayCalorieEntry[] = [...byDate.entries()].map(([date, v]) => ({
        date,
        consumed: v.consumed,
        mealCount: v.mealCount,
        target: getTargetForDate(profile, date) + (sportByDate.get(date) ?? 0),
      }));

      if (!cancelled) setStats(computeStats(entries));
    })().catch((err) => {
      console.error("useStats error", err);
      if (!cancelled) setStats(computeStats([]));
    });

    return () => {
      cancelled = true;
    };
  }, [uid, profile]);

  const loading = uid ? stats === null : false;
  return useMemo(() => ({ stats: stats ?? computeStats([]), loading }), [stats, loading]);
}
```
Note: confirm `SPORT_BONUS_KCAL` and the `sport`/`sportBonusKcal` field names in `@/types/day-meta`; adjust if different. The `date >= start` meal query is a single-field range (no composite index needed).

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add hooks/use-stats.ts
git commit -m "feat: useStats windowed aggregation hook"
```

---

## Task 15: Statistics screen

**Files:**
- Create: `app/(app)/stats/page.tsx`
- Create: `components/stats/stats-view.tsx`

- [ ] **Step 1: Create the route**

`app/(app)/stats/page.tsx`:
```tsx
import { StatsView } from "@/components/stats/stats-view";

export default function StatsPage() {
  return <StatsView />;
}
```

- [ ] **Step 2: Create the view**

`components/stats/stats-view.tsx`:
```tsx
"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useStats } from "@/hooks/use-stats";
import { cn } from "@/lib/utils";

function StatCard({ n, c, tone }: { n: string; c: string; tone?: "good" | "bad" }) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 text-center",
        tone === "good" ? "bg-green-light" : tone === "bad" ? "bg-red-light" : "bg-muted"
      )}
    >
      <div className="text-2xl font-extrabold tabular-nums text-foreground">{n}</div>
      <div className="mt-0.5 text-[13px] text-subtle-foreground">{c}</div>
    </div>
  );
}

export function StatsView() {
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { stats, loading } = useStats(user?.uid, profile);
  const good = stats.pctDaysOnTarget >= 50;

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <span className="pulse-dot text-xl text-muted-foreground">·</span>
      </div>
    );
  }

  return (
    <div className="editorial-in">
      <div className={cn("-mx-5 rounded-b-2xl px-5 py-8 text-center", good ? "bg-green-light" : "bg-red-light")}>
        <div className="text-[44px] font-extrabold leading-none tabular-nums text-foreground">
          {stats.pctDaysOnTarget}%
        </div>
        <div className="mt-1 text-sm text-subtle-foreground">of logged days within your calorie target</div>
      </div>

      <h2 className="mt-6 text-center text-[13px] font-extrabold uppercase tracking-wide text-muted-foreground">
        General statistics
      </h2>

      <div className="mt-4 flex flex-col gap-3">
        <StatCard n={`${stats.bestStreak} days`} c="best on-target streak" />
        <StatCard n={`${stats.currentStreak} days`} c="current streak" />
        <StatCard n={String(stats.mealsLogged)} c="meals logged" />
        <div className="flex gap-3">
          <div className="flex-1"><StatCard n={String(stats.daysOnTarget)} c="days on target" tone="good" /></div>
          <div className="flex-1"><StatCard n={String(stats.daysOverTarget)} c="days over target" tone="bad" /></div>
        </div>
        <StatCard n={`${stats.avgCaloriesPerDay.toLocaleString()} kcal`} c="average per day" />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify lint + build + manual**

Run: `npm run lint && npm run build`
Then `npm run dev` → tap the Stats tab → numbers render from your data.

- [ ] **Step 4: Commit**

```bash
git add "app/(app)/stats/page.tsx" components/stats/stats-view.tsx
git commit -m "feat: statistics screen"
```

---

## Task 16: Restyle weight, settings, login, sheets

**Files:**
- Modify: `components/weight/weight-chart.tsx`, `components/weight/weight-entry-list.tsx`, `components/weight/weight-today-strip.tsx`, `components/weight/log-weight-sheet.tsx`
- Modify: `app/(app)/settings/page.tsx`, `app/(auth)/login/page.tsx`
- Modify: `components/meals/quick-edit-sheet.tsx`, `components/meals/meal-detail-sheet.tsx`, `components/meals/done-logging-button.tsx`

- [ ] **Step 1: Token sweep**

For each file above, replace stale visual choices with the new system (these are token-level edits; read each file, then apply):
- Recharts series color in `weight-chart.tsx`: set stroke/fill to `#639339`.
- Card surfaces → `bg-surface border border-border rounded-xl`.
- Primary actions → default/accent button variant (already green).
- Destructive (delete) → `text-destructive` / `bg-destructive`.
- "Done logging" button → `bg-foreground text-background` (the dark `#1B1D1E` pill) to match the Figma dark CTA.
- Remove any remaining `text-accent` teal assumptions (token already remapped, so most are automatic).

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add components/weight "app/(app)/settings/page.tsx" "app/(auth)/login/page.tsx" components/meals/quick-edit-sheet.tsx components/meals/meal-detail-sheet.tsx components/meals/done-logging-button.tsx
git commit -m "style: restyle weight, settings, login, sheets to Daily-Diet system"
```

---

## Task 17: Final pass — cleanup, tests, build, manual checklist

**Files:**
- Modify: any leftover references to removed tokens/fonts.

- [ ] **Step 1: Grep for stale references**

Run (via editor search): look for `#4FB6A5`, `font-heebo`, `Heebo`, `Inter(`, `JetBrains`, `--font-inter`, `onAdd`. Resolve any remaining hits.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS (jerusalem, slot, compute test files — 11 tests).

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
Expected: success, zero lint errors.

- [ ] **Step 4: Manual mobile checklist (`npm run dev`, iPhone Safari / responsive)**

- [ ] Today screen: green hero (turns red when over target), meal rows show time/divider/name/kcal aligned, Hebrew renders in Rubik.
- [ ] FAB opens add sheet with slot pills; adding works and estimates.
- [ ] Long-press + drag a meal to another slot moves it; toast shows; horizontal swipe still changes day.
- [ ] Stats tab renders real numbers.
- [ ] Weight, Settings, Login look consistent.
- [ ] No teal/mint remnants anywhere.

- [ ] **Step 5: Update memory bank**

Per `project-core`, append to `memory-bank/progress.md` changelog: "2026-05-30 — Daily-Diet visual redesign + FAB/drag-drop + stats screen." Update `memory-bank/activeContext.md` focus if needed.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: redesign cleanup + memory-bank update"
```

---

## Self-Review

**Spec coverage:**
- Palette/fonts → Task 2. ✓
- Green/red remap → Tasks 2, 8, 15. ✓
- Meal row (time/divider/name/kcal, no dot, time from createdAt) → Task 7. ✓
- Hero card → Task 8. ✓
- FAB-only add + slot selector → Tasks 10, 12. ✓
- Drag-and-drop slot move + `updateMealSlot` → Tasks 9, 11, 12. ✓
- Bottom nav 4 tabs → Task 13. ✓
- Stats screen + metrics + windowed aggregation → Tasks 5, 14, 15. ✓
- Restyle remaining screens/sheets/buttons → Tasks 6, 16. ✓
- No schema change → confirmed (time from `createdAt`, slot reuse). ✓
- Risks (stats window=90d, iOS gesture coexistence via long-press delay) → Tasks 12, 14. ✓

**Type consistency:** `MealSlot` reused throughout; `DayCalorieEntry`/`DietStats`/`computeStats` consistent across Tasks 5, 14, 15; `onConfirm(text, slot)` updated in both Task 10 (sheet) and Task 12 (DayView); `updateMealSlot` signature consistent in Tasks 9 and 12.

**Open verification (flagged for executor):**
- Confirm `@/types/day-meta` field names (`sport`, `sportBonusKcal`, `SPORT_BONUS_KCAL`) used in Task 14.
- Confirm dropping the standalone info button in the meal row (Task 7) is acceptable, else keep a trailing info affordance.
