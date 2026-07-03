# Delete Policy

Source: `packages/crud/src/types.ts:92-111`, `apps/api/src/crud/example.ts`

## When to Use

When another CRUD resource stores this record's ID in a field. `deletePolicy` defines what happens to those referencing rows when this record is deleted.

## Actions

| Action | Behavior | When to use |
|---|---|---|
| `restrict` | Block deletion while related rows exist | FK should never be null. Most common. |
| `setNull` | Set `referencingField` to `null` before deletion | Optional FK. Use with Prisma `onDelete: SetNull`. |
| `setValue` | Set `referencingField` to `value` (fallback) | Move related rows to a default parent before deleting this one. |
| `ignore` | Leave existing values untouched | Orphaned rows are acceptable or handled elsewhere. |

## Shape

```ts
deletePolicy: [
  {
    referencingModel: "post",           // Prisma model key containing the FK
    referencingField: "categoryId",     // Field on the referencing model
    onDelete: "restrict",               // One of: restrict | setNull | setValue | ignore
    message: "Cannot delete while posts use it.",  // Optional error message
    value: "fallback_category_id",      // Only for setValue
  },
]
```

## Alignment Rule

**App-level `deletePolicy` must match the Prisma relation `onDelete` behavior.**

- To block deletion while posts use a category: use `onDelete: "restrict"` + Prisma `onDelete: Restrict` (or no explicit `onDelete`, since `Restrict` is default).
- To allow deletion and clear references: use `onDelete: "setNull"` + Prisma `onDelete: SetNull`.

Mismatch causes FK constraint violations at the DB level that bypass the app-level guard.

## Notes

- `deletePolicy` is optional. If omitted, deletion is unrestricted (Prisma FK behavior still applies).
- The `message` field is shown to the user on `restrict` failures. Make it human-readable.
- Multiple policies can be set — all are checked before deletion.
