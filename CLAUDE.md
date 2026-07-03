## Architecture

Turborepo monorepo. Two apps, six packages:

```
apps/
  api/        Next.js full-stack app (port 3001) — auth, tRPC, admin UI
  web/        Next.js public frontend (port 3000)
packages/
  admin/      Built-in admin features (users, roles, settings, invitations, auth pages, nav)
  crud/       CRUD builder: JSON config → Zod + tRPC router + React components
  db/         Prisma schema + generated client + seed
  auth/       NextAuth config factory, session types, Prisma adapter (no @repo/db dependency)
  ui/         shadcn/ui component library (re-exported from packages/ui)
  email/      Transactional email service/providers
  tsconfig/   Shared tsconfig bases
```

### @repo/admin — subpath exports

- `@repo/admin` — Types, built-in CRUD configs (`UserCRUD`, `createRoleCRUD`)
- `@repo/admin/server` — `createAdminRouter`, `createPrismaAdapter`, router factories, `derivePermissionOptions`, layout helpers
- `@repo/admin/ui` — `AdminProvider`, `AdminNav`, `CRUDResourceClient`, `InviteUserModal`, `CreateUserModal`, `ThemeProvider`, auth forms
- `@repo/admin/settings` — `buildSettingsRegistry`, `DEFAULT_SETTINGS`

### @repo/auth — adapter pattern

`packages/auth` exports factories (`createAuthOptions`, `createGetServerAuthSession`) that accept a db adapter and password hasher. No dependency on `@repo/db` or `bcryptjs`. Apps wire these in `apps/api/src/lib/auth.ts`.

Key files:
- `apps/api/src/server/router.ts` — root tRPC router, all admin sub-routers wired here
- `apps/api/src/crud/*.ts` — per-resource CRUD configs (thin re-exports from `@repo/admin` for built-ins)
- `packages/crud/src/router-factory.ts` — generates tRPC list/create/update/delete procedures
- `packages/crud/src/components/CRUDPage.tsx` — main admin table+form+modal component
- `packages/admin/src/ui/CRUDResourceClient.tsx` — tRPC hooks → CRUDPage bridge
- `packages/admin/src/server/routers/*.ts` — built-in admin router factories
- `apps/api/prisma/schema.prisma` — database schema
- `apps/api/src/proxy.ts` — Next proxy for auth route matching and login rate limiting
- `apps/web/src/app/*` — public frontend routes

## Testing

Run tests with:

```bash
pnpm --filter crud test          # Vitest unit tests
pnpm --filter crud test --watch  # watch mode
```

Test files live in `packages/crud/src/__tests__/`. Framework: Vitest + @testing-library/react. Coverage focuses on CRUDPage component behavior (error banner, form visibility, table rendering).

No tests for tRPC routers or Next.js pages — those are verified by the build check below.

**Never remove failing tests.** Fix the underlying issue instead (add Radix providers, polyfill browser APIs, fix React version mismatches, etc.). Remove a test only if the feature itself is being removed from the codebase.

## Security rules

- **Password fields**: Never add password-type fields to `searchableFields` in CRUD configs. `router-factory.ts` exposes searchable fields to queries — passwords must never be searchable.
- **Password hashing**: The `createUserRouter` in `@repo/admin/server` handles hashing via the injected `passwordHasher`. When overriding, hash on BOTH create and update.
- **Role assignment guard**: Before writing `roleId`, always check `targetRole.protected`. Block unless caller `isProtectedRole`. Prevents privilege escalation via assign-role.
- **CORS Vary header**: Dynamic `Access-Control-Allow-Origin` (per-origin allowlist) requires `Vary: Origin` on every response. Without it, CDNs serve one origin's cached headers to others. Check the active request interception layer before editing CORS behavior; this repo currently uses `apps/api/src/proxy.ts` for Next proxy logic.
- **Web validation messages**: Public web UI must render human-readable validation errors. Do not show raw Zod/tRPC issue arrays, JSON, stack traces, or machine codes to users.
- **Schema ownership**: Never edit `apps/api/prisma/schema.prisma` manually. All model creation and updates go through `pnpm crud:scaffold <model>`. Scaffold derives the Prisma model from the CRUD config, patches back-relations, and runs `prisma migrate dev` automatically.
- **Migration tool**: Always use `prisma migrate dev` (via scaffold or `pnpm --filter @repo/db db:migrate`). Never use `db:push` — it creates schema drift with no migration file, breaking future `migrate dev` with checksum/drift errors.
- **Explicit join models**: Many-to-many relations must use explicit join models — set `through` in the relation config (e.g. `{ field: "tags", model: "tag", through: "blogTag" }`). Prisma implicit m2m auto-generates `_ModelToModel` with `A`/`B` columns; explicit generates `blog_tags(blog_id, tag_id)` matching the project snake_case convention.

## Conventions

- **CRUD configs**: One file per resource at `apps/api/src/crud/<model>.ts`. camelCase filename. Export as `export const ProductCRUD = defineCRUD({...})`. Built-in configs (user, role) are re-exports from `@repo/admin`.
- **Adding a resource**: (1) write config in `apps/api/src/crud/<model>.ts`, (2) `pnpm crud:scaffold <model>`. Scaffold generates the Prisma model, patches back-relations, and runs `prisma migrate dev` automatically. Nav link, tRPC procedures, admin page, and permissions are all automatic (permissions are derived at runtime via `derivePermissionOptions`).
- **Components**: PascalCase. Co-locate with the page they serve. Shared UI components go in `packages/ui/src/components/`.
- **Server logic**: Built-in admin routers live in `@repo/admin/server` as factories. App-specific overrides and wiring in `apps/api/src/server/`. Client-only components (hooks, state) in `apps/api/src/app/`.
- **Admin UI components**: Built-in UI (nav, settings, CRUD bridge, modals, auth forms) lives in `@repo/admin/ui`. App files are thin re-exports. The `AdminProvider` wraps the app's tRPC client so package components access it via `useAdminApi()`.
- **Prisma raw SQL**: Tables and columns are snake_case (`users`, `roles`, `role_id`, `created_at`). The Prisma schema uses camelCase — translate when writing raw queries.

## After implementing any feature

After completing any feature implementation, always run the test suite and type check before reporting done:

```bash
pnpm --filter crud test    # Run CRUD package tests
pnpm type-check            # Run type checking across all packages
```

Fix any failures before stopping. Do not skip this step — `pnpm dev` compiles lazily and will miss type errors.

Then run the build check:

```bash
rsync -a --delete --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='pnpm-lock.yaml' --exclude='.env' --exclude='apps/web' --filter='+ apps/api/src/crud/example.ts' --filter='- apps/api/src/crud/*' --filter='- apps/api/prisma/' ~/work/utils/quantyx/ ~/work/utils/test-project/
cd ~/work/utils/test-project && pnpm --filter api build
```

A clean build (`✓ Compiled successfully`) is the minimum bar. If it fails, fix it before stopping. Do not skip this step — `pnpm dev` compiles lazily and will miss type errors and route mismatches.

After any QA session that starts a dev server, kill all app ports when done:

```bash
lsof -ti :3000 :3001 | xargs kill -9 2>/dev/null || true
```

Ports: `3000` = `apps/web` (frontend), `3001` = `apps/api` (backend/admin).

## Agent guidance

- Prefer `AGENTS.md` as the cross-agent entrypoint; keep this file and `AGENTS.md` aligned when repo workflows change.
- Local skills are installed under `.agents/skills/` and tracked in `skills-lock.json`. Use only skills that exist locally or are exposed by the active agent runtime.
- Relevant local skills in this repo include:
  - `frontend-design` for new or redesigned web UI
  - `web-design-guidelines` for UI/UX/accessibility audits
  - `vercel-react-best-practices` for React/Next.js performance review
  - `vercel-composition-patterns` for reusable React component APIs
  - `vercel-react-view-transitions` for view transition work
  - `vercel-optimize` for Vercel cost/performance investigations
  - `cavecrew` for compressed subagent delegation when available
  - `caveman-review` and `caveman-commit` for terse reviews/commit messages when requested
- If an instruction references a missing skill or unavailable tool, fall back to the documented commands and explain the gap briefly.

## gstack

Use `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available skills:
- /office-hours
- /plan-ceo-review
- /plan-eng-review
- /plan-design-review
- /design-consultation
- /design-shotgun
- /design-html
- /review
- /ship
- /land-and-deploy
- /canary
- /benchmark
- /browse
- /connect-chrome
- /qa
- /qa-only
- /design-review
- /setup-browser-cookies
- /setup-deploy
- /setup-gbrain
- /retro
- /investigate
- /document-release
- /document-generate
- /codex
- /cso
- /autoplan
- /plan-devex-review
- /devex-review
- /careful
- /freeze
- /guard
- /unfreeze
- /gstack-upgrade
- /learn
