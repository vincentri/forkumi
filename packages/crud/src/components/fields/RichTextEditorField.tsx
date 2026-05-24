"use client";

import { useController, type Control } from "react-hook-form";
import { RichTextEditor } from "@repo/ui";
import type { CRUDField } from "../../types";

interface Props {
  field: CRUDField;
  control: Control<Record<string, unknown>>;
  readOnly?: boolean;
}

export function RichTextEditorField({ field, control, readOnly }: Props) {
  const { field: ctrl } = useController({
    name: field.name,
    control,
    defaultValue: "",
  });

  return (
    <RichTextEditor
      value={ctrl.value as string}
      onChange={ctrl.onChange}
      placeholder={field.placeholder ?? field.label}
      readOnly={readOnly}
    />
  );
}
