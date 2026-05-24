"use client";

import type { UseFormRegister, UseFormWatch } from "react-hook-form";
import type { CRUDField } from "../../types";

interface Props {
  field: CRUDField;
  register: UseFormRegister<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
}

export function ColorField({ field, register, watch }: Props) {
  const value = (watch(field.name) as string) || "#000000";
  return (
    <div className="flex items-center gap-3">
      <input
        id={field.name}
        type="color"
        {...register(field.name)}
        className="h-10 w-16 cursor-pointer rounded-md border border-input p-1"
      />
      <span className="font-mono text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
