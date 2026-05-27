# Tech Context

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| UI | React, Tailwind CSS, shadcn/ui |
| Charts | Recharts |
| Auth | Firebase Auth (Google sign-in preferred) |
| Database | Firestore (client SDK + security rules) |
| LLM | Anthropic Claude Sonnet 4.6 via `@anthropic-ai/sdk` |
| Validation | Zod (estimate response + API boundaries) |
| Hosting | Vercel |

## Environment variables (server)

```
ANTHROPIC_API_KEY=       # Server only — never NEXT_PUBLIC_
```

## Environment variables (client)

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Planned directory layout

```
app/
  page.tsx                 # Today (redirect or render today)
  day/[date]/page.tsx
  weight/page.tsx
  settings/page.tsx
  api/estimate/route.ts
components/
  meals/                   # slots, entry row, add sheet
  weight/                  # graph, log sheet, list
  layout/                  # bottom nav, day header
lib/
  firebase/                # client init, auth helpers
  firestore/               # typed collections, converters
  dates/                   # Asia/Jerusalem YYYY-MM-DD helpers
  estimation/              # normalize, cache lookup, types
  anthropic/               # estimateCalories, Zod schemas, SYSTEM_PROMPT
types/
firebase/
  firestore.rules
  firestore.indexes.json
public/
  manifest.json            # PWA (could)
```

## Performance targets (NFR)

- FCP &lt;1.5s on 4G
- LLM p95: &lt;4s no search, &lt;8s with search
- Prefer RSC where it helps; client components for Firestore listeners and interactive sheets

## Cost controls

- One-shot LLM calls (no conversation history)
- `max_uses: 3` on web search
- Firestore estimation cache (30-day reuse)
- `allowed_domains` on search tool for trusted sources

## Build plan (from PRD)

1. Scaffold + Firebase + Auth + rules
2. Today UI + estimate API E2E
3. Day nav + edit/delete + cache
4. Weight screen
5. Settings, polish, PWA, deploy
6. Week 2: daily use, prompt iteration
