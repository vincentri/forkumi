"use client";

import { Controller, type Control } from "react-hook-form";
import type { CRUDFieldSelect } from "../../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";

interface Props {
  field: CRUDFieldSelect;
  control: Control<Record<string, unknown>>;
}

export function SelectField({ field, control }: Props) {
  const options = field.options ?? [];

  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: f }) => (
        <Select
          value={(f.value as string) ?? ""}
          onValueChange={(val) => f.onChange(val === "__none__" ? "" : val)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder={field.placeholder ?? field.label} />
          </SelectTrigger>
          <SelectContent>
            {!field.required && (
              <SelectItem value="__none__">
                <span className="text-muted-foreground">None</span>
              </SelectItem>
            )}
            {options.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );
}
