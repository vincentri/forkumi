# Inline One-to-Many Editor (`extraTabs`)

The CRUD factory auto-renders scalar fields and the built-in `type: "schedule"`
field (weekly hours). For any other related child table inside the same
create/edit form, pass custom tabs to `CRUDPage` instead of using the standard
`select`/`optionsFrom` relation fields.

**For weekly operation hours, prefer `type: "schedule"`** — it auto-generates
the child Prisma model, nested writes, and form tab.
**For ordered image galleries, prefer `type: "gallery"`** — same pattern, with
`uploadUrl` for the upload endpoint. Use `extraTabs` only for child tables that
aren't weekly hours or image galleries.

## When to Use

- The related rows are app-specific (e.g. recipe ingredients, product specs)
  and shouldn't appear as a separate admin page.
- The child set is small and always edited alongside the parent.
- You want the parent + children to save in a single API call (one
  mutation, one transaction).

## API Shape

```ts
// apps/api/src/server/routers/<resource>.ts
export const resourceRouter = router({
  create: permissionProcedure("create", "<resource>")
    .input(buildZodSchema(ResourceCRUD).extend({ items: childSchema.optional() }))
    .mutation(async ({ input }) => {
      const { items = [], ...rest } = input;
      return prisma.<resource>.create({
        data: {
          ...applySlugFields(ResourceCRUD.fields, rest),
          items: { create: items.map(normalize) },
        },
      });
    }),

  update: permissionProcedure("update", "<resource>")
    .input(z.object({ id: z.string(), data: buildUpdateZodSchema(ResourceCRUD).extend({ items: childSchema.optional() }) }))
    .mutation(async ({ input }) => {
      const { id } = input;
      const { items, ...rest } = input.data;
      await prisma.<resource>.update({
        where: { id },
        data: {
          ...applySlugFields(ResourceCRUD.fields, rest),
          ...(items !== undefined
            ? { items: { deleteMany: {}, create: items.map(normalize) } }
            : {}),
        },
      });
    }),
});
```

## Admin Page

```tsx
// apps/api/src/app/admin/<resource>/page.tsx
"use client";
import { useState } from "react";
import { CRUDPage, type QueryState, z } from "@repo/crud";
import { useAdminApi } from "@repo/admin/ui";
import { ResourceCRUD } from "~/crud/resource";
import { ResourceChildEditor } from "~/components/admin/ResourceChildEditor";

const itemsSchema = z.object({ items: z.array(childItemSchema) });

export default function ResourceAdminPage() {
  const api = useAdminApi();
  const [query, setQuery] = useState<QueryState>({ page: 1 });
  const list = api.admin.resource.list.useQuery({ page: query.page });
  const create = api.admin.resource.create.useMutation({ onSuccess: () => list.refetch?.() });
  const update = api.admin.resource.update.useMutation({ onSuccess: () => list.refetch?.() });

  return (
    <CRUDPage
      config={ResourceCRUD}
      listData={list.data}
      isLoading={list.isLoading}
      onQueryChange={setQuery}
      onCreate={async (data) => (await create.mutateAsync(data as never)).id}
      onUpdate={async (id, data) => { await update.mutateAsync({ id, data: data as never }); }}
      extraTabs={[
        {
          label: "Children",
          fieldNames: ["items"],
          render: (form, ctx) => (
            <ResourceChildEditor control={form.control} disabled={ctx.readOnly} />
          ),
        },
      ]}
      extraSchema={itemsSchema}
    />
  );
}
```

## Child Editor

The editor receives the react-hook-form `control` and binds itself to a named
form field (e.g. `items`). Use a single `Controller` that maps between an
array in form state and the editor's UI:

```tsx
"use client";
import { Controller, type Control, type FieldValues } from "react-hook-form";

export function ResourceChildEditor({ control, disabled }: { control: Control<FieldValues, any>; disabled?: boolean }) {
  return (
    <Controller
      control={control}
      name="items"
      defaultValue={[]}
      render={({ field, fieldState }) => (
        // Map field.value (array) to rows, onChange calls field.onChange(nextArray)
        <div>
          {/* rows */}
          {fieldState.error && <p className="text-destructive">{fieldState.error.message}</p>}
        </div>
      )}
    />
  );
}
```

## Key Points

- The auto-generated CRUD form already supports tabs via `field.tab`. `extraTabs`
  appends additional tabs after the field-defined ones.
- `extraSchema` is merged with the auto Zod schema, so validation for the
  custom field participates in submit + tab-error badges.
- The child model is created in a nested Prisma write. For one-to-many with
  upsert semantics, prefer `deleteMany` + `create` on update — keeps the
  API surface a single mutation per save.
- The strict `api` from `~/lib/trpc/client` doesn't always see overridden
  routers; use `useAdminApi` from `@repo/admin/ui` for the admin page
  (returns `any`, matching the rest of the admin pages).
- For cross-field validation (e.g. `priceStart <= priceEnd`), prefer the
  `beforeCreate` / `beforeUpdate` hooks on `CRUDConfig` over a custom router.
  Throw `TRPCError` to abort the write.
