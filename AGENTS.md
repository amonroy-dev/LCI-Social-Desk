# AGENTS.md

## Cursor Cloud specific instructions

This is a single Next.js 15 (App Router) + TypeScript application. No monorepo, no Docker, no databases required.

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `SESSION_SECRET=dev-secret npm run dev` |
| Lint | `npm run lint` |
| Type-check | `npm run typecheck` |
| Build | `SESSION_SECRET=dev-secret npm run build` |

### Key notes

- **Demo mode**: When Firebase env vars are absent, the app auto-enables demo sign-in. Use email `demo@example.com` on the `/sign-in` page to authenticate without any external services.
- **SESSION_SECRET**: The dev server requires this env var set (any non-empty string works for local dev). Without it the session cookie signing will fail.
- **In-memory storage**: All data (drafts, connections, invites, audit logs) lives in-memory. Restarting the dev server resets all state.
- **No external services needed**: Firebase Auth, Firestore, and Meta OAuth all have graceful fallbacks/stubs when their env vars are not configured.
- **Dev server port**: Defaults to `localhost:3000`.
