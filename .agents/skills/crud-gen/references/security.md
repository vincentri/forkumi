# Security Checklist

Source: `CLAUDE.md`, `packages/admin/src/server/routers/role.ts`, `packages/admin/src/server/routers/user.ts`

## Password Fields

- **Never add password fields to `searchableFields`** — `router-factory.ts` exposes searchable fields to queries; passwords must never be searchable.
- Default behavior is safe: `showInTable: false`, `filterable: false`.
- The `password` field type renders a password input and applies `z.string().min(1)` validation.
- Schema note: Prisma stores passwords as hashed strings. The CRUD layer handles the hash via `passwordHasher`.

## Password Hashing

The `createUserRouter` in `@repo/admin/server` handles hashing via the injected `passwordHasher` (see `packages/admin/src/server/routers/user.ts:14-17`).

**Default behavior**: `createUserRouter` hashes on both create and update automatically.

**Override rule**: If you override user create/update behavior, hash on BOTH create and update via the injected `passwordHasher`. Do not store plaintext.

```ts
// Correct pattern when overriding:
async ({ input }) => {
  const hashed = await passwordHasher.hash(input.password);
  return db.user.create({ data: { ...input, password: hashed } });
}
```

## Role Assignment Protection

Before writing `roleId`, always check role protection:

```ts
const callerIsProtected = ctx.session?.user?.isProtectedRole ?? false;
const targetRole = await db.role.findUnique({ where: { id: input.roleId } });

if (targetRole?.protected && !callerIsProtected) {
  throw new TRPCError({ code: "FORBIDDEN", message: "Cannot assign to a protected role." });
}
```

Pattern source: `packages/admin/src/server/routers/role.ts:25-28`.

**Always check both**: `targetRole.protected` AND `callerIsProtected`. Either condition can block.

## Production Uploads

`uploadUrl` (e.g. `"/api/upload?path=uploads/products"`) works for local development. Production serverless hosts need durable storage:

- Use **S3-compatible storage** (AWS S3, Cloudflare R2, MinIO).
- See `apps/api/scripts/upload-default-assets-to-s3.ts` for the seed pattern.
- Set `uploadUrl` to point to your S3 presigned-URL endpoint.

## Additional Guards

- **Protected role modification**: Check `callerIsProtected` before any `role.update` or `role.create` with `protected: true`. Source: `role.ts:30-42`.
- **Role deletion**: Block when users are assigned (`role.ts:54-63`).
- **CORS `Vary: Origin`**: Dynamic `Access-Control-Allow-Origin` (per-origin allowlist) requires `Vary: Origin` on every response. Check `apps/api/src/proxy.ts` before editing CORS behavior.
- **Web validation messages**: Public web UI must render human-readable validation errors. Never show raw Zod/tRPC issue arrays, JSON, stack traces, or machine codes to users.

## Do Not

- Put `password`-typed fields in `searchableFields`.
- Store plaintext passwords.
- Write `roleId` without checking `targetRole.protected` + `callerIsProtected`.
- Use local `uploadUrl` patterns in production without S3.
- Show raw error stacks or Zod issues in the public web frontend.
