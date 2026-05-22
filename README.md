# LCI Social Desk

> Internal social publishing dashboard for agency teams managing
> ~10–20 client accounts across Facebook, Instagram, and LinkedIn.

LCI Social Desk is a private, internal-use workspace for composing,
previewing, scheduling, and (eventually) publishing social content on behalf
of client accounts. It is **not** a public SaaS product, marketing site, or
generic admin template — it is a serious internal agency tool.

This repository contains the first core experience of the product: the
**New Draft** publishing workspace at `/dashboard/publishing/new`.

---

## Tech stack

- [Next.js 15](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS 3
- shadcn/ui-style primitives (built on Radix)
- [lucide-react](https://lucide.dev) icons

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:3000/dashboard/publishing/new](http://localhost:3000/dashboard/publishing/new).

The root route (`/`) redirects to the publishing workspace.

### Scripts

- `npm run dev` — start the dev server
- `npm run build` — build for production
- `npm run start` — run the production build
- `npm run lint` — Next.js lint
- `npm run typecheck` — TypeScript no-emit check

## Project layout

```
src/
  app/
    layout.tsx                # Root layout (fonts, metadata, body)
    page.tsx                  # Redirects to /dashboard/publishing/new
    globals.css               # Tailwind layers + design tokens
    dashboard/
      layout.tsx              # App shell (sidebar + main column)
      page.tsx                # Workspace overview placeholder
      publishing/
        page.tsx              # Redirects to /new
        new/page.tsx          # New Draft workspace (primary screen)
      clients/page.tsx        # Light placeholder
      calendar/page.tsx       # Light placeholder
      media/page.tsx          # Light placeholder
      analytics/page.tsx      # Light placeholder
      settings/page.tsx       # Light placeholder
  components/
    shell/                    # AppShell, Sidebar, TopBar
    ui/                       # shadcn-style primitives (Button, Card, …)
    network/                  # Original network glyphs (FB/IG/LI)
  features/
    publishing/
      publishing-workspace.tsx
      state.ts                # Composer reducer + useComposer hook
      components/
        client-switcher.tsx
        composer-card.tsx
        composer-toolbar.tsx
        media-uploader.tsx
        network-toggles.tsx
        first-comment-panel.tsx
        workflows-panel.tsx
        tags-panel.tsx
        preview-panel.tsx
        preview/
          preview-shared.tsx
          facebook-preview.tsx
          instagram-preview.tsx
          linkedin-preview.tsx
        schedule-dialog.tsx
        action-bar.tsx
        collapsible-panel.tsx
  lib/
    types.ts                  # Core domain types
    sample-data.ts            # Sample clients/connections/tags
    services/post-service.ts  # Stubbed save / schedule / publish
    utils.ts                  # cn, initialsOf, formatPreviewTimestamp
```

## Domain model

The app is designed so it can be wired to Firestore later with minimal
changes. The core entities live in `src/lib/types.ts`:

- `Client`
- `SocialConnection`
- `SocialPostDraft`
- `MediaAsset`
- `AuditLogEvent`
- `NetworkId`, `PostStatus`, `ContentTag`, `ScheduleState`

These map directly to the planned Firestore collections:

- `clients`
- `socialConnections`
- `socialPosts`
- `mediaAssets`
- `auditLogs`

### Stubbed behavior

- `src/lib/services/post-service.ts` simulates `saveDraft`, `schedulePost`,
  and `publishPost` with short artificial delays. Each returns a normalized
  `SocialPostDraft` plus an `AuditLogEvent`. Replace the bodies with
  Firestore reads/writes and the rest of the app should keep working.
- `MediaUploader` uses `URL.createObjectURL` so attachments preview locally
  without an upload pipeline.
- `publishPost` falls back to a `"simulated"` status unless the
  `NEXT_PUBLIC_ENABLE_PROVIDER_PUBLISH=true` env var is set, at which point
  it returns `"published"` so the action chain is exercised end-to-end.

## What is intentionally _not_ included in v1

- Authentication / SSO bootstrapping
- Multi-tenant onboarding
- A polished mobile-first redesign (desktop-first only)
- A complex approval engine
- A deep analytics dashboard
- Real provider publishing integrations
- AI Assist rewrites (UI is scaffolded; nothing is wired)

## Next best steps

1. Wire the `post-service` stubs to Firestore (`socialPosts`, `auditLogs`).
2. Replace `sample-data.ts` with live `clients` / `socialConnections`
   queries.
3. Move media uploads to Firebase Storage (or equivalent) and persist
   resulting `MediaAsset` entries to `mediaAssets`.
4. Add provider adapters per network (Facebook Graph, Instagram Graph,
   LinkedIn Marketing) behind a single `publishPost` interface.
5. Build the Calendar surface against the same `SocialPostDraft` data.
