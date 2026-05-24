"use client";

import { useState, useEffect, useRef } from "react";
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
} from "@repo/ui";
import type { CRUDConfig, QueryState } from "../types";
import { CRUDForm } from "./CRUDForm";
import { CRUDTable } from "./CRUDTable";

interface CRUDPageProps {
  config: CRUDConfig;
  listData?: {
    items: Record<string, unknown>[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  isLoading?: boolean;
  isError?: boolean;
  onRefetch?: () => void;
  /**
   * Called whenever page, search, sort, or filters change.
   * Use this to re-run your tRPC list query with the new params.
   *
   * @example
   * const [query, setQuery] = useState<QueryState>({ page: 1 });
   * const { data, refetch } = api.product.list.useQuery(query);
   * <CRUDPage onQueryChange={setQuery} ... />
   */
  onQueryChange?: (state: QueryState) => void;
  onCreate?: (data: Record<string, unknown>) => Promise<{ id?: string } | void>;
  onUpdate?: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete?: (id: string, row: Record<string, unknown>) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  /** Custom row-level action (e.g., "Assign Role"). Rendered as an additional button in the Actions column. */
  onRowAction?: (row: Record<string, unknown>) => void;
  /** Label for the custom row action button. Defaults to "Action". */
  rowActionLabel?: string;
  /** Predicate to conditionally show the row action button. If omitted, shows for all rows. */
  rowActionVisible?: (row: Record<string, unknown>) => boolean;
  /** Called when the user clicks Duplicate on a row. */
  onDuplicate?: (row: Record<string, unknown>) => Promise<void>;
  /** Custom empty state rendered when the list has 0 items. Defaults to "No {label} found." */
  emptyState?: React.ReactNode;
  /** Email of the currently logged-in user. Passed to CRUDTable to highlight the current user's row. */
  currentUserEmail?: string;
  /** Extra actions rendered to the right of the "New" button in the table header */
  extraHeaderActions?: React.ReactNode;
}

type ModalState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; row: Record<string, unknown> };

/**
 * Full admin CRUD page: search bar + column filters + sortable table + pagination + create/edit modal + delete confirm + bulk delete.
 * Manages page/search/sort/filter state internally and fires onQueryChange so the parent can re-run the query.
 *
 * @example
 * // apps/api/src/app/(admin)/products/page.tsx
 * "use client";
 * import { useState } from "react";
 * import { api } from "~/lib/trpc/client";
 * import { CRUDPage, type QueryState } from "@repo/crud";
 * import { ProductCRUD } from "~/crud/product";
 *
 * export default function ProductsPage() {
 *   const [query, setQuery] = useState<QueryState>({ page: 1 });
 *   const { data, isLoading, refetch } = api.product.list.useQuery(query);
 *   const create = api.product.create.useMutation({ onSuccess: () => refetch() });
 *   const update = api.product.update.useMutation({ onSuccess: () => refetch() });
 *   const remove = api.product.delete.useMutation({ onSuccess: () => refetch() });
 *   const bulkRemove = api.product.bulkDelete.useMutation({ onSuccess: () => refetch() });
 *
 *   return (
 *     <CRUDPage
 *       config={ProductCRUD}
 *       listData={data}
 *       isLoading={isLoading}
 *       onRefetch={refetch}
 *       onQueryChange={setQuery}
 *       onCreate={(data) => create.mutateAsync(data)}
 *       onUpdate={(id, data) => update.mutateAsync({ id, data })}
 *       onDelete={(id) => remove.mutateAsync({ id })}
 *       onBulkDelete={(ids) => bulkRemove.mutateAsync({ ids })}
 *     />
 *   );
 * }
 */
export function CRUDPage({
  config,
  listData,
  isLoading,
  isError,
  onRefetch,
  onQueryChange,
  onCreate,
  onUpdate,
  onDelete,
  onBulkDelete,
  onRowAction,
  rowActionLabel,
  rowActionVisible,
  onDuplicate,
  emptyState,
  currentUserEmail,
  extraHeaderActions,
}: CRUDPageProps) {
  const [modal, setModal] = useState<ModalState>({ type: "closed" });
  const [isMutating, setIsMutating] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [sortField, setSortField] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, string | boolean | null>>({});
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  const isMounted = useRef(false);

  // 300ms debounce: fire query when user stops typing.
  // Skip the initial mount fire — parent already queried with {page:1}.
  // Firing on mount produces a different cache key and causes a double fetch.
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const timer = setTimeout(() => {
      const newSearch = searchDraft || undefined;
      setSearch(searchDraft);
      setPage(1);
      setSelectedIds(new Set());
      onQueryChange?.({ page: 1, search: newSearch, sortField, sortDir, filters: Object.keys(filters).length ? filters : undefined });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  function updateQuery(patch: Partial<QueryState>) {
    const next: QueryState = {
      page,
      search: search || undefined,
      sortField,
      sortDir,
      filters: Object.keys(filters).length ? filters : undefined,
      ...patch,
    };
    if (patch.page !== undefined) setPage(patch.page);
    if (patch.sortField !== undefined) setSortField(patch.sortField);
    if (patch.sortDir !== undefined) setSortDir(patch.sortDir);
    onQueryChange?.(next);
  }

  function handleSort(field: string, dir: "asc" | "desc") {
    const newField = field || undefined;
    setSortField(newField);
    setSortDir(dir);
    setPage(1);
    setSelectedIds(new Set());
    onQueryChange?.({ page: 1, search: search || undefined, sortField: newField, sortDir: dir, filters: Object.keys(filters).length ? filters : undefined });
  }

  function handleFilterChange(field: string, value: string | boolean | null) {
    const next = { ...filters };
    if (value === null || value === "") {
      delete next[field];
    } else {
      next[field] = value;
    }
    setFilters(next);
    setPage(1);
    setSelectedIds(new Set());
    onQueryChange?.({ page: 1, search: search || undefined, sortField, sortDir, filters: Object.keys(next).length ? next : undefined });
  }

  function clearFilters() {
    setFilters({});
    setPage(1);
    setSelectedIds(new Set());
    onQueryChange?.({ page: 1, search: search || undefined, sortField, sortDir });
  }

  async function handleSubmit(data: Record<string, unknown>) {
    setIsMutating(true);
    setMutationError(null);
    try {
      if (modal.type === "create") {
        const result = await onCreate?.(data);
        if (result && "id" in result && typeof result.id === "string") {
          setLastCreatedId(result.id);
          setTimeout(() => setLastCreatedId(null), 2000);
        }
      } else if (modal.type === "edit") {
        await onUpdate?.(modal.row.id as string, data);
      }
      setModal({ type: "closed" });
      onRefetch?.();
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsMutating(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsMutating(true);
    setDeleteError(null);
    try {
      await onDelete?.(deleteTarget.id as string, deleteTarget);
      setDeleteTarget(null);
      onRefetch?.();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsMutating(false);
    }
  }

  async function confirmBulkDelete() {
    setIsMutating(true);
    setBulkDeleteError(null);
    try {
      await onBulkDelete?.([...selectedIds]);
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      onRefetch?.();
    } catch (err) {
      setBulkDeleteError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsMutating(false);
    }
  }

  const singularLabel = config.label.replace(/s$/, "");
  const activeFilterCount = Object.keys(filters).length;
  const showCheckboxes = !!(onDelete && config.deletable !== false && onBulkDelete);
  const atMaxRecords = config.maxRecords !== undefined && (listData?.total ?? 0) >= config.maxRecords;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{config.label}</h1>
        <div className="flex items-center gap-2">
          {extraHeaderActions}
          {onCreate && !atMaxRecords && (
            <Button onClick={() => { setModal({ type: "create" }); setMutationError(null); }}>
              + New {singularLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2">
        <Input
          type="search"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          placeholder={`Search ${config.label.toLowerCase()}...`}
          className="max-w-sm"
        />
        {search && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setSearchDraft("")}>
            Clear
          </Button>
        )}
        {activeFilterCount > 0 && (
          <>
            <Badge variant="secondary">{activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}</Badge>
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </>
        )}
      </div>

      {/* Error banner */}
      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Failed to load {config.label.toLowerCase()}. Check your connection and try refreshing.
        </p>
      )}

      {/* Bulk delete bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{selectedIds.size} selected</span>
          <Button variant="destructive" size="sm" onClick={() => { setBulkDeleteOpen(true); setBulkDeleteError(null); }}>
            Delete selected
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      <CRUDTable
        config={config}
        data={listData?.items ?? []}
        isLoading={isLoading}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={onUpdate ? (row) => { setModal({ type: "edit", row }); setMutationError(null); } : undefined}
        onDelete={onDelete ? (row) => setDeleteTarget(row) : undefined}
        onDuplicate={onDuplicate ? async (row) => {
          setIsMutating(true);
          setMutationError(null);
          try {
            await onDuplicate(row);
            onRefetch?.();
          } catch (err) {
            setMutationError(err instanceof Error ? err.message : "Something went wrong.");
          } finally {
            setIsMutating(false);
          }
        } : undefined}
        onRowAction={onRowAction}
        rowActionLabel={rowActionLabel}
        rowActionVisible={rowActionVisible}
        emptyState={emptyState}
        currentUserEmail={currentUserEmail}
        lastCreatedId={lastCreatedId ?? undefined}
        showCheckboxes={showCheckboxes}
        selectedIds={selectedIds}
        onSelectRow={(id) => setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id); else next.add(id);
          return next;
        })}
        onSelectAll={(checked) => {
          if (checked) {
            const selectableIds = (listData?.items ?? [])
              .filter((row) => {
                const isProtected = row.protected && !row.isPendingInvite;
                const isCurrentUser = currentUserEmail && row.email === currentUserEmail;
                return !isProtected && !isCurrentUser;
              })
              .map((row) => String(row.id));
            setSelectedIds(new Set(selectableIds));
          } else {
            setSelectedIds(new Set());
          }
        }}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {/* Pagination */}
      {listData && listData.total > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {(() => {
              const start = (listData.page - 1) * listData.pageSize + 1;
              const end = Math.min(listData.page * listData.pageSize, listData.total);
              return `Showing ${start}–${end} of ${listData.total} items`;
            })()}
          </span>
          <div className="flex gap-2">
            {listData.page > 1 && (
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous page"
                onClick={() => { updateQuery({ page: listData.page - 1 }); setSelectedIds(new Set()); }}
              >
                Prev
              </Button>
            )}
            {listData.page < listData.totalPages && (
              <Button
                variant="outline"
                size="sm"
                aria-label="Next page"
                onClick={() => { updateQuery({ page: listData.page + 1 }); setSelectedIds(new Set()); }}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={modal.type !== "closed"}
        onOpenChange={(open) => {
          if (!open) { setModal({ type: "closed" }); setMutationError(null); }
        }}
      >
        <DialogContent className={`flex flex-col max-h-[90vh] ${config.fields.some((f) => f.type === "multicheck") ? "max-w-3xl" : "max-w-2xl"}`}>
          {(() => {
            const isProtectedRow = modal.type === "edit" && Boolean(modal.row.protected);
            return (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {modal.type === "create" ? `New ${singularLabel}` : isProtectedRow ? `View ${singularLabel}` : `Edit ${singularLabel}`}
                  </DialogTitle>
                  <DialogDescription>
                    {modal.type === "create"
                      ? `Fill in the fields below to create a new ${singularLabel.toLowerCase()}.`
                      : isProtectedRow
                      ? `This ${singularLabel.toLowerCase()} is protected and cannot be modified.`
                      : `Update the fields below.`}
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 min-h-0 pr-1">
                {mutationError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">
                    {mutationError}
                  </p>
                )}
                {modal.type !== "closed" && (
                  <CRUDForm
                    config={config}
                    defaultValues={modal.type === "edit" ? modal.row : undefined}
                    onSubmit={handleSubmit}
                    isLoading={isMutating}
                    submitLabel={modal.type === "create" ? "Create" : "Update"}
                    readOnly={isProtectedRow}
                  />
                )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setDeleteError(null); } }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {singularLabel}?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteError(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isMutating} onClick={confirmDelete}>
              {isMutating ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteOpen}
        onOpenChange={(open) => { if (!open) { setBulkDeleteOpen(false); setBulkDeleteError(null); } }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {selectedIds.size} {selectedIds.size === 1 ? singularLabel : config.label}?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          {bulkDeleteError && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {bulkDeleteError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBulkDeleteOpen(false); setBulkDeleteError(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isMutating} onClick={confirmBulkDelete}>
              {isMutating ? "Deleting..." : `Delete ${selectedIds.size}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
