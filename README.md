# LCI Social Desk

> Internal social publishing dashboard for agency teams managing
> ~10–20 client accounts across Facebook and Instagram (LinkedIn deferred).

LCI Social Desk is a private agency workspace for composing, previewing,
scheduling, and (eventually) publishing social content for client accounts.
It is **not** a public SaaS product, marketing site, or generic admin
template — it's a serious internal tool.

## Current scope

- **Composer** at `/dashboard/publishing/new` — client switcher, network
  toggles (Facebook + Instagram), caption editor, media uploader,
  collapsible First Comment / Workflows / Tags panels, live preview cards,
  sticky Save Draft / Schedule / Post Now action bar.
- **Authentication** for agency team members via Firebase (Google) with a
  signed HTTP-only session cookie and Edge-runtime middleware route
  protection. A clearly-labeled demo sign-in keeps the app usable when
  Firebase isn't configured yet.
- **Role model** (`owner` / `admin` / `member`) bootstrapped from env-var
  allowlists until `agencyMembers` is wired to Firestore.
- **Client invite flow**: agency users mint signed, expiring invite tokens
  from `/dashboard/clients/<id>/connections`. Clients open `/connect/<token>`
  on a public, branded page that does **not** require a dashboard account.
- **Meta OAuth scaffolding** at `/api/oauth/meta/start` and
  `/api/oauth/meta/callback`. Connects Facebook Pages and Instagram
  Business/Professional accounts through a single Meta authorization. Falls
  back to a labeled simulated exchange if `META_APP_ID` / `META_APP_SECRET`
  aren't configured.
- **Dashboard connection management** at
  `/dashboard/clients/<id>/connections` with per-network status, last
  updated, who connected, scopes, publishing-ready badge, reconnect, and a
  disconnect placeholder gated by role.
- **Audit log** stub (`auditLogs`) recording sign-in, invite create/open,
  connection start/complete/revoke, draft save/schedule/publish.

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 3 + shadcn/ui-style primitives on Radix
- lucide-react icons
- Firebase Auth (browser) + Firebase Admin (server, for ID-token verification)
- Web Crypto for all HMAC signing (sessions, invites, OAuth state) — works
  on the Edge runtime so middleware doesn't pull in firebase-admin.

## Routes

### Internal (agency, gated by middleware)

| Path | Purpose |
| --- | --- |
| `/dashboard` | Workspace overview |
| `/dashboard/publishing/new` | New Draft composer |
| `/dashboard/clients` | Client roster + connection status |
| `/dashboard/clients/[clientId]/connections` | Per-client connection management + invite generator |
| `/dashboard/calendar`, `/dashboard/media`, `/dashboard/analytics`, `/dashboard/settings` | Placeholders |

### Public

| Path | Purpose |
| --- | --- |
| `/sign-in` | Agency sign-in (Google + optional demo) |
| `/connect/[token]` | Client-facing secure connection page |
| `/api/auth/session` | `POST` create session from Firebase ID token or demo payload; `DELETE` clear |
| `/api/invites` | `POST` create invite (auth required); `GET` list |
| `/api/oauth/meta/start` | Begin Meta OAuth handoff for an invite token |
| `/api/oauth/meta/callback` | Exchange code, persist `socialConnections`, mark invite used |
| `/api/connections/[clientId]/[platform]` | `DELETE` revoke (admin+) |

## Required environment variables

Set these in Vercel Project Settings → Environment Variables.

### Always required for real auth and OAuth

```bash
# Session signing (HS256). Generate with `openssl rand -hex 32`.
SESSION_SECRET=

# Signing secret for invite tokens (falls back to SESSION_SECRET if unset).
INVITE_TOKEN_SECRET=

# Public base URL used for invite links (e.g. https://lci-social-desk.vercel.app).
NEXT_PUBLIC_APP_URL=
```

### Firebase Authentication

```bash
# Client SDK (NEXT_PUBLIC_ values are exposed to the browser by design).
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_APP_ID=1:000:web:abc
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

# Admin SDK service account (server only). FIREBASE_PRIVATE_KEY may contain
# literal "\n" sequences from a service-account JSON — they're auto-unescaped.
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Comma-separated allowlists used to bootstrap roles for known users until
# agencyMembers is wired to Firestore. Anyone signing in is `member` by default.
AGENCY_OWNERS=owner@youragency.com,partner@youragency.com
AGENCY_ADMINS=admin@youragency.com
```

### Meta (Facebook + Instagram) OAuth

```bash
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=https://lci-social-desk.vercel.app/api/oauth/meta/callback
META_SCOPES=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,business_management
META_STATE_SECRET=
```

### Optional

```bash
NEXT_PUBLIC_AUTH_MODE=firebase     # or "demo" to force-enable demo sign-in
NEXT_PUBLIC_SUPPORT_EMAIL=hello@lci.agency
```

If `NEXT_PUBLIC_AUTH_MODE` is unset, demo mode auto-enables only when the
`NEXT_PUBLIC_FIREBASE_*` vars are missing — so the moment you configure
Firebase in Vercel, the demo button disappears in production.

## What's real vs simulated

| Behavior | Real | Simulated |
| --- | --- | --- |
| Session cookies (HMAC) | ✅ | |
| Middleware route gating | ✅ | |
| Firebase ID-token verification | ✅ (when env vars set) | demo mode when not |
| Role lookup via `agencyMembers` (Firestore) | ✅ (when Firestore configured) | env allowlist fallback |
| Invite token signing + expiry + status | ✅ | |
| `clientInvites` storage | ✅ (Firestore) | in-memory fallback when Firestore unavailable |
| Meta OAuth `state` signing + verification | ✅ | |
| Meta code exchange + Page/IG enumeration | ✅ (when keys set) | clearly-labeled stub when not |
| `socialConnections` storage | ✅ (Firestore) | in-memory fallback |
| `auditLogs` writes | ✅ (Firestore, best-effort) | in-memory ring fallback |
| `clients` reads | ✅ (Firestore, with sample-data fallback) | sample data |
| `socialPosts` storage | | in-memory only (next milestone) |

Every Firestore-backed surface degrades gracefully to in-memory when the
admin SDK isn't configured — local dev and unconfigured Vercel previews
still work without errors.

## Firestore Security Rules

A starter ruleset lives at `firestore.rules`. The app reads/writes via the
Firebase Admin SDK on the server, which bypasses rules by design. The
rules in the file therefore deny-by-default for browser-side access — they
exist as defense in depth in case any UI ever queries Firestore directly.

Deploy with:

```bash
firebase deploy --only firestore:rules
```

## Project layout (additions)

```
src/
  middleware.ts                          # Edge gate for /dashboard
  lib/
    auth/
      session.ts                         # HMAC session cookie sign/verify
      server.ts                          # getCurrentSession / requireSession
      roles.ts                           # role rank + env-driven bootstrap
    firebase/
      config.ts                          # env-driven capability detection
      client.ts                          # Firebase JS init (lazy)
      admin.ts                           # Firebase Admin init (lazy)
    repositories/
      invite-repository.ts               # in-memory clientInvites
      connection-repository.ts           # in-memory socialConnections
    services/
      audit-service.ts
      invite-service.ts                  # token signing + lifecycle
      connection-service.ts
      meta-oauth.ts                      # auth URL + code exchange + state
  app/
    sign-in/page.tsx
    connect/
      layout.tsx
      [token]/page.tsx
    api/
      auth/session/route.ts
      invites/route.ts
      oauth/meta/start/route.ts
      oauth/meta/callback/route.ts
      connections/[clientId]/[platform]/route.ts
    dashboard/
      clients/[clientId]/connections/page.tsx
  features/
    auth/
      sign-in-form.tsx
      user-menu.tsx
    connect/
      connection-buttons.tsx
    connections/
      connection-status-card.tsx
      connections-view.tsx
      invite-generator.tsx
```

## Next best steps (in suggested order)

1. **Firestore swap.** Implement the same interfaces over Firestore for
   `invite-repository.ts`, `connection-repository.ts`, and a new
   `audit-repository.ts`. No call-site changes required.
2. **`users` / `agencyMembers` collection.** Replace
   `resolveRoleForEmail` with a Firestore lookup, and populate
   `agencyMembers` on first sign-in. Keep the env-driven allowlist as a
   bootstrap-time fallback for the very first owner.
3. **Email-link sign-in.** Optional second auth method using
   `sendSignInLinkToEmail` + `signInWithEmailLink` on top of the same
   session cookie pipeline.
4. **Meta App review.** Move scopes through Meta's app review for
   `pages_manage_posts` and `instagram_content_publish`. Test the real
   `/api/oauth/meta/callback` once approved.
5. **Connection refresh job.** Schedule a server task to refresh
   long-lived Meta tokens before `expiresAt` and flip the `status` to
   `expired` proactively.
6. **Re-enable LinkedIn** when ready: the type union and previews are
   already in place, just hidden from the composer toggles in this phase.
