## Architecture

Turborepo monorepo. Two apps, six packages:

```
apps/
  api/        Next.js full-stack app (port 3001) — auth, tRPC, admin UI
packages/
  admin/      Built-in admin features (users, roles, settings, invitations, auth pages, nav)
  crud/       CRUD builder: JSON config → Zod + tRPC router + React components
  db/         Prisma schema + generated client + seed
  auth/       NextAuth config factory, session types, Prisma adapter (no @repo/db dependency)
  ui/         shadcn/ui component library (re-exported from packages/ui)
  tsconfig/   Shared tsconfig bases
```

### @repo/admin — subpath exports

- `@repo/admin` — Types, built-in CRUD configs (`UserCRUD`, `createRoleCRUD`)
- `@repo/admin/server` — `createAdminRouter`, `createPrismaAdapter`, router factories, `derivePermissionOptions`, layout helpers
- `@repo/admin/ui` — `AdminProvider`, `AdminNav`, `SettingsClient`, `CRUDResourceClient`, `InviteUserModal`, `CreateUserModal`, `ThemeProvider`, auth forms
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

## Testing

Run tests with:

```bash
pnpm --filter crud test          # Vitest unit tests
pnpm --filter crud test --watch  # watch mode
```

Test files live in `packages/crud/src/__tests__/`. Framework: Vitest + @testing-library/react. Coverage focuses on CRUDPage component behavior (error banner, form visibility, table rendering).

No tests for tRPC routers or Next.js pages — those are verified by the build check below.

## Security rules

- **Password fields**: Never add password-type fields to `searchableFields` in CRUD configs. `router-factory.ts` exposes searchable fields to queries — passwords must never be searchable.
- **Password hashing**: The `createUserRouter` in `@repo/admin/server` handles hashing via the injected `passwordHasher`. When overriding, hash on BOTH create and update.
- **Role assignment guard**: Before writing `roleId`, always check `targetRole.protected`. Block unless caller `isProtectedRole`. Prevents privilege escalation via assign-role.
- **CORS Vary header**: Dynamic `Access-Control-Allow-Origin` (per-origin allowlist) requires `Vary: Origin` on every response. Without it, CDNs serve one origin's cached headers to others. See `apps/api/src/middleware.ts`.

## Conventions

- **CRUD configs**: One file per resource at `apps/api/src/crud/<model>.ts`. camelCase filename. Export as `export const ProductCRUD = defineCRUD({...})`. Built-in configs (user, role) are re-exports from `@repo/admin`.
- **Adding a resource**: (1) write config in `apps/api/src/crud/<model>.ts`, (2) `pnpm crud:scaffold <model>`, (3) `pnpm db:push`. Nav link, tRPC procedures, admin page, and permissions are all automatic (permissions are derived at runtime via `derivePermissionOptions`).
- **Components**: PascalCase. Co-locate with the page they serve. Shared UI components go in `packages/ui/src/components/`.
- **Server logic**: Built-in admin routers live in `@repo/admin/server` as factories. App-specific overrides and wiring in `apps/api/src/server/`. Client-only components (hooks, state) in `apps/api/src/app/`.
- **Admin UI components**: Built-in UI (nav, settings, CRUD bridge, modals, auth forms) lives in `@repo/admin/ui`. App files are thin re-exports. The `AdminProvider` wraps the app's tRPC client so package components access it via `useAdminApi()`.
- **Prisma raw SQL**: Tables and columns are snake_case (`users`, `roles`, `role_id`, `created_at`). The Prisma schema uses camelCase — translate when writing raw queries.

## After implementing any feature

After completing any feature implementation, always run a build check before reporting done:

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

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
