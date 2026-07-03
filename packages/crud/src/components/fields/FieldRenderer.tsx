"use client";

import type { UseFormRegister, UseFormWatch, Control } from "react-hook-form";
import { Separator } from "@repo/ui";
import type { CRUDField, CRUDFieldMulticheck, CRUDFieldRange, CRUDFieldSelect, CRUDFieldImage, CRUDFieldFile } from "../../types";
import { BooleanField } from "./BooleanField";
import { ColorField } from "./ColorField";
import { DateTimeField } from "./DateTimeField";
import { FileUploadField } from "./FileUploadField";
import { ImageUploadField } from "./ImageUploadField";
import { ModelMultiSelectField } from "./ModelMultiSelectField";
import { ModelSelectField } from "./ModelSelectField";
import { MulticheckField } from "./MulticheckField";
import { RangeField } from "./RangeField";
import { SelectField } from "./SelectField";
import { TextInputField } from "./TextInputField";
import { TextareaField } from "./TextareaField";
import { RichTextEditorField } from "./RichTextEditorField";

export interface ModelSelectApi {
  searchOptions?: {
    useQuery: (
      input: { field: string; search?: string; selected?: string; ids?: string[] },
      opts?: { enabled?: boolean },
    ) => { data?: { label: string; value: string }[]; isLoading: boolean };
  };
}

export interface FieldRendererProps {
  field: CRUDField;
  register: UseFormRegister<Record<string, unknown>>;
  watch: UseFormWatch<Record<string, unknown>>;
  control: Control<Record<string, unknown>>;
  readOnly?: boolean;
  modelApi?: ModelSelectApi;
}

/**
 * Dispatches to the right field component based on field.type.
 * Adding a new field type: create a new component in fields/, add a case here.
 */
export function FieldRenderer({ field, register, watch, control, readOnly, modelApi }: FieldRendererProps) {
  switch (field.type) {
    case "textarea":
      return <TextareaField field={field} register={register} />;
    case "richtext":
      return <RichTextEditorField field={field} control={control} readOnly={readOnly} />;
    case "boolean":
      return <BooleanField field={field} control={control} />;
    case "select": {
      const selectField = field as CRUDFieldSelect;
      if (selectField.multiple && selectField.optionsFrom) {
        return <ModelMultiSelectField field={selectField} control={control} modelApi={modelApi} />;
      }
      if (selectField.optionsFrom) {
        return <ModelSelectField field={selectField} control={control} modelApi={modelApi} />;
      }
      return <SelectField field={selectField} control={control} />;
    }
    case "color":
      return <ColorField field={field} register={register} watch={watch} />;
    case "datetime":
      return <DateTimeField field={field} control={control} readOnly={readOnly} />;
    case "range":
      return <RangeField field={field as CRUDFieldRange} register={register} watch={watch} />;
    case "multicheck":
      return <MulticheckField field={field as CRUDFieldMulticheck} control={control} readOnly={readOnly} />;
    case "image":
      return <ImageUploadField field={field as CRUDFieldImage} control={control} readOnly={readOnly} />;
    case "file":
      return <FileUploadField field={field as CRUDFieldFile} control={control} readOnly={readOnly} />;
    case "separator":
      return <Separator className="my-2" />;
    default:
      // text, number, email, url, date, password
      return <TextInputField field={field} register={register} />;
  }
}
