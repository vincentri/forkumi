"use client";

import type { UseFormRegister, UseFormWatch } from "react-hook-form";
import type { CRUDFieldRange } from "../../types";

interface Props {
  field: CRUDFieldRange;
  register: UseFormRegister<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
}

export function RangeField({ field, register, watch }: Props) {
  const value = (watch(field.name) as number) ?? (field.min ?? 0);
  return (
    <div className="flex items-center gap-3">
      <input
        id={field.name}
        type="range"
        min={field.min ?? 0}
        max={field.max ?? 100}
        step={field.step ?? 1}
        {...register(field.name, { valueAsNumber: true })}
        className="w-full accent-primary"
      />
      <span className="w-10 text-right font-mono text-sm text-muted-foreground">{value}</span>
    </div>
  );
}
