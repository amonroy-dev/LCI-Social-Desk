# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js 15 (App Router) + TypeScript application. No monorepo, no Docker, no databases required.

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type-check | `npm run typecheck` |
| Build | `npm run build` |

### Key notes

- **Auth mode**: Firebase Google auth is configured via environment secrets. When `NEXT_PUBLIC_FIREBASE_*` vars are set, real Google sign-in is active and demo mode is disabled. If secrets are absent, demo mode auto-enables as fallback (use `demo@example.com` on `/sign-in`).
- **Environment secrets**: `SESSION_SECRET`, `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_*`, and `AGENCY_OWNERS` are injected via Cursor Cloud secrets. The dev server requires at minimum `SESSION_SECRET` to be set.
- **In-memory storage**: All data (drafts, connections, invites, audit logs) lives in-memory. Restarting the dev server resets all state.
- **No external services needed locally**: Firestore and Meta OAuth have graceful stubs. Firebase Auth requires the secrets to be set for real Google sign-in but the app works in demo mode without them.
- **Dev server port**: Defaults to `localhost:3000`.
