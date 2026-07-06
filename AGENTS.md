# Quantyx Agent Guide

Use this file as the cross-agent starting point. `CLAUDE.md` contains extra Claude-oriented context, and `README.md` contains user-facing setup docs.

## Repo Shape

Turborepo + pnpm workspace:

- `apps/api` — Next.js full-stack admin/API app on port `3001`
- `apps/web` — Next.js public frontend on port `3000`
- `packages/admin` — built-in admin UI, auth pages, users/roles/settings, server router factories
- `packages/crud` — CRUD config builder, tRPC router factory, React CRUD UI
- `packages/db` — Prisma client helpers, seed, default assets; schema lives at `apps/api/prisma/schema.prisma`
- `packages/auth` — NextAuth factory/session helpers
- `packages/ui` — shared shadcn/ui components
- `packages/email` — transactional email service/providers

## Commands

- Install: `pnpm install`
- Dev, both apps: `pnpm dev`
- Dev, admin/API only: `pnpm dev:api`
- Dev, web only: `pnpm dev:web`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Type check: `pnpm type-check`
- Unit tests: `pnpm test`
- E2E tests: `pnpm e2e`
- DB migrate for local dev: `pnpm db:migrate <name>` (non-interactive; name required when schema drift exists)
- DB seed: `pnpm db:seed`
- Reset local DB and seed: `pnpm dev:reset` (DESTRUCTIVE — wipes all data; never run on shared/staging/prod)
- For non-trivial column type changes (e.g. `String` → `DateTime`), edit the generated migration SQL in `apps/api/prisma/migrations/<ts>_<name>/migration.sql` to preserve data via explicit `USING` cast, then re-run `pnpm db:migrate <name>`.
- Create CRUD resource interactively: `pnpm crud:new`
- Scaffold CRUD resource from config: `pnpm crud:scaffold <model>`

## Editing Rules

- Prefer existing package boundaries. Built-in admin behavior belongs in `packages/admin`; generic CRUD behavior belongs in `packages/crud`; app-specific wiring belongs in `apps/api/src`.
- CRUD configs live in `apps/api/src/crud/<model>.ts` and export `export const ProductCRUD = defineCRUD({...})`.
- Shared UI components live in `packages/ui/src/components/` and are re-exported from `packages/ui/src/index.ts`.
- Prisma schema is `apps/api/prisma/schema.prisma`. Raw SQL table/column names are snake_case even when Prisma fields are camelCase.
- Public web UI should show human-readable validation messages, not raw Zod/tRPC issue arrays or stack traces.
- Every exported function/component in `apps/web/src/` that returns JSX must have an explicit return type annotation (`: ReactElement`, `: ReactElement | null`, `: Promise<ReactElement>`, etc.). TypeScript declaration portability errors (`cannot be named without a reference to 'Element'`) only surface during Docker/clean builds, never in turbo-cached local builds. This applies to all `.tsx` files — components, pages, providers, and helpers.
- Prisma 7 dropped `url` from `schema.prisma` datasource blocks — connection URLs go in `prisma.config.ts` instead. Never add `url = env("DATABASE_URL")` to the schema. Dockerfile tools stage must use matching Prisma version (`7.x`).
- When adding a new workspace package (e.g. `@repo/email`), update both the `deps` stage (`COPY packages/X/package.json`) and `builder` stage (`COPY --from=deps .../node_modules` + `COPY packages/X`) in `apps/api/Dockerfile`.
- Any `select` field with `optionsFrom` or `optionsQuery` in a CRUD config requires the matching admin tRPC router to expose `searchOptions` (and `options`). If you build the router via `createCRUDRouter` / `createKeyValueRouter` / `buildCRUDRouters` this is automatic — these wire up `options` + `searchOptions` internally. If you hand-roll the router (e.g. `frontPageSettingsRouter` in `apps/api/src/server/router.ts` for locale fallback + non-localized fan-out), you must add both procs yourself. Reference impl: `createKeyValueRouter` in `packages/crud/src/router-factory/create-key-value-router.ts`. Without these procs, admin autocomplete on the field 404s (`admin.<model>.searchOptions` missing).
- For any image field rendered on the public web (`apps/web/src/app/**`), use `resolveAssetUrl` from `apps/web/src/app/front-page-settings.ts` — never render raw `item.image` / `settings.fooImage`. The helper prepends `NEXT_PUBLIC_STORAGE_BASE_URL` (S3/CDN in prod, API origin in local dev) for managed paths (`/uploads/`, `/defaults/`, `/assets/`) and leaves absolute URLs alone. Re-implementing the resolver duplicates the logic and breaks S3 deployments.

## Security Notes

- Never add password fields to `searchableFields`.
- When overriding user create/update behavior, hash passwords on both create and update.
- Before assigning `roleId`, check whether the target role is protected and block non-protected callers.
- Production uploads on serverless hosts need durable storage such as S3-compatible storage.
- `apps/api/src/proxy.ts` contains best-effort in-memory login rate limiting; use a shared store before high-stakes production exposure.

## Verification

For CRUD/package changes, run `pnpm test`.

For broad changes, run `pnpm build --force` when local dependencies and environment are available. The `--force` flag bypasses turbo cache and runs type-check from scratch — same as Docker. Cached builds silently skip type-check and mask errors.

When following the template acceptance path, use the rsync smoke-test flow in `README.md` / `CLAUDE.md` and verify `apps/api` builds in the copied test project.

After QA that starts dev servers, stop app ports:

```bash
lsof -ti :3000 :3001 | xargs kill -9 2>/dev/null || true
```

## Local Skills

Local skill files are under `.agents/skills/` and tracked by `skills-lock.json`. Use a skill only when it exists locally or is exposed by the active runtime.

Commonly relevant skills:

- `frontend-design` — building or redesigning UI
- `web-design-guidelines` — UI/UX/accessibility audits
- `vercel-react-best-practices` — React/Next.js performance review
- `vercel-composition-patterns` — reusable React component architecture
- `vercel-react-view-transitions` — view transitions
- `vercel-optimize` — Vercel cost/performance investigations
- `cavecrew` — compressed subagent delegation when available
- `caveman-review` / `caveman-commit` — terse review or commit output when requested
- `crud-gen` — generate CRUD configs from Prisma models

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
