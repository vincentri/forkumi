"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Skeleton,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Copy,
  MoreVertical,
  Pencil,
  Trash2,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  resolveAssetUrl,
} from "@repo/ui";
import type { CRUDConfig, CRUDField, CRUDFieldSelect } from "../types";

const ALL_FILTER_VALUE = "__all__";

interface CRUDTableProps {
  config: CRUDConfig;
  data: Record<string, unknown>[];
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  isLoading?: boolean;
  sortField?: string;
  sortDir?: "asc" | "desc";
  onSort?: (field: string, dir: "asc" | "desc") => void;
  /** Custom row-level action rendered as an extra button in the Actions column. */
  onRowAction?: (row: Record<string, unknown>) => void;
  /** Label for the custom row action button. Defaults to "Action". */
  rowActionLabel?: string;
  /** Predicate to conditionally show the row action button. If omitted, shows for all rows. */
  rowActionVisible?: (row: Record<string, unknown>) => boolean;
  /** Called when the user clicks Duplicate on a row. */
  onDuplicate?: (row: Record<string, unknown>) => void;
  /** Custom empty state rendered when data is empty. Defaults to "No {label} found." */
  emptyState?: React.ReactNode;
  /** Email of the currently logged-in user. Rows matching this email get a "You" badge. */
  currentUserEmail?: string;
  /** ID of a newly created row — gets a 2s highlight animation. */
  lastCreatedId?: string;
  /** Whether to show checkboxes for bulk selection. */
  showCheckboxes?: boolean;
  /** Set of currently selected row IDs. */
  selectedIds?: Set<string>;
  /** Called when a single row checkbox is toggled. */
  onSelectRow?: (id: string) => void;
  /** Called when the header "select all" checkbox is toggled. */
  onSelectAll?: (checked: boolean) => void;
  /** Current column filter values. */
  filters?: Record<string, string | boolean | null>;
  /** Called when a column filter changes. */
  onFilterChange?: (field: string, value: string | boolean | null) => void;
}

function SortIcon({ field, sortField, sortDir }: { field: CRUDField; sortField?: string; sortDir?: "asc" | "desc" }) {
  if (field.sortable === false) return null;
  if (sortField === field.name) {
    const Icon = sortDir === "asc" ? ChevronUp : ChevronDown;
    return <Icon className="ml-1 h-[14px] w-[14px] text-muted-foreground" />;
  }
  return <ChevronsUpDown className="ml-1 h-[14px] w-[14px] text-muted-foreground" />;
}

function isFilterableField(field: CRUDField): boolean {
  return field.filterable !== false && field.type !== "password" && field.type !== "multicheck";
}

function FilterCell({
  field,
  value,
  onChange,
}: {
  field: CRUDField;
  value?: string | boolean | null;
  onChange: (v: string | boolean | null) => void;
}) {
  if (field.type === "boolean") {
    const strVal = value === true ? "true" : value === false ? "false" : "";
    return (
      <Select value={strVal || ALL_FILTER_VALUE} onValueChange={(v) => onChange(v === ALL_FILTER_VALUE ? null : v === "true")}>
        <SelectTrigger className="h-7 text-xs w-full">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER_VALUE}>All</SelectItem>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "select" && (field as CRUDFieldSelect).display?.filter !== "text") {
    const options = (field as CRUDFieldSelect).options ?? [];
    return (
      <Select value={typeof value === "string" && value ? value : ALL_FILTER_VALUE} onValueChange={(v) => onChange(v === ALL_FILTER_VALUE ? null : v)}>
        <SelectTrigger className="h-7 text-xs w-full">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER_VALUE}>All</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "date" || field.type === "datetime") {
    const parts = typeof value === "string" ? value.split("|") : ["", ""];
    const from = parts[0] ?? "";
    const to = parts[1] ?? "";
    const emit = (newFrom: string, newTo: string) => {
      if (!newFrom && !newTo) { onChange(null); return; }
      onChange(`${newFrom}|${newTo}`);
    };
    return (
      <div className="flex gap-1">
        <Input type="date" value={from} onChange={(e) => emit(e.target.value, to)} className="h-7 text-xs px-1 w-full" />
        <Input type="date" value={to} onChange={(e) => emit(from, e.target.value)} className="h-7 text-xs px-1 w-full" />
      </div>
    );
  }

  if (field.type === "number" || field.type === "range") {
    return (
      <Input
        type="number"
        placeholder="Filter..."
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="h-7 text-xs w-full"
      />
    );
  }

  return (
    <Input
      type="text"
      placeholder="Filter…"
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="h-7 text-xs w-full"
    />
  );
}

function getSelectLabel(field: CRUDFieldSelect, value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const raw = String(value);
  return field.options?.find((option) => option.value === raw)?.label ?? raw;
}

/**
 * Auto-generated data table from a CRUDConfig.
 * Uses TanStack Table + shadcn/ui Table components.
 * Supports server-side sorting, column filters, and bulk row selection.
 */
export function CRUDTable({
  config,
  data,
  onEdit,
  onDelete,
  isLoading,
  sortField,
  sortDir,
  onSort,
  onRowAction,
  rowActionLabel = "Action",
  rowActionVisible,
  onDuplicate,
  emptyState,
  currentUserEmail,
  lastCreatedId,
  showCheckboxes,
  selectedIds,
  onSelectRow,
  onSelectAll,
  filters,
  onFilterChange,
}: CRUDTableProps) {
  const tableFields = config.fields.filter((f) => f.showInTable !== false);
  const hasFilterableFields = tableFields.some(isFilterableField);
  const hasActions = !!(onEdit || (onDelete && config.deletable !== false) || onRowAction || onDuplicate);

  function handleSort(field: CRUDField) {
    if (field.sortable === false || !onSort) return;
    if (sortField === field.name) {
      if (sortDir === "asc") {
        onSort(field.name, "desc");
      } else {
        // desc → unsorted: pass empty string to signal clear
        onSort("", "asc");
      }
    } else {
      onSort(field.name, "asc");
    }
  }

  const selectableIds = data
    .filter((row) => {
      const isProtected = row.protected && !row.isPendingInvite;
      const isCurrentUser = currentUserEmail && row.email === currentUserEmail;
      return !isProtected && !isCurrentUser;
    })
    .map((row) => String(row.id));

  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds?.has(id));
  const someSelected = !allSelected && selectableIds.some((id) => selectedIds?.has(id));

  const checkboxColumn: ColumnDef<Record<string, unknown>> = {
    id: "select",
    header: () => (
      <Checkbox
        checked={allSelected ? true : someSelected ? "indeterminate" : false}
        onCheckedChange={(checked) => onSelectAll?.(!!checked)}
        aria-label="Select all"
        className="translate-y-[1px]"
      />
    ),
    cell: ({ row }) => {
      const id = String(row.original.id);
      const isProtected = row.original.protected && !row.original.isPendingInvite;
      const isCurrentUser = currentUserEmail && row.original.email === currentUserEmail;
      if (isProtected || isCurrentUser) return null;
      return (
        <Checkbox
          checked={selectedIds?.has(id) ?? false}
          onCheckedChange={() => onSelectRow?.(id)}
          aria-label="Select row"
          className="translate-y-[1px]"
        />
      );
    },
  };

  const columns: ColumnDef<Record<string, unknown>>[] = [
    ...(showCheckboxes ? [checkboxColumn] : []),
    ...tableFields.map((field) => ({
      accessorKey: field.name,
      header: field.label,
      cell: ({ getValue }: { getValue: () => unknown }) => {
        const value = getValue();

        if (field.type === "boolean") {
          return (
            <Badge variant={value ? "success" : "muted"}>
              {value ? "Yes" : "No"}
            </Badge>
          );
        }

        if (field.type === "color" && typeof value === "string") {
          return (
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-4 w-4 rounded-sm border border-border"
                style={{ backgroundColor: value }}
              />
              <span className="font-mono text-xs text-muted-foreground">{value}</span>
            </span>
          );
        }

        if (field.type === "password") {
          return <span className="text-muted-foreground">••••••••</span>;
        }

        if ((field.type === "richtext" || field.type === "textarea") && typeof value === "string") {
          const plain = value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
          return <span className="text-muted-foreground text-sm line-clamp-2 max-w-[240px] inline-block">{plain.slice(0, 120) || "—"}</span>;
        }

        if (field.type === "image" && typeof value === "string") {
          const src = resolveAssetUrl(value);
          return (
            <span className="inline-block h-8 w-8 rounded border border-border overflow-hidden bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : null}
            </span>
          );
        }

        if (field.type === "file" && typeof value === "string") {
          const name = value.split("/").pop() ?? "File";
          return (
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 truncate max-w-[180px] inline-block">
              {name}
            </a>
          );
        }

        if ((field.type === "date" || field.type === "datetime") && value != null) {
          return new Date(value as string).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
        }

        if (field.type === "select" && (field as CRUDFieldSelect).display?.table === "label") {
          return getSelectLabel(field as CRUDFieldSelect, value) ?? "—";
        }

        if (value === null || value === undefined) return "—";
        return <span className="max-w-[240px] break-words inline-block">{String(value)}</span>;
      },
    })),
    ...(hasActions
      ? [
          {
            id: "actions",
            header: "",
            cell: ({ row }: { row: { original: Record<string, unknown> } }) => {
              const canDelete = onDelete &&
                config.deletable !== false &&
                !(row.original.protected && !row.original.isPendingInvite) &&
                !(currentUserEmail && row.original.email === currentUserEmail);
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 dark:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && !row.original.isPendingInvite && (
                      <DropdownMenuItem onClick={() => onEdit(row.original)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDuplicate && (
                      <DropdownMenuItem onClick={() => onDuplicate(row.original)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                    )}
                    {onRowAction && (!rowActionVisible || rowActionVisible(row.original)) && (
                      <DropdownMenuItem onClick={() => onRowAction(row.original)}>
                        {rowActionLabel}
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete!(row.original)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]
      : []),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => {
                const colIdx = showCheckboxes ? idx - 1 : idx;
                const field = colIdx >= 0 ? tableFields[colIdx] : undefined;
                const isSortable = field && field.sortable !== false && !!onSort;
                return (
                  <TableHead
                    key={header.id}
                    onClick={() => field && handleSort(field)}
                    onKeyDown={(e) => { if (isSortable && field && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleSort(field); } }}
                    tabIndex={isSortable ? 0 : undefined}
                    aria-sort={isSortable && sortField === field?.name ? (sortDir === "asc" ? "ascending" : "descending") : undefined}
                    className={isSortable ? "cursor-pointer select-none hover:text-foreground" : ""}
                  >
                    <span className="flex items-center">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {field && (
                        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
                      )}
                    </span>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
          {hasFilterableFields && onFilterChange && (
            <TableRow className="hover:bg-transparent">
              {showCheckboxes && <TableHead className="w-10 py-1" />}
              {tableFields.map((field) => (
                <TableHead key={field.name + "-filter"} className="py-1">
                  {isFilterableField(field) ? (
                    <FilterCell
                      field={field}
                      value={filters?.[field.name]}
                      onChange={(v) => onFilterChange(field.name, v)}
                    />
                  ) : null}
                </TableHead>
              ))}
              {hasActions && (
                <TableHead className="py-1" />
              )}
            </TableRow>
          )}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {showCheckboxes && <TableCell><Skeleton className="h-4 w-4" /></TableCell>}
                {tableFields.map((f) => (
                  <TableCell key={f.name}>
                    <Skeleton className="h-4" style={{ width: `${60 + (i * 17 + f.name.length * 5) % 30}%` }} />
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-[300px] text-center">
                {emptyState ?? (
                  <p className="text-sm text-muted-foreground">No {config.label.toLowerCase()} found.</p>
                )}
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.map((row) => {
            const isCurrentUser = currentUserEmail
              ? row.original.email === currentUserEmail
              : false;
            const isNew = lastCreatedId && row.original.id === lastCreatedId;
            const isSelected = selectedIds?.has(String(row.original.id));
            return (
              <TableRow
                key={row.id}
                className={isNew ? "animate-highlight" : isSelected ? "bg-primary/5" : isCurrentUser ? "bg-muted/30" : ""}
              >
                {row.getVisibleCells().map((cell, cellIdx) => {
                  const dataColIdx = showCheckboxes ? cellIdx - 1 : cellIdx;
                  return (
                    <TableCell key={cell.id} className="align-top">
                      {dataColIdx === 0 && isCurrentUser && (
                        <Badge variant="outline" className="mr-2 text-xs font-normal">You</Badge>
                      )}
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
