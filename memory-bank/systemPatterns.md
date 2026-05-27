# System Patterns

## Architecture

```
Browser
  ├── Firebase Auth (Google sign-in)
  ├── Firestore SDK → meals, weights, settings, estimationCache
  └── Next.js (Vercel)
        ├── Pages: /, /day/[date], /weight, /settings
        └── POST /api/estimate → Anthropic (Sonnet 4.6 + web_search)
```

**Principle:** Only the estimate route is server-side. Everything else is client → Firestore with security rules.

## Data model (Firestore)

All data under `/users/{uid}/`:

| Collection | Key fields |
|------------|------------|
| `users/{uid}` | `dailyCalorieTarget`, `email`, `createdAt` |
| `meals/{mealId}` | `date`, `slot`, `text`, `calories`, `caloriesSource`, `breakdown[]`, confidence metadata |
| `weights/{date}` | **Doc ID = `YYYY-MM-DD`**, `weightKg` (1 decimal) |
| `estimationCache/{normalizedText}` | **Doc ID = normalized text**, cache fields, `hitCount` |

**Meal slots:** `BREAKFAST` | `LUNCH` | `DINNER` | `SNACK`

**caloriesSource:** `AI` | `AI_CACHED` | `MANUAL` | `MANUAL_BREAKDOWN_EDIT`

### Breakdown item (persisted)

Each component stores: `itemHe`, `itemEn`, `calories`, `portionGrams`, `confidence`, `originalCalories`, `originalPortionGrams`, `edited`.

**Editable breakdown:** calories scale linearly: `newCal = originalCalories × newGrams / originalPortionGrams`. If `portionGrams` is null, edit calories directly. Meal total = sum of breakdown; recompute on edit/delete row.

### Indexes

- Meals: composite `(date, slot)`
- Weights: `date` descending for graph queries

## Security rules

```javascript
match /users/{uid}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

Test in Firebase Rules Playground before deploy.

## Calorie estimation pipeline

1. **Normalize** text (trim, collapse whitespace, lowercase) → cache doc ID
2. **Cache hit** (&lt;30 days) → `AI_CACHED`, skip API
3. **Else** → `POST /api/estimate`:
   - Model: `claude-sonnet-4-6`
   - Tool: `web_search_20260209`, `max_uses: 3`
   - Response prefill `{` on assistant turn → parse JSON
   - Zod validate → sum-check breakdown
   - Retry parse once on failure; then manual entry path
4. Write meal + update cache

## Date & timezone

- Store dates as strings `YYYY-MM-DD` in Asia/Jerusalem
- Compute "today" and date boundaries in **server utilities** or route handlers — not from `new Date()` on client for persistence logic

## UI patterns

- **shadcn/ui** + **Tailwind** for primitives
- **Recharts** for weight graph
- **Optimistic updates** for meal rows; spinner/`...` while estimating
- **Bottom sheets** for meal input, weight log, breakdown detail
- **Real-time listeners** on Firestore for today view (no manual refetch after save)

## Failure handling

| Case | UX |
|------|-----|
| LLM timeout (&gt;15s) | Keep row; retry or manual calories |
| Invalid JSON | Retry once; then manual |
| Low confidence | ⚠️ icon → `needsClarificationHe` |
| Searched | 🔗 icon → sources list |
