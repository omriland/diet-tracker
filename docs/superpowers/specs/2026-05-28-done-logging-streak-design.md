# Done Logging Button + Streak — Design Spec

**Date:** 2026-05-28
**Status:** Approved

---

## Overview

Add a "Done logging for today" button to the daily view. Tapping it marks the day as complete and triggers a confetti celebration showing the user's current logging streak. Streak uses a hybrid rule: today gets a grace period, so the streak only breaks if you didn't mark the *previous* day done.

---

## Data Model

Extend `DayMeta` in `types/day-meta.ts`:

```ts
doneLogging?: boolean;
doneLoggingAt?: Date;
```

- Backward-compatible: missing field treated as `false`.
- Stored in the existing `/users/{uid}/dayMeta/{date}` Firestore doc.
- `doneLoggingAt` is set to server timestamp at the moment of marking done; cleared (or set to null) on undo.

### Firestore writer

Add `setDayMetaDoneLogging(uid: string, date: string, done: boolean): Promise<void>` to `lib/firestore/day-meta.ts`, mirroring the existing `setDayMetaSport` pattern (upsert: `setDoc` on first write, `updateDoc` thereafter).

Parser `dayMetaFromDoc` must also read and map the new fields.

---

## Streak Logic

**Rule (hybrid / option C):**

Walk backward from today:
1. If today has `doneLogging: true` — count it, continue backward.
2. If today does NOT have `doneLogging: true` — skip it (grace), start counting from yesterday.
3. For every prior day: require `doneLogging: true`. First miss → stop.

This means the streak doesn't break at midnight — it only breaks when a *past* day is missing.

**Implementation — `hooks/use-streak.ts`:**

- Query: `dayMeta` collection for the user, filtered `where('doneLogging', '==', true)`, ordered by `date` desc, limit 60.
- Build a `Set<string>` of done dates.
- Walk backward day-by-day from today: apply rule above.
- Return `{ streak: number, todayDone: boolean, loading: boolean }`.

---

## UI — Done Logging Button

**Component:** `components/meals/done-logging-button.tsx`

**Placement:** Bottom of `day-view.tsx`, below the last meal slot section, above bottom nav padding. Rendered only when `isToday(date)` is true — hidden on past/future days.

**States:**

| State | Appearance |
|-------|-----------|
| Not done | Full-width primary CTA — "Done logging for today" |
| Done | Same slot, muted/secondary style — "✓ Logged today · tap to undo" |

**Behaviour:**
- Tap when not done → write `doneLogging: true` to Firestore → fire celebration.
- Tap when done → write `doneLogging: false` (undo) → no celebration.
- Disabled/loading state during write to prevent double-tap.

---

## Celebration Animation

**Component:** `components/meals/streak-celebration.tsx`

**Dependency:** `canvas-confetti` (≈5 KB gzip).

**Sequence on trigger:**
1. Full-screen overlay appears (dark backdrop, ~80% opacity, z-index above everything).
2. Two confetti volleys fire from bottom-left and bottom-right corners.
3. Big streak number animates from 0 → actual streak over ~1.2s (rAF, ease-out).
4. Caption below number: "🔥 days in a row".
5. Auto-dismiss after 3 s; tapping anywhere dismisses immediately.

**Only triggered** when marking done (not on undo, not on past days).

---

## Files Changed

| File | Change |
|------|--------|
| `types/day-meta.ts` | Add `doneLogging?: boolean`, `doneLoggingAt?: Date` |
| `lib/firestore/day-meta.ts` | Add `setDayMetaDoneLogging`, update `dayMetaFromDoc` |
| `hooks/use-streak.ts` | New hook — streak query + computation |
| `components/meals/done-logging-button.tsx` | New component |
| `components/meals/streak-celebration.tsx` | New component (confetti overlay) |
| `components/meals/day-view.tsx` | Wire in button + celebration |
| `package.json` | Add `canvas-confetti` + `@types/canvas-confetti` |

---

## Out of Scope (v1)

- Retro-marking past days done
- "Longest streak ever" badge
- Notification/reminder to tap the button
- Streak visible on non-today days
