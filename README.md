# Quantyx

Reusable monorepo scaffold for client projects. Includes auth (NextAuth.js), database (Prisma + Postgres), API (tRPC), and an automatic CRUD builder for admin resources.

**Measured TTHW (time-to-hello-world):** ~37s on a warm machine (cold pnpm cache). ~15s on repeat runs (warm cache). Both apps ready at `localhost:3001/admin`.

## Quick Start

```bash
# Replace 'your-github' with your GitHub username (e.g. github.com/jane-dev → jane-dev)
pnpm dlx degit your-github/quantyx my-project
cd my-project
node scripts/setup.mjs        # writes .env with a generated NEXTAUTH_SECRET
# edit .env — set DATABASE_URL (and DIRECT_URL for migrations) to your Postgres
# start your local Postgres first (see "Local Postgres" below)
pnpm install && pnpm db:migrate && pnpm db:seed
pnpm dev
```

Open:
- `http://localhost:3001/admin` — admin panel (admin@example.com / password)
- `http://localhost:3000` — public frontend

**First run?** `pnpm install` takes ~25s cold. Subsequent runs use the pnpm cache (~3s).

**Port conflict?** If your local Postgres fails with "port is already allocated", another Postgres is running on 5432. Either stop it (`docker stop <name>`) or point `.env` at the existing instance.

## Local Postgres

This project can use a centralized local Postgres/pgvector container instead of starting a database inside this app's compose file. The app compose joins an external Docker network named `pgvector_default`, so your centralized Postgres compose should expose the database on that same network with the alias `postgres`:

```yaml
services:
  db:
    image: pgvector/pgvector:pg17
    container_name: pgvector-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: storetrac
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      default:
        aliases:
          - postgres

networks:
  default:
    name: pgvector_default

volumes:
  pgdata:
```

Then point `.env` at it (host `localhost` from your Mac; `start.sh` rewrites it to `postgres` inside the container):

```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/storetrac"
DIRECT_URL="postgresql://postgres:admin@localhost:5432/storetrac"
```

From your Mac host, the same DB is still available at `localhost:5432`.

## Testing Locally (Before Pushing to GitHub)

degit requires a remote URL. For local iteration, use `rsync` instead:

**First time:**

```bash
rsync -a --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='pnpm-lock.yaml' --exclude='.env' --exclude='apps/web' --filter='+ apps/api/src/crud/example.ts' --filter='- apps/api/src/crud/*' --filter='- apps/api/prisma/' ~/work/utils/quantyx/ ~/work/utils/test-project/
cd ~/work/utils/test-project
node scripts/setup.mjs
# start your local Postgres first (see "Local Postgres" above)
pnpm install && pnpm db:migrate && pnpm db:seed
pnpm dev
```

**Re-sync after changes:**

```bash
rsync -a --delete --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='pnpm-lock.yaml' --exclude='.env' --filter='+ apps/api/src/crud/example.ts' --filter='- apps/api/src/crud/*' --filter='- apps/api/prisma/' ~/work/utils/quantyx/ ~/work/utils/test-project/
cd ~/work/utils/test-project
pnpm install && pnpm db:migrate
pnpm dev
```

`pnpm db:seed` creates:

- **Super Admin** role (all permissions) and **Viewer** role (view only)
- **admin@example.com / password** — assigned Super Admin role

Open `http://localhost:3001/admin` and log in.

`--delete` removes files in test-project that were deleted in quantyx. `--exclude='.env'` preserves your local env.

**Wipe and re-seed:** `pnpm dev:reset` — drops all data and re-runs the seed. Useful when you want a clean slate during development.

## Architecture

Split-app: `apps/web` (frontend, port 3000) + `apps/api` (backend, port 3001).

```
apps/web   (port 3000) — public Next.js frontend
apps/api   (port 3001) — admin CMS + tRPC + NextAuth
packages/
  admin/   — built-in admin resources (users, roles, settings, auth pages, nav)
  db/      — Prisma schema + generated client
  auth/    — NextAuth config (credentials + JWT, no DB adapter)
  crud/    — CRUD builder (defineCRUD → tRPC + React UI)
  ui/      — shadcn/ui component library
  tsconfig/— shared TypeScript bases
```

## Adding a Resource

Two paths — use whichever fits your workflow:

### Path A: Interactive (no config file needed)

```bash
pnpm crud:new
# → prompts for model name, field names/types/required
# → writes apps/api/src/crud/<model>.ts
# → updates schema.prisma + crud/index.ts
pnpm db:migrate
```

### Path B: Write config first, then scaffold

```typescript
// apps/api/src/crud/product.ts
import { defineCRUD } from '@repo/crud'

export const ProductCRUD = defineCRUD({
  model: 'product',
  label: 'Products',
  fields: [
    { name: 'title',       type: 'text',     label: 'Title',       required: true },
    { name: 'price',       type: 'number',   label: 'Price',       required: true },
    { name: 'published',   type: 'boolean',  label: 'Published',   default: false },
    { name: 'description', type: 'textarea', label: 'Description' },
  ],
})
```

```bash
pnpm crud:scaffold product   # reads config → updates schema + barrel
pnpm db:migrate
```

Nav link, tRPC routes (`admin.product.list/create/update/delete/bulkDelete`), and admin page at `/admin/product` are automatic.

## Custom Admin Pages

For pages that don't fit the CRUD builder (dashboards, reports, custom forms):

1. Copy `apps/api/src/app/admin/example-custom-page/page.tsx` to `apps/api/src/app/admin/<slug>/page.tsx`
2. Register it in `apps/api/src/lib/customLinks.ts`:

```ts
export const customLinks: AdminNavLink[] = [
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: "BarChart3",
    permissions: ["analytics:view"],  // optional — omit to show to all users
  },
];
```

If `permissions` is set, the first entry gates sidebar visibility and all entries appear as assignable permissions in the Role editor.

## Field Types

| Type         | Prisma   | UI Control     | Notes                                                          |
|--------------|----------|----------------|----------------------------------------------------------------|
| `text`       | String   | Text input     |                                                                |
| `textarea`   | String   | Textarea       |                                                                |
| `email`      | String   | Email input    | Validates format                                               |
| `url`        | String   | URL input      | Validates format                                               |
| `password`   | String   | Password input | Hidden in table by default                                     |
| `color`      | String   | Color picker   | Saves as hex (#rrggbb)                                         |
| `select`     | String   | Dropdown       | Requires `options: [{label, value}]`                           |
| `multicheck` | String[] | Checkbox group | Requires `options: [{label, value}]`; stored as Postgres array |
| `number`     | Float    | Number input   | Decimals supported                                             |
| `range`      | Int      | Range slider   | Use `min`, `max`, `step`                                       |
| `boolean`    | Boolean  | Checkbox       | Defaults to `false`                                            |
| `date`       | DateTime | Date picker    |                                                                |
| `image`      | String   | Image upload   | Use `uploadUrl` like `/api/upload?path=uploads/<folder>`; JPEG, PNG, GIF, and WebP uploads are accepted |
| `file`       | String   | File upload    | Use `uploadUrl`, `accept`, `maxSizeMB`; keep local paths under `uploads/` |
| `richtext`   | String   | Rich text editor | HTML stored as string                                        |

Add `filterable: true` to any field to show a column filter in the table header. Supported on `boolean`, `select`, `date`, and text-based fields.

## Environment Variables

Copy `.env.example` to `.env`. `setup.mjs` does this automatically and generates `NEXTAUTH_SECRET` for you.

Key variables:

- `DATABASE_URL` — Postgres connection string (runtime; pooled is fine)
- `DIRECT_URL` — direct/session connection (port 5432) for `prisma migrate`; falls back to `DATABASE_URL`
- `NEXTAUTH_SECRET` — auto-generated by setup.mjs
- `NEXTAUTH_URL` — `http://localhost:3001`
- `NEXT_PUBLIC_API_URL` — `http://localhost:3001` (used by apps/web to reach apps/api)

## Default Branding Assets

Fresh installs seed admin branding to the tracked files in `public/defaults/admin/`:

- `default-logo-light.png`
- `default-logo-dark.png`
- `default-favicon.png`

Replace those files before first seed if you want project-specific defaults. After install, use Admin → Settings → Branding to upload new light/dark logos and favicon.

Local uploads are stored in ignored `public/uploads/admin/settings/`. On serverless hosts such as Vercel, local disk is not durable; use S3-compatible storage for production uploads.

Image values are stored as provider-neutral relative paths:

- `/defaults/...` for tracked seed/default assets served by `apps/api` locally or `NEXT_PUBLIC_STORAGE_BASE_URL` in S3/CDN-backed production
- `/uploads/...` for uploaded assets served by local storage in dev or `NEXT_PUBLIC_STORAGE_BASE_URL` in S3/CDN-backed production

When `STORAGE_PROVIDER=s3`, `pnpm dev:reset` uploads the seeded files from `public/defaults/admin/` to matching S3 keys such as `defaults/admin/default-logo-light.png`. This keeps the database values provider-neutral while making the default branding assets available from S3/CDN-backed deployments.

S3 uploads do not set object ACLs. Make `uploads/*` and `defaults/*` publicly readable with an S3 bucket policy or CloudFront distribution so browsers can load images directly from `NEXT_PUBLIC_STORAGE_BASE_URL`. The configured credentials need `s3:PutObject` for uploads and seeded default assets.

## Scripts

| Command              | Description                                      |
|----------------------|--------------------------------------------------|
| `pnpm dev`           | Start both apps via Turbo                       |
| `pnpm dev:api`       | Start `apps/api` only (admin panel, port 3001) |
| `pnpm dev:web`       | Start `apps/web` only (frontend, port 3000)     |
| `pnpm build`         | Build all packages and apps                     |
| `pnpm lint`          | Run ESLint CLI through Turbo                    |
| `pnpm db:migrate`       | Push schema to DB — local dev only (no migration files) |
| `pnpm db:migrate`    | Generate a migration file — use this for production      |
| `pnpm db:seed`       | Create seed data (admin@example.com / password)          |
| `pnpm db:studio`     | Open Prisma Studio                                       |
| `pnpm dev:reset`     | Wipe DB + re-seed; uploads default assets to S3 when enabled |
| `pnpm --filter api assets:upload-defaults` | Upload seeded `/defaults/...` files to S3 when `STORAGE_PROVIDER=s3` |
| `pnpm crud:new`      | Interactive: create a new CRUD resource         |
| `pnpm crud:scaffold` | Non-interactive: sync config → schema + barrel  |

## Split-Mode Cookie Notes

In local dev, `apps/web` (:3000) and `apps/api` (:3001) share cookies because browsers treat `localhost` ports as the same origin. No extra config needed.

In production, set `NEXTAUTH_COOKIE_DOMAIN=.yourdomain.com` on both apps so the session cookie is shared across subdomains.

If deploying on fully separate domains (not subdomains of the same root), the `sameSite: 'lax'` cookie default will block cross-domain requests. Set `sameSite: 'none'` in `packages/auth/src/config.ts` under `cookies.sessionToken` — requires HTTPS.

## Known Security Limitations

These are known trade-offs in the current template. Mitigate before using on high-stakes projects:

- **Permission staleness** — Role permissions are stored in the JWT token, not re-fetched on every request. If you demote or remove a user, they retain their current permissions until the token expires (~1 hour). To mitigate: reduce `maxAge` in `packages/auth/src/config.ts`, or add a server-side session store.
- **Best-effort login rate limiting** — `apps/api/src/proxy.ts` rate-limits credential login attempts in memory. This is useful locally and on a single long-lived instance, but it resets on deploy/cold start and is not shared across serverless instances. Use a shared store (Redis, Upstash, etc.) before exposing high-stakes projects to the internet.
- **SVG uploads disabled by default** — The upload route accepts JPEG, PNG, GIF, and WebP. Keep SVG disabled unless you add sanitization and strict serving headers.

## What's NOT in the CRUD Builder

- Relational fields (FK selects) — add manually in your tRPC router
- Per-field access control — use `protectedProcedure` in your router
- Custom business logic hooks — override `createCRUDRouter` or extend the router manually

## Going to Production

### Database migrations

Use `pnpm db:migrate` (generates migration files) — not `pnpm db:migrate` (destructive schema sync, dev-only). Commit the generated files in `packages/db/prisma/migrations/` to your repo.

### Required environment variables

| Variable | Value |
| --- | --- |
| `NEXTAUTH_URL` | Full URL of your app (e.g. `https://admin.yourapp.com`) |
| `NEXTAUTH_SECRET` | Random 32-byte secret: `openssl rand -base64 32` |
| `DATABASE_URL` | Postgres connection string used at runtime (pooled/PgBouncer is fine, e.g. Supabase port `6543`) |
| `DIRECT_URL` | Direct/session connection (port `5432`) for `prisma migrate` — pooled transaction connections hang on migrate's advisory lock. Defaults to `DATABASE_URL` if unset |
| `STORAGE_PROVIDER` | Use `s3` for durable production uploads on serverless hosts |
| `AWS_REGION` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET` | Required when `STORAGE_PROVIDER=s3`; credentials need `s3:PutObject` |
| `NEXT_PUBLIC_STORAGE_BASE_URL` | Optional public CDN/S3 base URL for uploaded files |

### Deploy targets

Both Vercel and Railway work. The key difference: **Vercel** is serverless, so local filesystem uploads and in-memory rate-limit state are not durable. Use an external Postgres database and S3-compatible storage. **Railway** runs a longer-lived process, so local instance state is more stable, but S3-compatible storage is still recommended for production uploads.

For Vercel, deploy `apps/api` and `apps/web` as separate projects from the same repo, with each project configured to its app root. Docker Compose is local-only.

## Troubleshooting

**`P1001: Can't reach database server`** — Postgres is not reachable from the app container. Start your centralized Postgres compose first, ensure the `pgvector_default` network exists, and make sure the DB has the network alias `postgres`.

**`TypeError: Cannot read properties of undefined (reading 'list')`** — The CRUD model isn't registered. Run `pnpm crud:scaffold <model>` and `pnpm db:migrate`, then restart the dev server.

**`NEXTAUTH_SECRET` missing** — Run `node scripts/setup.mjs` (writes `.env` automatically) or set it manually: `openssl rand -base64 32`.
