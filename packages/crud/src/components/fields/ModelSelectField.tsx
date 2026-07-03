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
import { SelectField } from "./SelectField";
import type { ModelSelectApi } from "./FieldRenderer";

interface Props {
  field: CRUDFieldSelect;
  control: Control<Record<string, unknown>>;
  modelApi?: ModelSelectApi;
}

const NONE_VALUE = "";

export function ModelSelectField({ field, control, modelApi }: Props) {
  const api = modelApi?.searchOptions;

  // Graceful fallback if the parent forgot to pass the tRPC router (e.g., tests).
  if (!api) {
    return <SelectField field={field} control={control} />;
  }

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: f }) => (
        <ModelSelectInner
          field={field}
          value={(f.value as string) ?? NONE_VALUE}
          onChange={(val) => f.onChange(val)}
          api={api}
        />
      )}
    />
  );
}

function ModelSelectInner({
  field,
  value,
  onChange,
  api,
}: {
  field: CRUDFieldSelect;
  value: string;
  onChange: (value: string) => void;
  api: NonNullable<ModelSelectApi["searchOptions"]>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const selectedValue = value || undefined;
  const { data, isLoading } = api.useQuery(
    { field: field.name, search: debouncedSearch, selected: selectedValue },
    { enabled: !!selectedValue || open },
  );

  const options = data ?? [];

  const selectedLabel = useMemo(() => {
    if (!value) return undefined;
    return options.find((o) => o.value === value)?.label ?? value;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const list = options;
    if (!debouncedSearch) return list;
    const term = debouncedSearch.toLowerCase();
    return list.filter(
      (o) =>
        o.label.toLowerCase().includes(term) ||
        o.value.toLowerCase().includes(term),
    );
  }, [options, debouncedSearch]);

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
          className="w-full justify-between h-10 font-normal"
        >
          <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
            {selectedLabel ?? field.placeholder ?? field.label}
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {value && (
              <span
                role="button"
                aria-label="Clear selection"
                tabIndex={-1}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(NONE_VALUE);
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
          {!isLoading && filteredOptions.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No options found.</div>
          )}
          <div className="p-1">
            {!field.required && (
              <button
                type="button"
                onClick={() => handleSelect(NONE_VALUE)}
                className={cn(
                  "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                  value === NONE_VALUE && "bg-accent text-accent-foreground",
                )}
              >
                <span className="text-muted-foreground">None</span>
              </button>
            )}
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
