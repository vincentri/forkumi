"use client";

import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import { Switch } from "@repo/ui";
import type { CRUDField } from "../../types";

interface Props {
  field: CRUDField;
  control: Control<Record<string, unknown>>;
}

export function BooleanField({ field, control }: Props) {
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: f }) => (
        <Switch
          id={field.name}
          checked={!!f.value}
          onCheckedChange={f.onChange}
        />
      )}
    />
  );
}
