# Diet Tracker

Personal meal and weight tracker: Hebrew free-text meals → AI calorie estimates, daily budget vs target, weight trend graph.

## Documentation

| Resource | Purpose |
|----------|---------|
| [`PRD.md`](./PRD.md) | Full product & technical specification |
| [`memory-bank/`](./memory-bank/) | Distilled context for AI agents (read before building) |
| [`.cursor/rules/`](./.cursor/rules/) | Cursor agent rules for this repo |

## Memory bank

Agents should read these in order when starting work:

1. `memory-bank/projectbrief.md` — goals and constraints
2. `memory-bank/productContext.md` — UX and user stories
3. `memory-bank/systemPatterns.md` — architecture and data model
4. `memory-bank/techContext.md` — stack and folder layout
5. `memory-bank/activeContext.md` — current focus
6. `memory-bank/progress.md` — what's done / next

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 — sign in with Google.

### Firebase setup

1. Open [Authentication](https://console.firebase.google.com/project/diet-tracker-249d4/authentication) for project `diet-tracker-249d4`
2. If you see **Get started**, click it — this initializes Auth (fixes `auth/configuration-not-found`)
3. **Sign-in method** → enable **Google** → Save
4. **Settings** → **Authorized domains** → ensure `localhost` is listed
5. Create a **Firestore** database (Build → Firestore)
3. Deploy security rules and indexes:

```bash
npm install -g firebase-tools
firebase login
firebase use diet-tracker-249d4
firebase deploy --only firestore:rules,firestore:indexes
```

If meal queries fail, follow the composite-index link in the browser console.

### Environment

Copy `.env.example` to `.env.local` and fill in Firebase + `ANTHROPIC_API_KEY`.

## Deploy (Vercel)

1. Import repo; set env vars from `.env.local`
2. Add production URL to Firebase **Authorized domains**

## Status

v1 implemented. See `memory-bank/progress.md`.
