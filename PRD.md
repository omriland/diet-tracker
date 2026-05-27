# Diet Tracker — Product Requirements Document

**Version:** 0.1
**Date:** 27 May 2026
**Owner:** Omri
**Status:** Draft for build

---

## Executive Summary

A personal, single-user web app for logging meals and tracking daily calorie intake against a user-set target, plus tracking body weight over time. UI is in English; meal inputs are free-text Hebrew ("חביתה משתי ביצים עם פרוסת לחם") and an LLM estimates calories per entry. Built in Next.js with Firebase as the backend, mobile-first, deployed as a personal pet project. No accounts beyond Firebase Auth, no social features, no nutrition coaching — just fast logging, a running daily total, and a weight trend graph.

---

## Problem Statement

Existing calorie trackers (MyFitnessPal, Lose It, Yazio) require either picking from a database, scanning barcodes, or filling structured forms — all slow, and most fight Hebrew input. The friction kills consistency. I want to type what I ate in natural Hebrew in under 5 seconds and let an LLM do the estimation work. Accuracy within ±15% is acceptable; speed and habit-formation are the real goals. I also want a lightweight way to log my weight and see the trend — without it, the calorie tracking is unmoored from the outcome it's meant to influence.

---

## Goals & Non-Goals

**Goals**
- Log a meal in Hebrew in under 10 seconds (open app → tap + → type → save).
- See remaining calories for the day at a glance.
- Log weight in under 5 seconds and see a graph of weight over time.
- UI in English with proper LTR layout; only meal entries themselves render RTL.
- Work as well on mobile Safari/Chrome as on desktop.
- Be cheap to run (single user, low LLM token cost, Firebase free tier).

**Non-Goals**
- Multi-user / social features / sharing.
- Macronutrient tracking (protein/carbs/fat) — calories only for v1.
- Recipes, meal planning, shopping lists.
- Exercise / calories burned.
- Body composition (body fat %, muscle mass) — just bodyweight in kg.
- Goal weight tracking, weight loss projections — graph only for v1.
- Native mobile apps. PWA-ready is fine, native is not.

---

## User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-01 | user | open the app on my phone and see today | I don't navigate to find the current day |
| US-02 | user | tap a + button on a meal slot and type in Hebrew | logging is one gesture |
| US-03 | user | see the AI's calorie estimate appear within a few seconds | I get feedback while I still care |
| US-04 | user | see total calories consumed today and remaining vs my target | I know if I have budget for a snack |
| US-05 | user | edit or delete a logged meal | I can correct mistakes |
| US-06 | user | swipe / navigate to past or future days | I can review history or plan ahead |
| US-07 | user | set my daily calorie target once | the math reflects my goal |
| US-08 | user | log my weight on any day | I can keep a record |
| US-09 | user | see a graph of my weight over time | I can see the trend, not just today |
| US-10 | user | edit or delete a weight entry | I can correct typos |

---

## Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Show a calendar-day view as default; today is shown on app open | Must |
| FR-02 | Each day has 4 fixed slots: Breakfast, Lunch, Dinner, Snacks (English labels) | Must |
| FR-03 | Each slot has a `+` button that opens a Hebrew text input | Must |
| FR-04 | On submit, send the meal text to an LLM and receive a calorie estimate | Must |
| FR-05 | Persist meal entry: text, slot, date, calorie estimate, timestamp | Must |
| FR-06 | Show a per-day total: "consumed / target" with remaining and a progress bar | Must |
| FR-07 | All slots support multiple entries per day | Must |
| FR-08 | Tap an existing entry to edit text (re-runs estimation) or delete it | Must |
| FR-09 | Navigate between days via swipe (mobile) or arrow buttons (desktop) | Must |
| FR-10 | Settings screen to set daily calorie target (single number) | Must |
| FR-11 | UI in English (LTR). Hebrew text inputs and the meal text itself render RTL via `dir="auto"` on the relevant elements | Must |
| FR-12 | Loading state while LLM is computing; entry visible immediately with "..." for calories | Must |
| FR-13 | If LLM call fails, show error and let user retry or enter calories manually | Must |
| FR-14 | Manual calorie override on any entry (long-press or edit screen) | Should |
| FR-15 | Show 7-day rolling average calories on the today screen footer | Could |
| FR-16 | PWA manifest + service worker so app installs to home screen | Could |
| FR-17 | Editable breakdown components — tap a component to adjust portion grams; calories scale linearly; meal total auto-recomputes | Must |
| FR-18 | Delete individual breakdown component (long-press → delete); meal total recomputes | Should |
| **Weight tracking** | | |
| FR-20 | Dedicated Weight tab/screen accessible from main nav | Must |
| FR-21 | Quick-add weight entry: number input (kg, 1 decimal), defaults to today | Must |
| FR-22 | Allow logging weight for a past date via date picker | Must |
| FR-23 | One weight entry per date (logging the same date overwrites) | Must |
| FR-24 | Line graph of weight vs. date, showing all entries; sensible default range (last 90 days) | Must |
| FR-25 | Tap a point on the graph to see the exact value and date | Must |
| FR-26 | List view of recent weight entries below the graph; tap to edit, swipe to delete | Must |
| FR-27 | On the today screen, show latest weight + delta vs. 7 days ago in a small card | Should |
| FR-28 | Time range selector on graph: 30d / 90d / 1y / all | Could |

---

## Non-Functional Requirements

| ID | Requirement | Notes |
|---|---|---|
| NFR-01 | Mobile-first responsive design | Test on iPhone Safari 16+ and Android Chrome |
| NFR-02 | First contentful paint < 1.5s on 4G | Use Next.js App Router, server components where possible |
| NFR-03 | LLM round-trip < 4s p95 (no-search) / < 8s p95 (with search) | Sonnet 4.6 with `web_search_20260209` |
| NFR-04 | English UI, LTR. Hebrew renders correctly within meal-text fields via `dir="auto"` | No full app-wide RTL flip |
| NFR-05 | All data persisted in Firebase (Firestore) | See Data Model below |
| NFR-06 | Authentication via Firebase Auth, single user | Email/password or Google sign-in; restrict to your email in Firestore rules |
| NFR-07 | Cost ceiling | Target < $5/month all-in (LLM ~$2–4, Firebase free tier, Vercel free tier) |

---

## Technical Approach

### Stack
- **Frontend:** Next.js 15 (App Router), React Server Components where possible, Tailwind CSS for styling, shadcn/ui for primitives, Recharts for the weight graph.
- **Backend:** Next.js Route Handlers (`app/api/*`) for the Claude API proxy. Firestore SDK called directly from the client for reads/writes (with security rules locking it to your user).
- **DB:** Firebase Firestore.
- **Auth:** Firebase Auth (Google sign-in is simplest). Firestore security rules restrict all reads/writes to your specific `uid`.
- **LLM:** Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`) via Claude API. Strong Hebrew, strong reasoning, supports the native `web_search_20260209` tool so it can verify portion/brand calorie data against reliable sources before answering. See the [Calorie Estimation Engine](#calorie-estimation-engine) section below for the full spec.
- **Charts:** Recharts (lightweight, works well with the shadcn ecosystem).
- **Hosting:** Vercel (free tier covers this).

### Why Firebase
- Auth + DB + hosting story is one SDK.
- Real-time listeners mean the today-view updates instantly when a meal is saved (no manual refetch).
- Free tier (Spark plan) is more than enough for a single user: 1 GiB storage, 50K reads/day, 20K writes/day.
- No server to manage; the Next.js API route only exists to hide the Anthropic key.

### Data Model (Firestore)

Single user, so all data lives under `/users/{uid}/`. Three collections:

```
/users/{uid}
  email: string
  dailyCalorieTarget: number   // e.g. 2000
  createdAt: timestamp

/users/{uid}/meals/{mealId}
  date: string                 // "YYYY-MM-DD" in Asia/Jerusalem
  slot: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"
  text: string                 // Hebrew free text (user input)
  calories: number             // top-level total (sum of breakdown, or manual override)
  caloriesSource: "AI" | "AI_CACHED" | "MANUAL" | "MANUAL_BREAKDOWN_EDIT"
  confidence: "low" | "medium" | "high" | null
  searched: boolean
  sources: string[]
  reasoningHe: string | null
  assumptionsHe: string[]
  breakdown: {
    itemHe: string,
    itemEn: string,
    calories: number,
    portionGrams: number | null,
    confidence: "low" | "medium" | "high",
    originalCalories: number,   // model's original estimate, preserved across edits
    originalPortionGrams: number | null,  // for linear scaling math
    edited: boolean              // true if user modified this row
  }[]
  needsClarificationHe: string | null
  foodCategory: "meal" | "snack" | "drink" | "dessert" | null
  createdAt: timestamp
  updatedAt: timestamp

/users/{uid}/weights/{weightId}
  date: string                 // "YYYY-MM-DD" — used as the document ID so "one per day" is enforced
  weightKg: number             // 1 decimal precision (e.g. 78.4)
  createdAt: timestamp
  updatedAt: timestamp

/users/{uid}/estimationCache/{cacheId}
  textNormalized: string       // also used as the document ID
  calories: number
  confidence: string
  reasoningHe: string
  assumptionsHe: string[]
  sources: string[]
  hitCount: number
  lastUsedAt: timestamp
  createdAt: timestamp
```

**Indexing notes:**
- Meals: composite index on `(date, slot)` for fast day-view queries.
- Weights: single-field index on `date` (descending) — for graph queries like "last 90 days".
- Use the date string as the doc ID for weights to make upserts trivial (`setDoc` with merge).

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

Optionally, hardcode the allowed `uid` for extra paranoia:

```javascript
allow read, write: if request.auth != null
  && request.auth.uid == "YOUR_FIREBASE_UID";
```

### LLM Prompt

See the dedicated [Calorie Estimation Engine](#calorie-estimation-engine) section below — this is the heart of the product and gets its own spec.

### Architecture

```
[Mobile/Web browser]
        │
        ├── Firebase Auth (sign-in)
        ├── Firestore SDK ────────────► Firestore (reads/writes meals, weights, settings)
        │
        └── Next.js (Vercel)
            ├── /                      → Today view
            ├── /day/[date]            → Specific day view
            ├── /weight                → Weight log + graph
            ├── /settings              → Set target
            └── /api/estimate          → POST { text } → calls Claude API, returns estimate
                    │
                    └──► Anthropic API (Sonnet 4.6 + web_search)
```

The Anthropic key lives **only** in the Next.js server env vars — the client never sees it. Everything else (meals, weights, settings) goes directly from the client to Firestore via the SDK, secured by the rules above. This keeps the architecture simple: the API route is the single server-side concern.

### UI Layout (mobile, today view)

UI labels are in English; meal text rendered RTL inside each entry via `dir="auto"`.

```
┌─────────────────────────────┐
│  ←  Wed, May 27  →          │  ← day navigation
├─────────────────────────────┤
│  Today                       │
│  1,420 / 2,000  ▓▓▓▓▓░░░    │  ← progress bar
│  580 kcal remaining          │
│  Weight: 78.4 kg  (-0.6 7d) │  ← latest weight card
├─────────────────────────────┤
│  🥐  Breakfast            + │
│              חביתה + לחם  •  │  ← Hebrew text, right-aligned
│                        320   │
├─────────────────────────────┤
│  🥗  Lunch                + │
│                   סלט טונה  •  │
│                        450   │
├─────────────────────────────┤
│  🍽  Dinner               + │
├─────────────────────────────┤
│  🍫  Snacks               + │
│                       תפוח  •  │
│                         80   │
│                 שוקולד מריר  •  │
│                        120   │
├─────────────────────────────┤
│  [Today]  [Weight]  [⚙]     │  ← bottom nav
└─────────────────────────────┘
```

Tapping `+` opens a bottom sheet with a Hebrew-friendly text input (`dir="auto"`, `lang="he"`) and a submit button. Optimistic insert: entry appears immediately with a spinner where calories will go.

### UI Layout (mobile, weight screen)

```
┌─────────────────────────────┐
│  Weight                      │
├─────────────────────────────┤
│  Current: 78.4 kg            │
│  vs. 7 days ago: -0.6 kg     │
│  vs. 30 days ago: -1.8 kg    │
├─────────────────────────────┤
│  [30d] [90d] [1y] [All]     │  ← range toggle
│                              │
│       ╱╲                     │
│      ╱  ╲___╱╲               │
│     ╱        ╲___            │  ← line chart
│   ╱             ╲__          │
│                              │
│  Apr 27           May 27     │
├─────────────────────────────┤
│  + Log weight                │  ← prominent CTA
├─────────────────────────────┤
│  Recent entries              │
│  May 27   78.4 kg            │
│  May 26   78.6 kg            │
│  May 25   78.5 kg            │
│  ...                         │
├─────────────────────────────┤
│  [Today]  [Weight]  [⚙]     │
└─────────────────────────────┘
```

Tapping `+ Log weight` opens a bottom sheet: number input, date defaulting to today (changeable), Save button. Tapping an entry in the list lets you edit or delete.

---

## Risks & Open Questions

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| LLM calorie estimates are systematically off for Israeli foods | Medium | Medium | Manual override on every entry; web search via `web_search_20260209` allows pulling from Israeli sources; refine prompt with examples after a week |
| Hebrew portion descriptions are ambiguous ("פיתה" — large or small?) | High | Low | LLM returns confidence; "low" confidence shows warning icon |
| Firestore security rules misconfigured → public data | Low | High | Strict rules from day one (`uid == request.auth.uid`); test in Firebase Rules Playground before any deploy |
| LLM cost creeps up if I log compulsively | Low | Low | Local cache for repeat foods cuts ~30% of calls; `max_uses: 3` on web search caps the worst case |
| Timezone bugs (meals logged late at night attributed to wrong day) | Medium | Medium | All date logic locked to Asia/Jerusalem on the server; date strings (`YYYY-MM-DD`) computed there, never on client |
| Hebrew text gets mangled by `dir="auto"` in mixed contexts | Low | Low | Wrap meal text in a span with explicit `dir="auto"` and `lang="he"`; test on iOS Safari early |
| Two devices log a meal at the same moment | Low | Low | Firestore handles concurrency natively; not a real issue for single user |

**Open questions:**
- Do I want a one-off "import past week" flow, or just start logging from day one? *(Suggest: start fresh.)*
- Should the LLM also suggest a meal name/category for the entry list, or just keep the raw text? *(Suggest: keep raw text — it's faster and more honest.)*

---

## Success Metrics

This is a pet project, not a startup, so metrics are personal:
- **Habit:** I log ≥80% of meals for 14 consecutive days after launch.
- **Speed:** Average time from tap-+ to entry-saved is under 10 seconds (self-timed).
- **Accuracy feel:** After 2 weeks, I'd rate the calorie estimates "good enough" subjectively. No formal accuracy benchmark.
- **Cost:** Under $1/month all-in (LLM + hosting).

---

## Build Plan (rough)

1. **Day 1:** Next.js scaffold, Firebase project setup, Firestore rules, Firebase Auth wired up.
2. **Day 2:** Today view UI (English LTR, Hebrew text fields), meal entry flow + Claude API integration end-to-end.
3. **Day 3:** Day navigation, edit/delete meals, estimation cache in Firestore.
4. **Day 4:** Weight screen — entry form, Recharts graph, recent-entries list.
5. **Day 5:** Settings, polish, bottom nav, mobile gestures, PWA manifest, deploy to Vercel.
6. **Week 2:** Use it daily, iterate on the prompt and any rough edges.

---

---

## Calorie Estimation Engine

The estimation engine is the single most important part of the product. Bad estimates kill trust; good estimates make the app feel magical. The strategy is **let Claude search the web when it needs to, but keep the path fast and structured.**

### Model & Tools

- **Model:** `claude-sonnet-4-6` (Sonnet 4.6).
- **Tool:** `web_search_20260209` with `max_uses: 3`. Optionally restrict to reliable domains via `allowed_domains`.
- **Output:** structured JSON via response prefill (no separate `tool_use` for output formatting needed).

### When the model should (and shouldn't) search

The whole point of a strong model with web access is that it decides. The system prompt nudges it as follows:

- **Don't search** for generic, well-known foods at standard portions. "ביצה קשה" or "תפוח בינוני" — answer from priors.
- **Do search** when the meal description includes:
  - A specific brand or product (e.g. "במבה אסם", "קוטג' תנובה 5%", "שלוק שוקו יוטבתה")
  - A specific restaurant or chain (e.g. "המבורגר במוזס", "סלט בלנדר ירוק")
  - A packaged product with a likely-published nutritional label
  - Anything ambiguous where official data would materially change the estimate

The model is told: prefer Israeli sources for Israeli brands and chains (`tzameret.health.gov.il`, brand sites, `mizyatzranim.co.il`, official menus), and authoritative international sources (`fdc.nal.usda.gov`, `nutritionix.com`) for generic foods.

### Structured Output

The model returns a single JSON object with this schema. The `breakdown` array is the heart of the response: meals are decomposed into editable components, each with its own portion (when meaningful) and confidence.

```json
{
  "calories": 350,
  "confidence": "high",
  "searched": false,
  "sources": [],
  "reasoning_he": "חביתה משתי ביצים (~150) + פרוסת לחם פרוס (~80) + כפית חמאה (~35) + 100 גרם קוטג' 5% (~85).",
  "assumptions_he": [
    "טיגון בכפית חמאה",
    "פרוסת לחם פרוס סטנדרטית (~30 גרם)"
  ],
  "breakdown": [
    {
      "item_he": "חביתה משתי ביצים",
      "item_en": "two-egg omelette",
      "calories": 150,
      "portion_grams": 100,
      "confidence": "high"
    },
    {
      "item_he": "פרוסת לחם",
      "item_en": "slice of bread",
      "calories": 80,
      "portion_grams": 30,
      "confidence": "high"
    },
    {
      "item_he": "חמאה לטיגון",
      "item_en": "butter for frying",
      "calories": 35,
      "portion_grams": 5,
      "confidence": "medium"
    },
    {
      "item_he": "קוטג' 5%",
      "item_en": "cottage cheese 5%",
      "calories": 85,
      "portion_grams": 100,
      "confidence": "high"
    }
  ],
  "needs_clarification_he": null,
  "food_category": "meal"
}
```

#### Field reference

| Field | Type | Required | Description |
|---|---|---|---|
| `calories` | integer | yes | Total kcal for the entire meal. Must equal the sum of `breakdown[].calories`. |
| `confidence` | enum | yes | `"low"` / `"medium"` / `"high"`. Overall confidence; drives the ⚠️ icon. |
| `searched` | boolean | yes | `true` if the model invoked `web_search`. Drives the 🔗 icon. |
| `sources` | string[] | yes | URLs relied on. Empty array when `searched: false`. |
| `reasoning_he` | string | yes | Short Hebrew explanation, 1–2 sentences. Shown when user taps ⓘ. |
| `assumptions_he` | string[] | yes | Discrete, fixable assumptions. Empty array if none. |
| `breakdown` | array | yes | Per-component decomposition. See sub-schema below. Items must sum to `calories`. |
| `needs_clarification_he` | string \| null | yes | If `confidence: "low"`, a Hebrew follow-up question. Null otherwise. |
| `food_category` | enum | yes | `"meal"` / `"snack"` / `"drink"` / `"dessert"`. Captured for future analytics. |

#### `breakdown[]` sub-schema

| Field | Type | Required | Description |
|---|---|---|---|
| `item_he` | string | yes | Hebrew component name as it would naturally appear in a meal log. |
| `item_en` | string | yes | English canonical name. Used as a stable key for future analytics (e.g. "how often do I eat rice?"). Lowercase, no leading article. |
| `calories` | integer | yes | kcal for this component. |
| `portion_grams` | integer \| null | yes | Grams when meaningful and estimable. Null for things like "כוס יין" or "תפוח" where grams aren't the natural unit. |
| `confidence` | enum | yes | Per-component confidence. The overall `confidence` is the minimum across components, but per-item lets the UI flag specific weak links. |

The decomposition rule: **break the meal into the components a human would naturally name when describing it.** "אורז עם בולונז" → `["rice", "bolognese sauce"]`. "חביתה מגבינה" → one item (it's a single dish), not separated into eggs + cheese. Cooking aids that materially affect calories (oil, butter) get their own line; trivial seasonings (salt, pepper, herbs) don't.

#### Confidence guide (in the prompt)

- **high** — well-known food at a clear portion, OR official source found via web search.
- **medium** — reasonable estimate with one or two assumptions.
- **low** — vague description, multiple assumptions, or conflicting sources. Always populate `needs_clarification_he` when confidence is low.

#### UI behavior

- Calorie number always prominent.
- ⓘ tap → bottom sheet with three sections:
  1. **Breakdown** — list of components with name, calories, and grams (when present). **Each row is tappable to edit.** See "Editable Breakdown" below.
  2. **Reasoning** — the `reasoning_he` string.
  3. **Assumptions** — the `assumptions_he` list.
- 🔗 icon when `searched: true` — tap → sources list (clickable URLs).
- ⚠️ icon when `confidence: "low"` — tap → shows `needs_clarification_he` plus a "Refine" button (v2: re-submits with the user's clarification).

#### Editable Breakdown (FR-17)

Portion estimation is where the model is most often wrong. Letting the user fix a single component instead of rejecting the whole estimate is a v1 must-have.

Interaction:
1. User taps a breakdown row (e.g. "אורז לבן — 220 kcal, 150g").
2. Bottom sheet shows: item name (read-only), grams input (number), calories (auto-recalculated as `original_calories × new_grams / original_grams`).
3. User adjusts grams; calories update live in the sheet.
4. Save → the row updates; the meal's top-level `calories` is recomputed as the sum of breakdown items; `caloriesSource` flips to `"MANUAL_BREAKDOWN_EDIT"`.

Edge cases:
- If `portion_grams` is null (e.g. "תפוח", "כוס יין"), the row shows a direct calorie input instead of a grams input.
- Linear scaling (`calories = original × grams / original_grams`) is a simplification — it's wrong for e.g. fried foods where doubling the portion doesn't quite double the absorbed oil. Acceptable approximation for v1; it's still more accurate than no adjustment.
- Deleting a breakdown row is allowed (long-press → delete). Sum recomputes. Useful if the model included something you didn't actually eat ("I didn't have the butter").

### System Prompt

```
You are a calorie estimation assistant for an Israeli user logging meals in Hebrew.
For each meal description, return your best estimate of total calories as a structured JSON object,
decomposed into the components a human would naturally name.

ESTIMATION PRINCIPLES:
1. Default to your own knowledge for generic foods at standard portions. Do NOT search for items like "תפוח", "ביצה", "סלט ירקות", "כוס קפה שחור".
2. Use the web_search tool when the description names:
   - A specific Israeli brand or packaged product (Tnuva, Strauss, Osem, Elite, Yotvata, etc.)
   - A specific restaurant, chain, or menu item (Moses, Greg, Aroma, McDonald's IL, etc.)
   - A product where the official nutritional label would change your estimate by more than ~15%.
3. When you search, prefer these sources:
   - Israeli: tzameret.health.gov.il, official brand .co.il sites, official restaurant menus.
   - Generic: fdc.nal.usda.gov, nutritionix.com.
   Avoid: random blogs, forum posts, weight-loss sites without official nutritional data.
4. Assume typical Israeli portion sizes unless specified:
   - "פיתה" → standard ~70g pita
   - "כוס" of a beverage → ~200ml
   - "פרוסת לחם" → ~30g
   - "כף" → ~15g, "כפית" → ~5g
   - "מנת" of a restaurant dish → standard menu portion
5. If the description is too vague to estimate within ±25%, still return your best midpoint guess and set confidence to "low".

BREAKDOWN RULES:
6. Decompose the meal into the components a human would naturally name when describing it.
   - "אורז עם בולונז" → ["white rice", "bolognese sauce"]
   - "חביתה מגבינה" → one item (it's a single dish, not eggs + cheese)
   - "כריך טונה" → ["bread", "tuna salad"] (the spread is the meaningful component)
7. Cooking aids that materially affect calories (oil, butter, mayo) get their own line.
8. Trivial seasonings (salt, pepper, herbs, lemon juice) do NOT get their own line.
9. For each component, provide both Hebrew (item_he) and English (item_en) names.
   - item_en is lowercase, no leading article, canonical English (e.g. "white rice" not "the rice").
10. portion_grams: include when grams are the natural unit (rice, sauce, meat, bread). Use null when they aren't (a glass of wine, an apple, a cup of coffee).
11. Per-component confidence: how sure are you about THIS specific item's calories and portion?
12. The breakdown items MUST sum exactly to the top-level "calories". Round each item independently, then sum and assign that sum to "calories".

OUTPUT FORMAT:
Respond with ONLY a single valid JSON object. No prose before or after. No markdown code fences.

Schema:
{
  "calories": <integer, total kcal>,
  "confidence": "low" | "medium" | "high",
  "searched": <boolean>,
  "sources": [<string urls>],
  "reasoning_he": "<short Hebrew explanation, 1-2 sentences>",
  "assumptions_he": [<list of discrete Hebrew assumptions; empty array if none>],
  "breakdown": [
    {
      "item_he": "<Hebrew component name>",
      "item_en": "<English canonical name, lowercase>",
      "calories": <integer>,
      "portion_grams": <integer or null>,
      "confidence": "low" | "medium" | "high"
    }
  ],
  "needs_clarification_he": <Hebrew follow-up question if overall confidence is "low", else null>,
  "food_category": "meal" | "snack" | "drink" | "dessert"
}

CONFIDENCE GUIDE:
- "high": well-known food at clear portion, OR official source found.
- "medium": reasonable estimate with one or two assumptions.
- "low": vague description or multiple assumptions. ALWAYS populate needs_clarification_he in this case.
- Overall "confidence" should be the minimum across breakdown items (a meal is only as confident as its weakest component).

EXAMPLES:

Input: "אורז עם בולונז"
Output:
{
  "calories": 500,
  "confidence": "medium",
  "searched": false,
  "sources": [],
  "reasoning_he": "מנת אורז לבן מבושל סטנדרטית (~150 גרם, 220 קק\"ל) עם רוטב בולונז ביתי (~120 גרם, 280 קק\"ל).",
  "assumptions_he": ["מנת אורז סטנדרטית של 150 גרם", "רוטב בולונז ביתי, לא ממותק במיוחד"],
  "breakdown": [
    {
      "item_he": "אורז לבן מבושל",
      "item_en": "cooked white rice",
      "calories": 220,
      "portion_grams": 150,
      "confidence": "high"
    },
    {
      "item_he": "רוטב בולונז",
      "item_en": "bolognese sauce",
      "calories": 280,
      "portion_grams": 120,
      "confidence": "medium"
    }
  ],
  "needs_clarification_he": null,
  "food_category": "meal"
}

Input: "במבה"
Output:
{
  "calories": 130,
  "confidence": "medium",
  "searched": true,
  "sources": ["https://osem.co.il/..."],
  "reasoning_he": "שקית במבה אסם סטנדרטית של 25 גרם מכילה כ-130 קק\"ל לפי התווית.",
  "assumptions_he": ["שקית סטנדרטית של 25 גרם"],
  "breakdown": [
    {
      "item_he": "במבה אסם",
      "item_en": "bamba peanut snack",
      "calories": 130,
      "portion_grams": 25,
      "confidence": "high"
    }
  ],
  "needs_clarification_he": null,
  "food_category": "snack"
}

Input: "כוס יין אדום"
Output:
{
  "calories": 125,
  "confidence": "high",
  "searched": false,
  "sources": [],
  "reasoning_he": "כוס יין אדום סטנדרטית (~150 מ\"ל) כ-125 קק\"ל.",
  "assumptions_he": ["כוס סטנדרטית של 150 מ\"ל"],
  "breakdown": [
    {
      "item_he": "יין אדום",
      "item_en": "red wine",
      "calories": 125,
      "portion_grams": null,
      "confidence": "high"
    }
  ],
  "needs_clarification_he": null,
  "food_category": "drink"
}

Input: "אכלתי משהו במסעדה"
Output:
{
  "calories": 600,
  "confidence": "low",
  "searched": false,
  "sources": [],
  "reasoning_he": "תיאור עמום מדי. השתמשתי בהערכה ממוצעת של ארוחה במסעדה.",
  "assumptions_he": ["ארוחה ממוצעת במסעדה ישראלית"],
  "breakdown": [
    {
      "item_he": "ארוחה לא מזוהה",
      "item_en": "unspecified meal",
      "calories": 600,
      "portion_grams": null,
      "confidence": "low"
    }
  ],
  "needs_clarification_he": "מה בדיוק אכלת? למשל: סוג המנה, האם היו תוספות, גודל המנה.",
  "food_category": "meal"
}
```

#### Reliability notes

- **Response prefill:** to force valid JSON, the API call uses a `{` prefill in the assistant turn. This locks output to JSON from token one and eliminates ~95% of "model wrote a preamble" failures.
- **JSON parse retry:** on parse failure, retry once. On a second failure, surface the entry with `calories: null` and let the user enter manually — don't loop infinitely.
- **Schema validation:** after parsing, validate with Zod (or similar) before writing to Firestore. Reject malformed responses rather than persisting garbage.
- **Sum check:** if `sum(breakdown[].calories) !== calories`, trust the top-level `calories` (model is told to round it correctly) but log the mismatch for debugging.

### API Call Shape (Node/TypeScript)

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Zod schema mirrors the prompt's output schema
const BreakdownItemSchema = z.object({
  item_he: z.string(),
  item_en: z.string(),
  calories: z.number().int().min(0),
  portion_grams: z.number().int().min(0).nullable(),
  confidence: z.enum(["low", "medium", "high"]),
});

const EstimateSchema = z.object({
  calories: z.number().int().min(0).max(5000),
  confidence: z.enum(["low", "medium", "high"]),
  searched: z.boolean(),
  sources: z.array(z.string().url()),
  reasoning_he: z.string(),
  assumptions_he: z.array(z.string()),
  breakdown: z.array(BreakdownItemSchema).min(1),
  needs_clarification_he: z.string().nullable(),
  food_category: z.enum(["meal", "snack", "drink", "dessert"]),
});

export async function estimateCalories(mealText: string) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 3,
        allowed_domains: [
          "tzameret.health.gov.il",
          "fdc.nal.usda.gov",
          "nutritionix.com",
          "tnuva.co.il",
          "strauss-group.com",
          "osem.co.il",
          "elite.co.il",
          // expand as you encounter brands/chains
        ],
        user_location: { type: "approximate", country: "IL" },
      },
    ],
    messages: [
      { role: "user", content: mealText },
      // Prefill forces JSON from token one
      { role: "assistant", content: "{" },
    ],
  });

  // Reassemble JSON from prefill + model output
  const modelText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const raw = "{" + modelText;
  const parsed = JSON.parse(raw);
  const validated = EstimateSchema.parse(parsed);

  // Cross-check: breakdown sum should match total (within 1 kcal rounding)
  const breakdownSum = validated.breakdown.reduce(
    (s, item) => s + item.calories,
    0
  );
  if (Math.abs(breakdownSum - validated.calories) > 1) {
    console.warn("Calorie mismatch", {
      total: validated.calories,
      breakdownSum,
      mealText,
    });
  }

  return validated;
}
```

### Cost Estimate (per meal entry)

Numbers based on current Claude API pricing (Sonnet 4.6: $3/MTok input, $15/MTok output; web search: $10 / 1,000 searches).

| Scenario | Input tokens | Output tokens | Searches | Cost |
|---|---|---|---|---|
| No search (generic food) | ~600 | ~200 | 0 | ~$0.005 |
| 1 search (branded/restaurant) | ~3,500 | ~250 | 1 | ~$0.024 |
| 3 searches (ambiguous, multi-source) | ~8,000 | ~300 | 3 | ~$0.059 |

At ~10 meals/day with ~30% triggering a search, expected cost is **~$2–4/month**. Acceptable for a pet project; well under typical SaaS subscriptions.

To keep costs predictable:
- Set `max_uses: 3` on the search tool (hard ceiling).
- Don't pass conversation history — each meal is a one-shot call (no `messages` accumulation).
- Cache common foods locally: if the exact same Hebrew text was estimated in the last 30 days, reuse that result and skip the API call entirely. This alone probably cuts 30–40% of calls.

### Caching Strategy

A Firestore collection `estimationCache` keyed by normalized Hebrew text.

```
/users/{uid}/estimationCache/{normalizedText}
  calories: number
  confidence: string
  reasoningHe: string
  assumptionsHe: string[]
  sources: string[]
  hitCount: number
  lastUsedAt: timestamp
  createdAt: timestamp
```

Using the normalized text as the document ID makes lookups O(1) — a single `getDoc` call.

On new meal entry:
1. Normalize text (trim, collapse whitespace, lowercase). Use as doc ID.
2. `getDoc` on `/users/{uid}/estimationCache/{normalizedText}`. If found and < 30 days old → use cached result, increment `hitCount`, mark entry as `caloriesSource: AI_CACHED`.
3. Otherwise → call Claude API via `/api/estimate`, store result in cache, return.

User can still manually override on any entry.

### Failure Modes & Handling

| Failure | Handling |
|---|---|
| API timeout (> 15s) | Show entry with "..." calories; user can retry or enter manually |
| API returns invalid JSON | Retry once with a `response prefill` of `{` to force JSON. If still bad, mark entry as needing manual input |
| Web search rate-limited (`max_uses_exceeded`) | Model continues without search; result will likely have `confidence: "low"`. Surface the warning icon |
| Model returns suspiciously low/high value (< 10 or > 3000 kcal) | Flag for manual review with ⚠️; don't auto-reject — could be a legitimate big meal |
| Hebrew text is actually English or mixed | Model handles fine; no special path needed |

### Open Questions for the Estimation Layer

- **Restaurant menus drift.** Nutritional info from a chain's site may be stale or vary by branch. Worth surfacing the source URL so I can sanity-check.
- **"Estimate from photo"** is an obvious v2 — Sonnet 4.6 is multimodal, so the same endpoint could accept an image. Not in v1 scope.
- **Personalized portion learning.** Over time, if I always say "כריך" and mean my specific lunch sandwich (~450 kcal), the cache helps but doesn't generalize. v2 idea: a "my usual" library.

---

**Audience:** mixed | **Type:** prd