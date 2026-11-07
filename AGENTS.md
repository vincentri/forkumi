# Quantyx Agent Guide

Single source of truth for all coding agents. `CLAUDE.md` only imports this file. `README.md` holds user-facing setup docs.

## Architecture

pnpm workspace monorepo. Two apps, eight packages:

```
apps/
  api/        Next.js full-stack app (port 3001) — auth, tRPC, admin UI
  web/        Next.js public frontend (port 3000)
packages/
  admin/      Built-in admin features (users, roles, settings, invitations, auth pages, nav, router factories)
  crud/       CRUD builder: JSON config → Zod + tRPC router + React components
  db/         Prisma client helpers, seed, default assets (schema lives at apps/api/prisma/schema.prisma)
  auth/       NextAuth config factory, session types, Prisma adapter (no @repo/db dependency)
  ui/         shadcn/ui component library
  email/      Transactional email service/providers
  e2e/        Playwright e2e suite + schema drift guard
  tsconfig/   Shared tsconfig bases
```

### @repo/admin — subpath exports

- `@repo/admin` — Types, built-in CRUD configs (`UserCRUD`, `createRoleCRUD`)
- `@repo/admin/server` — `createAdminRouter`, `createPrismaAdapter`, router factories, `derivePermissionOptions`, layout helpers
- `@repo/admin/ui` — `AdminProvider`, `AdminNav`, `CRUDResourceClient`, `InviteUserModal`, `CreateUserModal`, `ThemeProvider`, auth forms
- `@repo/admin/settings` — `buildSettingsRegistry`, `DEFAULT_SETTINGS`

### @repo/auth — adapter pattern

`packages/auth` exports factories (`createAuthOptions`, `createGetServerAuthSession`) that accept a db adapter and password hasher. No dependency on `@repo/db` or `bcryptjs`. Apps wire these in `apps/api/src/lib/auth.ts`.

### Key files

- `apps/api/src/server/router.ts` — root tRPC router; admin resource routers MUST be nested under `admin` (client accesses `api.admin.<model>`), `account` and `public` stay at root
- `apps/api/src/crud/*.ts` — per-resource CRUD configs (thin re-exports from `@repo/admin` for built-ins)
- `packages/crud/src/router-factory.ts` — generates tRPC list/create/update/delete procedures
- `packages/crud/src/components/CRUDPage.tsx` — main admin table+form+modal component
- `packages/admin/src/ui/CRUDResourceClient.tsx` — tRPC hooks → CRUDPage bridge
- `packages/admin/src/server/routers/*.ts` — built-in admin router factories
- `apps/api/prisma/schema.prisma` — database schema
- `apps/api/src/proxy.ts` — Next proxy: CORS, auth route matching, login rate limiting
- `apps/web/src/app/*` — public frontend routes

## Commands

- Install: `pnpm install`
- Dev, both apps: `pnpm dev` · admin/API only: `pnpm dev:api` · web only: `pnpm dev:web`
- Build: `pnpm build`
- Lint (oxlint): `pnpm lint` · auto-fix: `pnpm lint:fix`
- Format (oxfmt): `pnpm format` · check only: `pnpm format:check`
- Type check: `pnpm type-check`
- Unit tests (Vitest, all packages): `pnpm test` · one package: `pnpm --filter crud test` · watch: `pnpm --filter crud test --watch`
- E2E tests: `pnpm e2e` (needs Docker for the Postgres testcontainer)
- DB migrate for local dev: `pnpm db:migrate <name>` (non-interactive; name required when schema drift exists)
- DB seed: `pnpm db:seed`
- Reset local DB and seed: `pnpm dev:reset` (DESTRUCTIVE — wipes all data; never run on shared/staging/prod)
- For non-trivial column type changes (e.g. `String` → `DateTime`), edit the generated migration SQL in `apps/api/prisma/migrations/<ts>_<name>/migration.sql` to preserve data via explicit `USING` cast, then re-run `pnpm db:migrate <name>`.
- Create CRUD resource interactively: `pnpm crud:new`
- Scaffold CRUD resource from config: `pnpm crud:scaffold <model>`

## Conventions

- **Package boundaries**: Built-in admin behavior belongs in `packages/admin`; generic CRUD behavior in `packages/crud`; app-specific wiring in `apps/api/src`.
- **CRUD configs**: One file per resource at `apps/api/src/crud/<model>.ts`. camelCase filename. Export as `export const ProductCRUD = defineCRUD({...})`. Built-in configs (user, role) are re-exports from `@repo/admin`.
- **Adding a resource**: (1) write config in `apps/api/src/crud/<model>.ts`, (2) `pnpm crud:scaffold <model>`. Scaffold generates the Prisma model, patches back-relations, and runs `prisma migrate dev` automatically. Nav link, tRPC procedures, admin page, and permissions are all automatic (permissions are derived at runtime via `derivePermissionOptions`).
- **Components**: PascalCase. Co-locate with the page they serve. Shared UI components go in `packages/ui/src/components/` and are re-exported from `packages/ui/src/index.ts`.
- **Server logic**: Built-in admin routers live in `@repo/admin/server` as factories. App-specific overrides and wiring in `apps/api/src/server/`. Client-only components (hooks, state) in `apps/api/src/app/`.
- **Admin UI components**: Built-in UI (nav, settings, CRUD bridge, modals, auth forms) lives in `@repo/admin/ui`. App files are thin re-exports. The `AdminProvider` wraps the app's tRPC client so package components access it via `useAdminApi()`.
- **Prisma raw SQL**: Tables and columns are snake_case (`users`, `roles`, `role_id`, `created_at`). The Prisma schema uses camelCase — translate when writing raw queries.
- **Prisma 7 datasource**: Prisma 7 dropped `url` from `schema.prisma` datasource blocks — connection URLs go in `prisma.config.ts`. Never add `url = env("DATABASE_URL")` to the schema. Dockerfile tools stage must use the matching Prisma version (`7.x`).
- **Explicit JSX return types in web**: Every exported function/component in `apps/web/src/` that returns JSX must have an explicit return type annotation (`: ReactElement`, `: ReactElement | null`, `: Promise<ReactElement>`, etc.). Declaration portability errors (`cannot be named without a reference to 'Element'`) only surface during Docker/clean builds, never in incremental local dev (`next dev` compiles lazily). Applies to all `.tsx` files — components, pages, providers, helpers.
- **New workspace package**: When adding one (e.g. `@repo/email`), update both the `deps` stage (`COPY packages/X/package.json`) and `builder` stage (`COPY --from=deps .../node_modules` + `COPY packages/X`) in `apps/api/Dockerfile`.
- **Select options procs**: Any `select` field with `optionsFrom` or `optionsQuery` in a CRUD config requires the matching admin tRPC router to expose `searchOptions` (and `options`). `createCRUDRouter` / `createKeyValueRouter` / `buildCRUDRouters` wire these automatically. Hand-rolled routers (e.g. `frontPageSettingsRouter` in `apps/api/src/server/router.ts`) must add both procs; reference impl: `createKeyValueRouter` in `packages/crud/src/router-factory/create-key-value-router.ts`. Without them, admin autocomplete 404s (`admin.<model>.searchOptions` missing).
- **Public web images**: For any image field rendered on the public web (`apps/web/src/app/**`), use `resolveAssetUrl` from `apps/web/src/app/front-page-settings.ts` — never render raw `item.image` / `settings.fooImage`. The helper prepends `NEXT_PUBLIC_STORAGE_BASE_URL` (S3/CDN in prod, API origin in local dev) for managed paths (`/uploads/`, `/defaults/`, `/assets/`) and leaves absolute URLs alone. Re-implementing the resolver breaks S3 deployments.
- **Lint suppressions**: Use `// oxlint-disable-next-line <plugin>/<rule>` with oxlint rule names (`typescript/no-explicit-any`, `react/exhaustive-deps`, `nextjs/no-img-element`).

## Security rules

- **Password fields**: Never add password-type fields to `searchableFields` in CRUD configs. `router-factory.ts` exposes searchable fields to queries — passwords must never be searchable.
- **Password hashing**: The `createUserRouter` in `@repo/admin/server` handles hashing via the injected `passwordHasher`. When overriding, hash on BOTH create and update.
- **Role assignment guard**: Before writing `roleId`, always check `targetRole.protected`. Block unless caller `isProtectedRole`. Prevents privilege escalation via assign-role.
- **CORS**: `apps/api/src/proxy.ts` only allows origins listed in `NEXT_PUBLIC_WEB_URL` (comma-separated); others get no `Access-Control-Allow-Origin`. Dynamic per-origin CORS requires `Vary: Origin` on every response, or CDNs serve one origin's cached headers to others.
- **Web validation messages**: Public web UI must render human-readable validation errors. Do not show raw Zod/tRPC issue arrays, JSON, stack traces, or machine codes to users.
- **Public web data uses tRPC**: When `apps/web` needs data from `apps/api`, add or reuse a procedure under `appRouter.public` and call `/api/trpc/<procedure>`. Do not add REST route handlers for data already modeled in tRPC unless explicitly requested or tRPC is technically impossible. Admin-only reads stay under `admin.<model>`; public reads use `public.<feature>`.
- **Schema ownership**: Never edit `apps/api/prisma/schema.prisma` manually. All model creation and updates go through `pnpm crud:scaffold <model>`, which derives the Prisma model from the CRUD config, patches back-relations, and runs `prisma migrate dev`.
- **Migration tool**: Always use `prisma migrate dev` (via scaffold or `pnpm --filter @repo/db db:migrate`). Never use `db:push` — it creates schema drift with no migration file, breaking future `migrate dev` with checksum/drift errors.
- **Explicit join models**: Many-to-many relations must use explicit join models — set `through` in the relation config (e.g. `{ field: "tags", model: "tag", through: "blogTag" }`). Explicit generates `blog_tags(blog_id, tag_id)` matching the snake_case convention; implicit m2m generates `_ModelToModel` with `A`/`B` columns.
- **tRPC admin namespace**: Every admin resource router (user, role, settings, emailSettings, and any `crud:scaffold`ed model) MUST sit under `admin` in `appRouter` — the client calls `api.admin.<model>.<procedure>`. Flattening to root 404s every admin call. `router.test.ts` pins this.
- **Merge routers, never spread**: `router({ ...routerA, ...routerB })` silently drops all tRPC v11 procedures (they live in `_def.procedures`). Use `mergeRouters(routerA, routerB)` from `~/server/trpc`. The spread form passes type-check + mock tests but 500s at runtime.
- **Router `select` ⇄ schema sync**: Any `select` in a router's `findMany`/`findUnique` must reference only fields that exist on the Prisma model. Update selects in the same change as schema edits — mock-based router tests don't catch stale fields.
- **Uploads**: Production uploads on serverless hosts need durable storage such as S3-compatible storage.
- **Rate limiting**: `apps/api/src/proxy.ts` login rate limiting is best-effort in-memory; use a shared store before high-stakes production exposure.

## Testing

Framework: Vitest (on Vite 8) + @testing-library/react. Tests live in each package's `src/__tests__/` or next to the source as `*.test.ts(x)`.

No tests for Next.js pages — those are verified by the build check. tRPC router _shape_ is locked by `apps/api/src/server/router.test.ts` (admin namespace + root account/public) and router `select` fields by `@repo/admin` user-router tests. `packages/e2e/lib/__tests__/schema-drift.test.ts` fails when a new prod model is neither in the e2e schema nor in `EXCLUDED_MODELS`.

**Never remove failing tests.** Fix the underlying issue instead (add Radix providers, polyfill browser APIs, fix React version mismatches, etc.). Remove a test only if the feature itself is being removed from the codebase.

## After implementing any feature

Run before reporting done, and fix any failures:

```bash
pnpm lint
pnpm test
pnpm type-check
```

Do not skip this — `pnpm dev` compiles lazily and misses type errors.

Then run the build check (template acceptance path, copies the template into a clean test project):

```bash
rsync -a --delete --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='pnpm-lock.yaml' --exclude='.env' --exclude='apps/web' --filter='+ apps/api/src/crud/example.ts' --filter='- apps/api/src/crud/*' --filter='- apps/api/prisma/' ~/work/utils/quantyx/ ~/work/utils/test-project/
cd ~/work/utils/test-project && pnpm --filter api build
```

A clean build (`✓ Compiled successfully`) is the minimum bar. For broad changes in this repo, also run `pnpm build` (runs `next build`, including type-check, in both apps — same as Docker).

### Teardown (mandatory)

After any session that starts servers or containers (dev servers, `next start`, `pnpm e2e*`, `docker compose up`, `docker run`), tear down everything you started before reporting done — including after failed or interrupted runs:

```bash
# App ports (3000 = apps/web, 3001 = apps/api)
lsof -ti :3000-3001 | xargs kill -9 2>/dev/null || true
# e2e Postgres containers (testcontainers) + their anonymous volumes
docker ps -aq --filter label=org.testcontainers=true | xargs -r docker rm -f -v
# Anything started via docker compose (no -v: keeps named data volumes)
docker compose down --remove-orphans
```

- Stopping a backgrounded `pnpm e2e*` does not stop its `next start` child — it keeps holding `:3001` and breaks the next run. Run e2e in the foreground, or kill the port afterwards.
- Only remove containers you started (testcontainers label / this compose project). Never prune unrelated containers, images, or volumes on the user's machine.
- Then verify: `lsof -ti :3000-3001` prints nothing and `docker ps --filter label=org.testcontainers=true` lists nothing.

## Agent guidance

- Local skills live under `.agents/skills/` and are tracked in `skills-lock.json`. Use only skills that exist locally or are exposed by the active runtime. If an instruction references a missing skill or tool, fall back to the documented commands and say so briefly.
- Commonly relevant skills:
  - `frontend-design` — new or redesigned web UI
  - `web-design-guidelines` — UI/UX/accessibility audits
  - `vercel-react-best-practices` — React/Next.js performance review
  - `vercel-composition-patterns` — reusable React component APIs
  - `vercel-react-view-transitions` — view transitions
  - `vercel-optimize` — Vercel cost/performance investigations
  - `crud-gen` — generate CRUD configs from Prisma models
  - `cavecrew` — compressed subagent delegation when available
  - `caveman-review` / `caveman-commit` — terse review or commit output when requested

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

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, invoke the `skill` tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

<!-- headroom:rtk-instructions -->

# RTK (Rust Token Killer) - Token-Optimized Commands

When running shell commands, **always prefix with `rtk`**. This reduces context
usage by 60-90% with zero behavior change. If rtk has no filter for a command,
it passes through unchanged — so it is always safe to use.

## Key Commands

```bash
# Git (59-80% savings)
rtk git status          rtk git diff            rtk git log

# Files & Search (60-75% savings)
rtk ls <path>           rtk read <file>         rtk grep <pattern>
rtk find <pattern>      rtk diff <file>

# Test (90-99% savings) — shows failures only
rtk pytest tests/       rtk cargo test          rtk test <cmd>

# Build & Lint (80-90% savings) — shows errors only
rtk tsc                 rtk lint                rtk cargo build
rtk prettier --check    rtk mypy                rtk ruff check

# Analysis (70-90% savings)
rtk err <cmd>           rtk log <file>          rtk json <file>
rtk summary <cmd>       rtk deps                rtk env

# GitHub (26-87% savings)
rtk gh pr view <n>      rtk gh run list         rtk gh issue list

# Infrastructure (85% savings)
rtk docker ps           rtk kubectl get         rtk docker logs <c>

# Package managers (70-90% savings)
rtk pip list            rtk pnpm install        rtk npm run <script>
```

## Rules

- In command chains, prefix each segment: `rtk git add . && rtk git commit -m "msg"`
- For debugging, use raw command without rtk prefix
- `rtk proxy <cmd>` runs command without filtering but tracks usage

<!-- /headroom:rtk-instructions -->
