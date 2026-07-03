"use client";

import { useEffect, useMemo, useState } from "react";
import type { CRUDFieldSelect } from "../../types";
import {
  Button,
  ChevronsUpDown,
  cn,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from "@repo/ui";
import type { ModelSelectApi } from "./FieldRenderer";

interface Props {
  field: CRUDFieldSelect;
  value?: string | null;
  onChange: (value: string | null) => void;
  modelApi?: ModelSelectApi;
  allValue?: string;
  allLabel?: string;
}

export function ModelSelectFilter({
  field,
  value,
  onChange,
  modelApi,
  allValue = "__all__",
  allLabel = "All",
}: Props) {
  const api = modelApi?.searchOptions;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const selectedValue = value || undefined;

  if (!api) {
    // Fallback to a static select if the parent did not pass a router.
    const staticOptions = field.options ?? [];
    const current = value ?? allValue;
    return (
      <select
        value={current}
        onChange={(e) => onChange(e.target.value === allValue ? null : e.target.value)}
        className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs"
      >
        <option value={allValue}>{allLabel}</option>
        {staticOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  const { data, isLoading } = api.useQuery(
    { field: field.name, search: debouncedSearch, selected: selectedValue },
    { enabled: open || !!selectedValue },
  );

  const options = data ?? [];

  const selectedLabel = useMemo(() => {
    if (!value) return allLabel;
    return options.find((o) => o.value === value)?.label ?? value;
  }, [options, value, allLabel]);

  const filteredOptions = useMemo(() => {
    if (!debouncedSearch) return options;
    const term = debouncedSearch.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(term) ||
        o.value.toLowerCase().includes(term),
    );
  }, [options, debouncedSearch]);

  function handleSelect(optionValue: string | null) {
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
          className="h-7 w-full justify-between px-2 text-xs font-normal"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <ScrollArea className="h-60">
          {isLoading && (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
          )}
          {!isLoading && filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No options found.</div>
          )}
          <div className="p-1">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                !value && "bg-accent text-accent-foreground",
              )}
            >
              {allLabel}
            </button>
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                  option.value === value && "bg-accent text-accent-foreground",
                )}
              >
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
