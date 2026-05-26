"use client";

import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Input } from "@repo/ui";
import type { CRUDField } from "../../types";

interface Props {
  field: CRUDField;
  control: Control<Record<string, unknown>>;
  readOnly?: boolean;
}

function formatDateTimeLocal(value: unknown): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function parseDateTimeLocal(value: string): Date | undefined {
  return value ? new Date(value) : undefined;
}

export function DateTimeField({ field, control, readOnly }: Props) {
  return (
    <Controller
      name={field.name}
      control={control}
      render={({ field: controllerField }) => (
        <Input
          id={field.name}
          type="datetime-local"
          value={formatDateTimeLocal(controllerField.value)}
          onChange={(event) => controllerField.onChange(parseDateTimeLocal(event.target.value))}
          onBlur={controllerField.onBlur}
          name={controllerField.name}
          ref={controllerField.ref}
          placeholder={field.placeholder ?? field.label}
          disabled={readOnly}
        />
      )}
    />
  );
}
