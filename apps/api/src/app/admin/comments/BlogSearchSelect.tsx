"use client";

import { useEffect, useMemo, useState } from "react";
import { useAdminApi } from "@repo/admin/ui";
import {
  Button,
  ChevronsUpDown,
  cn,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  X,
} from "@repo/ui";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Standalone searchable blog picker (select2-style), mirroring the combobox
 * used inside CRUD forms (packages/crud/.../ModelSelectField.tsx) but without
 * react-hook-form. Debounced server search via comment.searchBlogs.
 */
export function BlogSearchSelect({ value, onChange, placeholder = "All posts" }: Props) {
  const api = useAdminApi();
  const searchBlogs = api.admin.comment.searchBlogs;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const selectedValue = value || undefined;
  const { data, isLoading } = searchBlogs.useQuery(
    { search: debouncedSearch, selected: selectedValue },
    { enabled: !!selectedValue || open },
  );

  const options: Option[] = (data as Option[] | undefined) ?? [];

  const selectedLabel = useMemo(() => {
    if (!value) return undefined;
    return options.find((o) => o.value === value)?.label ?? value;
  }, [options, value]);

  function handleSelect(optionValue: string) {
    onChange(optionValue);
    setOpen(false);
    setSearch("");
    setDebouncedSearch("");
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-64 justify-between font-normal"
        >
          <span className={cn("min-w-0 flex-1 truncate text-left", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {value && (
              <span
                role="button"
                aria-label="Clear selection"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                  setSearch("");
                  setDebouncedSearch("");
                }}
                className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search posts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <ScrollArea className="h-60">
          {isLoading && <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && options.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No posts found.</div>
          )}
          <div className="p-1">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                value === "" && "bg-accent text-accent-foreground",
              )}
            >
              <span className="text-muted-foreground">All posts</span>
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                  option.value === value && "bg-accent text-accent-foreground",
                )}
              >
                <span className="whitespace-normal break-words text-left">{option.label}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
