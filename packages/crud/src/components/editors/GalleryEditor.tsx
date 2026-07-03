"use client";

import { Button, ChevronDown, ChevronUp, ImageUpload, Input, Label, Trash2 } from "@repo/ui";

export interface GalleryItem {
  url: string;
  alt?: string | null;
  position: number;
}

export interface GalleryEditorProps {
  value: GalleryItem[];
  onChange: (value: GalleryItem[]) => void;
  error?: string;
  uploadUrl: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

function reindex(items: GalleryItem[]): GalleryItem[] {
  return items.map((item, index) => ({ ...item, position: index }));
}

export function GalleryEditor({
  value,
  onChange,
  error,
  uploadUrl,
  maxSizeMB,
  disabled,
}: GalleryEditorProps) {
  const items = value ?? [];

  const updateItem = (index: number, patch: Partial<GalleryItem>) => {
    const next = items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(reindex(items.filter((_, i) => i !== index)));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(reindex(next));
  };

  const appendUpload = (url: string) => {
    if (!url) return;
    onChange(reindex([...items, { url, alt: "", position: items.length }]));
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Images</p>
        <p className="text-xs text-muted-foreground">
          Upload or paste image URLs. Use the arrows to reorder.
        </p>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item.url}-${index}`}
              className="flex items-start gap-3 rounded-md border border-border p-2"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                <img
                  src={item.url}
                  alt={item.alt ?? ""}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Alt text</Label>
                  <Input
                    value={item.alt ?? ""}
                    onChange={(event) => updateItem(index, { alt: event.target.value })}
                    placeholder="Describe this image"
                    disabled={disabled}
                  />
                </div>
                <p className="truncate text-xs text-muted-foreground" title={item.url}>
                  {item.url}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveItem(index, -1)}
                  disabled={disabled || index === 0}
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveItem(index, 1)}
                  disabled={disabled || index === items.length - 1}
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={disabled}
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!disabled && (
        <div className="rounded-md border border-dashed border-border p-3">
          <ImageUpload
            value={null}
            uploadUrl={uploadUrl}
            maxSizeMB={maxSizeMB}
            onChange={appendUpload}
            onRemove={() => undefined}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}