# KeyValue Mode (Settings)

Source: `packages/crud/src/types.ts:255-258`, `apps/api/src/crud/example.ts:248-278`

## When to Use

Settings-style forms (hero sections, site config, per-section toggles). No table UI — just a form with save.

## Setup

```ts
export const AboutSectionCRUD = defineCRUD({
  model: "aboutSection",
  label: "About Section",
  mode: "keyValue",        // switches UI to settings form
  navGroup: "Website",
  icon: "FileText",
  fields: [
    { name: "heading", type: "text", label: "Heading", tab: "Content", namespace: "about", required: true },
    { name: "body", type: "richtext", label: "Body", tab: "Content", namespace: "about" },
    { name: "showBadge", type: "boolean", label: "Show Badge", tab: "CTA", namespace: "about", default: false },
    { name: "badgeText", type: "text", label: "Badge Text", tab: "CTA", namespace: "about",
      visibleWhen: { field: "showBadge", equals: true } },
  ],
});
```

## Rules

1. **Every field MUST have `namespace`** — it's stored as a DB column for row filtering. The namespace groups fields into a logical section.
2. `showInTable` is always `false` (no table). Fields default to `showInForm: true`.
3. Use `tab` for tab grouping in the form (same as CRUD mode).
4. Use `visibleWhen` for conditional fields — hidden fields are NOT validated or saved, so provider-specific settings are preserved.
5. `mode: "keyValue"` generates a model with its own table (`key` + `value` columns). Scaffold creates this automatically.
6. `pnpm crud:scaffold <model>` creates the Prisma model and runs `prisma migrate dev`.

## Read Side (Web Frontend)

Read from `apps/web` via tRPC:

```ts
const { data } = trpc.public.getContent.useQuery({ namespace: "aboutSection" });
// data = { heading: "...", body: "...", showBadge: true, badgeText: "..." }
```

## Permission Actions

KeyValue mode limits generated permission options to `view` + `update` only (no `create` / `delete` — rows are created by the form, not by individual CRUD operations).

## Notes

- Fields not referenced in `formLayout` are appended in original order after configured sections.
- `default` values are applied on form load. If a key doesn't exist in the DB yet, the form shows the default.
- Multiple KeyValue resources can share the same Prisma model if they use different namespaces — but the standard pattern is one resource per namespace with its own model.
