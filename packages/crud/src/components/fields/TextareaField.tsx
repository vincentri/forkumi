"use client";

import type { UseFormRegister } from "react-hook-form";
import { Textarea } from "@repo/ui";
import type { CRUDField } from "../../types";

interface Props {
  field: CRUDField;
  register: UseFormRegister<Record<string, unknown>>;
}

export function TextareaField({ field, register }: Props) {
  return (
    <Textarea
      id={field.name}
      {...register(field.name)}
      placeholder={field.placeholder ?? field.label}
      rows={3}
    />
  );
}
