"use client";

import type { UseFormRegister } from "react-hook-form";
import { Input } from "@repo/ui";
import type { CRUDField } from "../../types";

interface Props {
  field: CRUDField;
  register: UseFormRegister<Record<string, unknown>>;
}

const TYPE_MAP: Partial<Record<CRUDField["type"], string>> = {
  number: "number",
  email: "email",
  url: "url",
  date: "date",
  password: "password",
};

export function TextInputField({ field, register }: Props) {
  return (
    <Input
      id={field.name}
      type={TYPE_MAP[field.type] ?? "text"}
      {...register(field.name, field.type === "number" ? { valueAsNumber: true } : {})}
      placeholder={field.placeholder ?? field.label}
    />
  );
}
