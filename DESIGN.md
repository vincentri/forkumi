# Design System

Admin panel design reference. Start here when customizing for a new project.

---

## Required customizations per project

Three things to check before going live:

1. **Brand name** — Admin → Settings → Branding → App Name. The value is read in `apps/api/src/app/admin/layout.tsx` and rendered by `packages/admin/src/ui/AdminNav.tsx`.
2. **Primary color** — `apps/api/src/app/globals.css:13` — change `--primary: 221.2 83.2% 53.3%` (currently blue) to your brand color in HSL. Also update the dark-mode `--primary` if needed.
3. **App title** — `apps/api/src/app/layout.tsx` — update the root metadata/title defaults.

That's it. Everything else inherits from these three.

---

## Color tokens

All colors are CSS custom properties defined in `apps/api/src/app/globals.css`. Light and dark variants both live there.

| Token | Usage |
|-------|-------|
| `--background` | Page background |
| `--foreground` | Default text |
| `--card` | Card/panel background |
| `--primary` | Buttons, active nav links, focus rings — **change this for branding** |
| `--primary-foreground` | Text on primary-colored backgrounds |
| `--secondary` | Secondary buttons, chips |
| `--muted` | Subtle backgrounds (table header, input fill) |
| `--muted-foreground` | Placeholder text, secondary labels |
| `--accent` | Hover states on nav items |
| `--destructive` | Error states, delete buttons |
| `--border` | Dividers, input outlines |
| `--input` | Input border color |
| `--ring` | Focus ring |
| `--radius` | Global border radius (default `0.5rem`) |

Dark mode is automatic. The `ThemeProvider` in `apps/api/src/app/admin/layout.tsx` reads `localStorage.getItem('theme')` and applies `.dark` to `<html>`. The inline script prevents the white flash on first load.

---

## Typography

Currently uses the system font stack:

```css
font-family: system-ui, -apple-system, sans-serif;
```

To switch to a custom font (e.g. Inter from Google Fonts):
1. Add `<link>` in `apps/api/src/app/layout.tsx`
2. Replace the `font-family` in `globals.css`
3. Or use Next.js `next/font` — drop-in with no FOUT

Scale uses Tailwind defaults: `text-xs` (12px) for secondary labels, `text-sm` (14px) for table content, `text-base` (16px) for body, `text-2xl` (24px) for page headings.

---

## shadcn/ui components in use

All components live in `packages/ui/src/components/` and are re-exported from `@repo/ui`.

| Component | Used in |
|-----------|---------|
| `Button` | Nav toggle, form submit, CRUD actions |
| `Input` | Search bar, text fields in CRUD form |
| `Label` | Form field labels |
| `Textarea` | Textarea fields in CRUD form |
| `Select` | Select fields in CRUD form |
| `Checkbox` | Boolean fields in CRUD form |
| `Dialog` | Create/edit modal |
| `Sheet` | Mobile nav drawer |
| `Table` | CRUD data table |
| `Skeleton` | Loading shimmer in CRUDPage |
| `Badge` | Status chips (optional, not yet wired) |
| `Separator` | Visual dividers |
| `Tooltip` | Icon button labels |
| `Popover` | react-select dropdown container |
| `Toaster` + `toast` | Success/error notifications |
| `Alert` | Inline destructive banner (isError state) |
| `Pagination` | Table page controls |
| `DropdownMenu` | Row actions menu |
| `Card` | Dashboard panels |
| `Avatar` | User profile display |
| `ScrollArea` | Nav overflow on small screens |

To add a new shadcn component: run `npx shadcn@latest add <component>` from inside `packages/ui/`, then export it from `packages/ui/src/index.ts`.

---

## Layout structure

```
AdminNav (w-56, sticky, hidden on mobile)     main (flex-1, p-8)
┌─────────────────────────────────────────────────────────────┐
│ [Admin brand]          [theme toggle]  │                     │
│─────────────────────────────────────── │  Page content       │
│ Dashboard                              │                     │
│                                        │                     │
│ ▼ Administration                       │                     │
│   Users                                │                     │
│   Roles                                │                     │
│   Logs                                 │                     │
│                                        │                     │
│ ─────────────────────────────────────  │                     │
│ [Other resources...]                   │                     │
│                                        │                     │
│─────────────────────────────────────── │                     │
│ user@example.com        [Sign out]     │                     │
└────────────────────────────────────────┴─────────────────────┘
```

Mobile: sidebar collapses to a `h-11 w-11` (44px WCAG) hamburger button at `top-3 left-3`. Sheet opens as a left-side drawer. Main content has `pt-16` on mobile to avoid overlap.

---

## CRUD resource page structure

Each admin resource page follows the same layout:

```
[Page title]                        [+ New Resource]

[Search input]                      [Refresh]

┌──────────────────────────────────────────────────────┐
│ Column A  │ Column B  │ Column C  │ Actions           │
├───────────┼───────────┼───────────┼───────────────────┤
│ value     │ value     │ value     │ [Edit] [Delete]   │
└──────────────────────────────────────────────────────┘

[← Prev]   Page 1 of N                       [Next →]
```

Error state: inline destructive banner replaces the table when `isError` is true.
Empty state: centered message with optional CTA — customize via `emptyState` prop in `CRUDResourceClient.tsx`.

---

## Adding a new CRUD resource

```bash
# 1. Write the config (or use interactive mode)
pnpm crud:new                          # interactive — asks for model name + fields
# OR
# Write apps/api/src/crud/<model>.ts manually (see example.ts)

# 2. Scaffold
pnpm crud:scaffold <model>             # appends Prisma model, registers barrel export, creates/applies migration

# Nav link, tRPC procedures, and admin page appear automatically.
```

Field types: `text`, `email`, `url`, `password`, `number`, `range`, `boolean`, `textarea`, `select`, `multicheck`, `date`, `color`, `image`, `file`, `richtext`.
