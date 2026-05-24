# Changelog

## 0.1.20 — 2026-04-23

### Added

- **`AuthMobileLogo` component** — Shared inline logo block (hidden on desktop, shown on mobile). Extracted from all 4 auth pages where it was copy-pasted verbatim. Call sites: `signin`, `forgot-password`, `reset-password`, `accept-invite`.
- **Auth procedure unit tests** — 13 tests in `apps/api/src/__tests__/passwordReset.test.ts` covering `validateResetToken` (missing/expired/used token, happy path, hash verification), `validateInvitation` (same 5 cases), and `sha256` hashing. Vitest added to `apps/api` with `pnpm --filter api test`.

### Fixed

- **`resetPasswordProcedure` atomicity** — Token mark-as-used and password update are now wrapped in `prisma.$transaction`. Previously, a crash between the two writes left the token burned but the password unchanged, permanently locking the user out of the reset link.
- **Signin inputs disabled during submission** — `email` and `password` inputs now have `disabled={isBusy}` (matching the pattern enforced on the other 3 auth pages in v0.1.19).
- **Signin `role="alert"` on error div** — Screen readers now announce sign-in failures immediately. The design review in v0.1.19 added this to the other 3 auth pages but missed signin.

## 0.1.19 — 2026-04-23

### Added

- **`AuthBrandPanel` component** — Shared dark left panel (logo, tagline, gradient) extracted from signin page. Used by all 4 auth pages. Accepts `tagline` and `subtext` props.
- **Role selector in InviteUserModal** — Optional role dropdown populated from `role.list`. Invited users can now be assigned a role at invite time.

### Fixed

- **Brand presence on auth pages** — `forgot-password`, `reset-password`, `accept-invite` now use the two-panel branded layout matching signin. Each has a page-specific tagline.
- **accept-invite welcome copy** — Heading changed to "Welcome to Admin", subtitle explains the setup step. Token expired error now shows a "Back to sign in" recovery link.
- **Input disabled state during submission** — All auth form inputs now disable during submit (`disabled={isSubmitting}`), matching the button state.
- **Screen reader error announcements** — All dynamically-rendered error divs on auth pages now have `role="alert"` so screen readers announce them immediately.

## 0.1.18 — 2026-04-23

### Fixed

- **Rate limit error surfaced on forgot-password page** — TOO_MANY_REQUESTS errors are now re-thrown from the catch block so `mutation.error` propagates and the "Too many reset requests." message is shown. All other errors are still swallowed to preserve no-enumeration behavior.

## 0.1.17 — 2026-04-23

### Fixed

- **Protected role guard on invite** — `inviteProcedure` now blocks assigning a protected role unless the caller has `isProtectedRole`. Previously, any admin could invite users with protected roles, bypassing privilege escalation controls.
- **Single reset token per user** — `requestPasswordResetProcedure` now deletes all prior unused tokens before creating a new one. Previously multiple valid reset tokens could exist simultaneously, enabling a race attack on the reset flow.

## 0.1.16 — 2026-04-22

### Fixed

- **Invite rollback on email failure** — When `sendInvitationEmail` throws (e.g. Resend not configured), the `UserInvitation` row is now deleted before rethrowing. Previously the orphaned row blocked re-inviting the same address for 7 days with "Invitation already pending."

## 0.1.15 — 2026-04-22

### Added

- **Password reset flow** — `/auth/forgot-password` + `/auth/reset-password` pages. Tokens are SHA-256 hashed in DB; raw token sent in email only. In-memory rate limiter (3 requests/hour/email). No email enumeration. `?reset=1` banner on signin after success.
- **User invitation flow** — Admin "Invite User" button on user list opens `InviteUserModal`. `/auth/accept-invite` page for invitees. 7-day token expiry. Re-invite after expiry works (upsert). `?invited=1` banner on signin after accept.
- **`extraHeaderActions` prop on `CRUDPage`** — Slot for custom header buttons alongside "New". Keeps `packages/crud` generic; app layer decides what to pass.
- **Production README section** — Documents `db:migrate` vs `db:push`, required env vars, rate limiter caveat, Resend setup, and deploy targets.

### Fixed

- **bcryptjs runtime `require()`** — Replaced `require("bcryptjs")` inside procedure bodies with a top-level `import` in `routers/user.ts`.
- **Dead code removed** — Deleted `AssignRoleModal.tsx` and `assignRoleProcedure` (roleId select-remote in user edit form already handled role assignment).

## 0.1.14 — 2026-04-22

### Fixed

- **Raw Zod JSON in error toast** — `CRUDResourceClient` now parses tRPC/Zod error messages and surfaces the first human-readable issue (e.g. "Password is required") instead of leaking the raw JSON array.

## 0.1.13 — 2026-04-22

### Changed

- **router.ts split** — extracted all business logic from `apps/api/src/server/router.ts` into `routers/user.ts`, `routers/role.ts`, `routers/log.ts`. Extracted `logAction()` helper to `routers/utils.ts`, replacing 6 copy-pasted `prisma.log.create` blocks. `router.ts` is now ~50-line assembly only.

## 0.1.12 — 2026-04-22

### Changed

- **Signin page — split-panel redesign** — replaced single-card layout with a two-column split: dark `zinc-950` left panel (hidden on mobile) with brand headline, subtle grid texture, and radial gradient accent; clean right panel with the form. Typography: "Welcome back" heading, no card border, no frosted glass. Responsive: left panel collapses on mobile, inline logo shown instead.

## 0.1.11 — 2026-04-22

### Fixed

- **Signin redirect lag** — added `isRedirecting` state that activates after `router.push()` is called, keeping the button in "Signing in..." state until the page unmounts. Previously `isSubmitting` dropped to false the moment the async handler resolved, causing a ~1 second flash of the idle "Sign in" button before navigation completed.

### Changed

- **Signin page visual redesign** — full-bleed radial gradient background (primary color at 20% opacity), branding block above the form card (logo mark + app name + tagline), frosted-glass card with `backdrop-blur`, proper spacing. Dropped the `Card` wrapper in favor of a plain `div` with custom styling. Dark mode inherits CSS variable colors automatically.

## 0.1.10 — 2026-04-21

### Fixed

- **Nav double fetch eliminated** — Two separate root causes, both fixed:
  1. `QueryClient` now initializes with `staleTime: Infinity` and `refetchOnWindowFocus: false` — prevents `refetchOnMount` from firing a second request when stale data is immediately re-mounted on navigation.
  2. `CRUDPage` search debounce `useEffect` no longer fires `onQueryChange` on initial mount — the mount fire produced a different tRPC cache key (`{page:1, search:null, sortDir:"asc"}` vs `{page:1}`) causing React Query to treat them as separate queries and fire both. Suppressed via `useRef` mount guard. Result: exactly 1 API call on first navigation, 0 on repeat visits (cache hit).

## 0.1.9 — 2026-04-20

### Fixed

- **Permission matrix All toggle** — Unchecking "All" now also unchecks all individual cells for that row (previously kept them checked). Clicking All on → checks+locks all cells; clicking All off → unchecks all cells and unlocks. Locked cells use `pointer-events-none` instead of `disabled` so the checked state renders visually (blue checkbox) rather than faded.

## 0.1.8 — 2026-04-20

### Fixed

- **Theme blink on navigation** — `ThemeProvider` now reads `localStorage` synchronously inside `useState()` initializer instead of `useEffect`. Eliminates the light-mode flash when navigating to an admin page with dark mode active.

- **select-remote not full width, option not selectable** — Added `container: () => "w-full"` to `AsyncReactSelectField` classNames so the control fills its container. Fixed Radix Dialog's `onPointerDownOutside` intercepting clicks on the portaled menu (rendered to `document.body`) and cancelling react-select's option selection.

- **Email field uses HTML5 validation instead of react-hook-form** — Added `noValidate` to `<CRUDForm>` so browser-native email/url popups never fire. Validation is handled entirely by Zod + react-hook-form, with an inline error message below the field.

## 0.1.7 — 2026-04-20

### Fixed

- **select-remote dropdown hidden behind Dialog** — `AsyncReactSelectField` now sets `menuPortal: (base) => ({ ...base, zIndex: 9999 })` in the react-select styles. The menu portal renders to `document.body` but was clipped by shadcn/ui Dialog's z-50 overlay. Now the dropdown appears above the modal and options are selectable.

## 0.1.6 — 2026-04-20

### Fixed

- **Permission matrix All toggle** — Checking "All" now locks individual cells (disabled while All is active). Unchecking "All" removes the lock and preserves whatever individual cells were checked. Rows already fully checked on open are pre-locked.

- **Protected role read-only view** — Rows with `protected: true` open as "View" dialog instead of "Edit". All fields are read-only, submit button is hidden, Delete button is hidden in the table.

- **select-remote edit mode** — `loadOptions` now uses `api.useUtils().fetch()` instead of the tRPC React proxy (which has no `.query()` method in v11). Role select no longer shows "Search..." on edit.

## 0.1.5 — 2026-04-20

### Fixed

- **select-remote edit mode blank** — `AsyncReactSelectField` returned `null` when the form held a plain string ID (from DB) instead of a `{label, value}` object. Now resolves the string against `defaultOptions` if available, else stubs `{value, label: value}` so the control is never blank on edit.

- **Permission matrix UI** — `MulticheckField` detects `model:action` formatted options and renders a proper table: resources as rows, actions (view / read / create / update / delete) as columns, with an "All" toggle per row. Wildcard row (`*`) is pinned at the top with a subtle highlight. Falls back to the flat list for non-permission multicheck fields. Edit Role dialog widens to `max-w-2xl` when the config contains a multicheck field.

- **Audit log shows user email** — `log.list` now joins the `users` table and returns `userEmail` (email address) instead of the raw `userId` cuid. Falls back to the userId string, then `"deleted user"` if the user no longer exists. `Log` model in Prisma schema adds an optional `user` relation with `onDelete: SetNull`.

- **AdminNav Administration section defaults closed** — `adminOpen` initial state is now derived from the current pathname: open only when a child route (`/admin/user`, `/admin/role`, `/admin/log`) is the active page. Previously hardcoded `true` (always open).

## 0.1.4 — 2026-04-20

### Added

- **DESIGN.md** — Design system reference at repo root. Documents all 14 CSS tokens, typography stack, 28 shadcn/ui components in use, admin panel ASCII layout, and the 3 required per-project customizations (brand name, `--primary` color, app title). Replaces code archaeology when handing off to a new developer or designer.
- **CLAUDE.md architecture + conventions** — Added `## Architecture`, `## Testing`, `## Security rules`, and `## Conventions` sections so every AI session starts with correct context. Reduces re-discovery overhead and prevents recurring security mistakes.

### Changed

- **TODOS.md** — Mobile sidebar, dark mode, DESIGN.md, and SQLite entries resolved. SQLite dev mode removed entirely (not wanted for this template). Remaining open items unchanged.

### Fixed

- **AdminNav aria-expanded + aria-controls** — "Administration" collapsible button now announces its open/closed state to screen readers. Fixes WCAG 4.1.2 violation on the nav section toggle.
- **CRUDPage isError banner** — `isError` prop propagated from tRPC through `CRUDResourceClient` → `CRUDPage`. Network failure now renders an inline destructive banner instead of a misleading "No X found" empty state.
- **Dark mode FOUC** — Inline script in `admin/layout.tsx` reads `localStorage.getItem('theme')` synchronously before React hydration. Eliminates the one-frame white flash on hard reload when dark mode is active.
- **CRUDPage test coverage** — 6 tests added in `packages/crud/src/__tests__/CRUDPage.test.tsx` covering error banner, conditional New button, and table rendering.

## 0.1.3 — 2026-04-20

### Features

- **Per-resource RBAC** — Permissions now use `model:action` format (e.g. `user:view`, `*:create`). The wildcard `*` grants access to all models for that action. Nav items are filtered server-side so users only see resources they can view. `permissionProcedure` accepts an optional model name and checks `model:action` OR `*:action`. `buildCRUDRouters` now accepts a factory function `(config) => ProcedureMap` so each resource gets its own scoped procedures automatically.

- **Human-readable Prisma errors** — `handlePrismaError` now catches all thrown errors and returns a safe `INTERNAL_SERVER_ERROR` message instead of leaking raw Prisma output. P2002 (unique violation) and P2025 (not found) are still handled explicitly with user-friendly messages.

- **User improvements** — Users can now be deleted (removed `deletable: false`). Name is required on create. Password field label now reads "Password (optional for edit)" so the UI intent is clear.

- **Dashboard no longer redirects** — `/admin` is now a blank customizable page. Previously it auto-redirected to the first CRUD resource, which was confusing on new projects.

### Bugs fixed

- **Password hash in getById response** — `admin.user.getById` was returning the hashed password field to the client. Now stripped.

## 0.1.2 — 2026-04-19

### Bugs fixed

- **`multicheck` missing from scaffold type map** — `scripts/crud-scaffold.ts`: `FIELD_TYPE_MAP` typed as `Record<FieldType, string>` but had no `multicheck` entry, causing a TS2741 compile error when `pnpm crud:scaffold` ran against a config with multicheck fields. Fixed by adding `multicheck: "String"`.

- **VERSION file behind CHANGELOG** — `VERSION` still said `0.1.0` after the `0.1.1` release. Fixed.

- **CHANGELOG overstated setup.mjs interactivity** — v0.1.0 entry claimed setup.mjs was "interactive: asks single/split + auth provider". Actual code is non-interactive. Corrected the entry.

## 0.1.1 — 2026-04-17

### Bugs fixed

- **`number` field scaffolds to `Int` instead of `Float`** — `scripts/crud-scaffold.ts`: `FIELD_TYPE_MAP` mapped `number` to Prisma `Int`, silently truncating decimals (e.g. `19.99` stored as `19`). Fixed by mapping to `Float`. `range` correctly stays `Int` (slider, always integer). README field type table updated to match.

### Documentation

- **`db:push` vs `db:migrate`** — README Scripts table now distinguishes: `db:push` is local dev only (no migration files); `db:migrate` generates migration files and is the correct path for production schema changes.

## 0.1.0 — 2026-04-15

Initial working version. Architecture: split-app (apps/api + apps/web) with barrel-driven CRUD auto-discovery.

### Bugs fixed

- **OR:[] silent empty results** — `packages/crud/src/router-factory.ts`: when a config has only non-text fields (number, boolean), Prisma `OR: []` was produced for search, which matches nothing. Fixed by guarding with `searchableFields.length > 0`.

- **Optional color field hex regex fail** — `packages/crud/src/schema-builder.ts`: browser submits `""` when a color picker is cleared. The empty-string-to-undefined transform didn't include `"color"`, causing the hex regex to fail. Fixed by adding `"color"` to the transform list.

- **`import.meta.dirname` Node 20 incompatibility** — `scripts/crud-scaffold.ts`: used `import.meta.dirname` which requires Node 22+. The repo targets Node ≥20. Fixed by using `new URL("..", import.meta.url).pathname` instead.

- **Admin page non-functional** — `apps/api/src/app/(admin)/[resource]/page.tsx`: rendered `<CRUDPage config={config} />` with no tRPC hooks — permanently empty with no CRUD buttons. Fixed by splitting into a server component (config lookup + notFound) and a new `CRUDResourceClient` client component with dynamic tRPC hook wiring via `(api.admin as any)[config.model]`.

- **Mutation errors silently swallowed** — `packages/crud/src/components/CRUDPage.tsx`: `handleSubmit` had no catch block. Fixed by adding `mutationError` state with red error banner in the modal.

- **`buildCRUDRouters` zero tests** — `packages/crud/src/__tests__/router-factory.test.ts`: new function with no coverage. Fixed by adding 4 unit tests.

### DX improvements (post-review)

- Added `README.md` with 6-command quick start, CRUD workflow, field type reference
- Rewrote `setup.mjs`: auto-generates `NEXTAUTH_SECRET`, writes `.env` from `.env.example`, checks Docker (advisory). Non-interactive — DATABASE_URL must be set manually.
- Added guard in `CRUDResourceClient.tsx`: throws a helpful error if the tRPC model router is missing
- Made `select` field type require `options[]` at the TypeScript level
- Added `apps/api/src/crud/example.ts` — commented-out example showing all field types
