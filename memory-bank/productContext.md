# Product Context

## Problem

Commercial calorie apps are slow for Hebrew free-text logging (database pickers, barcodes, structured forms). Friction kills consistency. This app optimizes for **habit and speed**, not clinical accuracy.

## Primary user

Omri — sole user. No onboarding flows, no multi-tenant concerns.

## User stories (v1 must-haves)

| ID | Summary |
|----|---------|
| US-01 | Open app → see **today** by default |
| US-02 | Tap **+** on a meal slot → Hebrew text input |
| US-03 | AI estimate appears within seconds (optimistic UI) |
| US-04 | Daily total: consumed / target / remaining + progress bar |
| US-05 | Edit or delete meals |
| US-06 | Navigate past/future days (swipe mobile, arrows desktop) |
| US-07 | Set daily calorie target once (settings) |
| US-08–10 | Log weight, graph trend, edit/delete weight entries |

## Information architecture

| Route | Purpose |
|-------|---------|
| `/` | Today view (default) |
| `/day/[date]` | Specific day (`YYYY-MM-DD`) |
| `/weight` | Weight log + Recharts graph + recent list |
| `/settings` | Daily calorie target |
| `/api/estimate` | POST `{ text }` → Claude estimate (server only) |

**Bottom nav:** Today | Weight | Settings (⚙)

## Today view structure

- Day header with ← date → navigation
- Progress: `consumed / target`, remaining kcal, bar
- Optional card: latest weight + delta vs 7 days ago (FR-27)
- **4 fixed slots:** Breakfast, Lunch, Dinner, Snacks — each supports **multiple entries**
- Per entry: Hebrew text (RTL), calorie number, loading/error states

## Meal entry flow

1. Tap `+` → bottom sheet, Hebrew input (`dir="auto"`, `lang="he"`)
2. Submit → optimistic row with `...` for calories
3. Check `estimationCache` → else `/api/estimate`
4. Persist to Firestore; real-time listener updates UI
5. Tap entry → edit (re-estimates) or delete
6. Tap ⓘ → breakdown, reasoning, assumptions; editable breakdown rows (FR-17)

## Weight screen

- Current weight, deltas (7d, 30d)
- Line chart (default last 90d; optional 30d/90d/1y/all)
- `+ Log weight` → kg (1 decimal), date picker (default today)
- **One entry per date** — doc ID = date string (upsert overwrites)
- Recent list: tap edit, swipe delete

## Non-goals (do not build in v1)

Multi-user, macros, recipes, exercise, body fat %, goal weight projections, native apps, nutrition coaching.
