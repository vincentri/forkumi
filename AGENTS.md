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
- CRUD tests: `pnpm --filter crud test`
- DB push for local dev: `pnpm db:push`
- DB seed: `pnpm db:seed`
- Reset local DB and seed: `pnpm dev:reset`
- Create CRUD resource interactively: `pnpm crud:new`
- Scaffold CRUD resource from config: `pnpm crud:scaffold <model>`

## Editing Rules

- Prefer existing package boundaries. Built-in admin behavior belongs in `packages/admin`; generic CRUD behavior belongs in `packages/crud`; app-specific wiring belongs in `apps/api/src`.
- CRUD configs live in `apps/api/src/crud/<model>.ts` and export `export const ProductCRUD = defineCRUD({...})`.
- Shared UI components live in `packages/ui/src/components/` and are re-exported from `packages/ui/src/index.ts`.
- Prisma schema is `apps/api/prisma/schema.prisma`. Raw SQL table/column names are snake_case even when Prisma fields are camelCase.
- Public web UI should show human-readable validation messages, not raw Zod/tRPC issue arrays or stack traces.

## Security Notes

- Never add password fields to `searchableFields`.
- When overriding user create/update behavior, hash passwords on both create and update.
- Before assigning `roleId`, check whether the target role is protected and block non-protected callers.
- Production uploads on serverless hosts need durable storage such as S3-compatible storage.
- `apps/api/src/proxy.ts` contains best-effort in-memory login rate limiting; use a shared store before high-stakes production exposure.

## Verification

For CRUD/package changes, run `pnpm --filter crud test`.

For broad changes, run `pnpm type-check` and `pnpm build` when local dependencies and environment are available.

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
