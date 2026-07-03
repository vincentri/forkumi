"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, type Control } from "react-hook-form";
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
  X,
} from "@repo/ui";
import type { ModelSelectApi } from "./FieldRenderer";

interface Props {
  field: CRUDFieldSelect;
  control: Control<Record<string, unknown>>;
  modelApi?: ModelSelectApi;
}

export function ModelMultiSelectField({ field, control, modelApi }: Props) {
  const api = modelApi?.searchOptions;

  if (!api) {
    return (
      <Controller
        name={field.name}
        control={control}
        render={({ field: f }) => (
          <div className="text-sm text-muted-foreground p-2 border rounded-md">
            Multi-select unavailable (no API)
          </div>
        )}
      />
    );
  }

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: f }) => (
        <ModelMultiSelectInner
          field={field}
          value={Array.isArray(f.value) ? (f.value as string[]) : []}
          onChange={(val) => f.onChange(val)}
          api={api}
        />
      )}
    />
  );
}

function ModelMultiSelectInner({
  field,
  value,
  onChange,
  api,
}: {
  field: CRUDFieldSelect;
  value: string[];
  onChange: (value: string[]) => void;
  api: NonNullable<ModelSelectApi["searchOptions"]>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: selectedData } = api.useQuery(
    { field: field.name, ids: value },
    { enabled: value.length > 0 },
  );

  const { data: searchData, isLoading } = api.useQuery(
    { field: field.name, search: debouncedSearch },
    { enabled: open },
  );

  const selectedLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of selectedData ?? []) map.set(opt.value, opt.label);
    return map;
  }, [selectedData]);

  const options = useMemo(() => searchData ?? [], [searchData]);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((id) => {
            const label = selectedLabelMap.get(id) ?? id;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-0.5 text-xs font-medium"
              >
                {label}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  className="ml-0.5 rounded-sm opacity-60 hover:opacity-100 focus:outline-none"
                  aria-label={`Remove ${label}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setSearch(""); setDebouncedSearch(""); } }}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-10 font-normal"
          >
            <span className="text-muted-foreground text-sm">
              {value.length === 0 ? (field.placeholder ?? `Select ${field.label}…`) : `${value.length} selected`}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              {value.length > 0 && (
                <span
                  role="button"
                  aria-label="Clear all selections"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([]);
                    setSearch("");
                    setDebouncedSearch("");
                  }}
                  className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="z-[70] w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
          onWheel={(event) => event.stopPropagation()}
          onWheelCapture={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          onTouchMoveCapture={(event) => event.stopPropagation()}
        >
          <div className="p-2">
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
          <ScrollArea
            className="h-60 overscroll-contain"
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
          >
            {isLoading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
            )}
            {!isLoading && options.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">No options found.</div>
            )}
            <div className="p-1">
              {options.map((option) => {
                const selected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggle(option.value)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                      selected && "bg-accent/50",
                    )}
                  >
                    <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border", selected && "bg-primary border-primary text-primary-foreground")}>
                      {selected && <span className="text-xs leading-none">✓</span>}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
