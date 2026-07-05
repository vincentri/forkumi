---
name: crud-gen
description: >
  Generate CRUD configs for Quantyx. Reads Prisma models, maps field types,
  creates config files, registers routes, scaffolds, migrates, and verifies.
  Use when user says "create CRUD", "add CRUD resource", "generate CRUD config",
  "/crud-gen", "crud new", "crud scaffold".
---

Generate CRUD configs from Prisma models. One model in, full admin resource out.

## When to Use

Building any new admin resource backed by a Prisma model. For non-CRUD admin features (invitations, modals, custom pages), use `@repo/admin/ui` directly.

## Workflow

1. **Locate or plan the Prisma model.** Do NOT edit `apps/api/prisma/schema.prisma` manually — scaffold owns it. If creating from scratch, write the CRUD config first; scaffold generates the Prisma model from it.
2. **Read the field-type reference.** Read `apps/api/src/crud/example.ts` — the canonical field-type reference. Read `references/field-types.md` for the full prop table.
3. **Map fields.** Use the decision trees below to pick field types and select strategies. Read `references/config-keys.md` for top-level config options.
4. **Write the config.** Place at `apps/api/src/crud/<model>.ts`. Export as `export const <Model>CRUD = defineCRUD({...})`. For roles, re-export `createRoleCRUD([])` from `@repo/admin`. For users/settings, re-export built-ins.
5. **Scaffold.** Run `pnpm crud:scaffold <model>` — generates the Prisma model, patches back-relations, runs `prisma migrate dev`, and appends the export to `apps/api/src/crud/index.ts` automatically.
6. **Verify.** All three steps are required:

```bash
pnpm --filter crud test
pnpm type-check
rsync -a --delete --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='pnpm-lock.yaml' --exclude='.env' --exclude='apps/web' \
  --filter='+ apps/api/src/crud/example.ts' --filter='- apps/api/src/crud/*' \
  --filter='- apps/api/prisma/' ~/work/utils/quantyx/ ~/work/utils/test-project/
cd ~/work/utils/test-project && pnpm --filter api build
```

A clean build (`✓ Compiled successfully`) is the minimum bar.

## Decision Trees

### Select Strategy

| Situation | Use | Docs |
|---|---|---|
| Fixed enum (status, role, type) | `options: [{label, value}]` | `references/select-modes.md#1-static-options` |
| FK to another table | `optionsFrom: { model, valueField, labelField }` | `references/select-modes.md#2-optionsfrom` |
| Tenant/role/session-aware options | `optionsQuery: async ({db, ctx}) => ...` | `references/select-modes.md#3-optionsquery` |
| Many-to-many to another table | `multiple: true` + `relation` + `optionsFrom` | `references/select-modes.md#4-many-to-many` |
| Weekly operating hours | `type: "schedule"` | `references/field-types.md#schedule-fields` |
| Ordered image gallery (one-to-many images) | `type: "gallery"` | `references/field-types.md#gallery-fields` |

### Resource Type

| Situation | Config Pattern |
|---|---|
| Standard table CRUD | `mode: "crud"` (default) |
| Settings / hero section | `mode: "keyValue"` — every field needs `namespace` |
| Cap row count | `maxRecords: N` |
| Read-only reference data | `readOnly: true` |
| Aggregate counts / computed columns | `query.list` escape hatch |

## Reference Index

| File | Covers |
|---|---|
| `references/config-keys.md` | All top-level `CRUDConfig` keys, defaults, effects |
| `references/field-types.md` | 16+ field types, per-type props, Prisma mapping (includes `schedule` and `gallery`) |
| `references/select-modes.md` | Static, optionsFrom, optionsQuery, m2m recipe |
| `references/form-layout.md` | Sections, columns (weight), rows, tab grouping |
| `references/inline-child-editor.md` | `extraTabs`/`extraSchema` escape hatch — prefer `type: "schedule"` for weekly hours |
| `references/delete-policy.md` | 4 actions (restrict/setNull/setValue/ignore), Prisma alignment |
| `references/query-hooks.md` | `list()` escape hatch for aggregates/joins |
| `references/inline-child-editor.md` | `extraTabs`/`extraSchema` escape hatch — prefer `type: "schedule"` for weekly hours, `beforeCreate`/`beforeUpdate` hooks for cross-field validation |
| `references/keyvalue-mode.md` | KeyValue setup, namespace rule, getContent read |
| `references/security.md` | Password hashing, role guard, uploads |

## Security Summary

- Password fields: `showInTable: false`, `filterable: false` by default. Never add to `searchableFields`.
- Password hashing: `createUserRouter` handles it via injected `passwordHasher`. If overriding, hash on both create AND update.
- Role guard: before writing `roleId`, check `targetRole.protected` AND `ctx.session.user.isProtectedRole`. Block unless both allow.
- Production uploads: local `uploadUrl` patterns need S3-compatible storage in production.

Full checklist: `references/security.md`.

## Anti-Patterns (Do Not)

- **Never** edit `apps/api/prisma/schema.prisma` manually — all model changes via `pnpm crud:scaffold <model>`.
- **Never** use `pnpm db:push` — creates schema drift, breaks `migrate dev`. Use `prisma migrate dev` (scaffold runs it).
- **Never** manually register exports in `apps/api/src/crud/index.ts` — scaffold appends them.
- **Never** flatten admin routers to the `appRouter` root. Every admin resource router MUST be nested under `admin` (client calls `api.admin.<model>.*`). Flattening 404s every admin call. Verified by `apps/api/src/server/router.test.ts`.
- **Never** combine tRPC v11 routers via `router({ ...routerA, ...routerB })` — spreading drops all procedures (`_def.procedures` isn't an own prop). Use `mergeRouters(a, b)` from `apps/api/src/server/trpc.ts`.
- **Never** leave a router `select` referencing Prisma fields that don't exist on the model. When the schema drops/renames a field, update every `select` in the same change. Mock tests don't catch this; runtime does.
- **Never** put `password` in `searchableFields`.
- **Never** write `roleId` without protected-role guard.
- **Never** store plaintext passwords.
- **Never** show raw Zod/tRPC errors in the public web frontend.
