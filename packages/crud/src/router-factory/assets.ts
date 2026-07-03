import type { CRUDConfig, CRUDField, CRUDFieldFile, CRUDFieldGallery, CRUDFieldImage } from "../types";
import type { CRUDRouterOptions } from "../types";

export function assetFields(fields: CRUDField[]): Array<CRUDFieldImage | CRUDFieldFile> {
  return fields.filter((field): field is CRUDFieldImage | CRUDFieldFile =>
    field.type === "image" || field.type === "file",
  );
}

export function galleryAssetFields(fields: CRUDField[]): CRUDFieldGallery[] {
  return fields.filter((field): field is CRUDFieldGallery => field.type === "gallery");
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === "string" || value === null;
}

/**
 * If any asset field value changed between previous and next, call the consumer's
 * onAssetReplaced hook so they can clean up the old file (e.g. delete from S3).
 * For gallery fields, diff old vs new URL arrays and clean up any removed URLs.
 * Errors are logged but never thrown — a cleanup failure must not break a CRUD update.
 */
export async function cleanupReplacedAssets(
  options: CRUDRouterOptions | undefined,
  config: CRUDConfig,
  id: string | undefined,
  previousValues: Record<string, unknown> | null,
  nextData: Record<string, unknown>,
): Promise<void> {
  if (!options?.onAssetReplaced || !previousValues) return;

  // Scalar image/file fields
  for (const field of assetFields(config.fields)) {
    if (!Object.prototype.hasOwnProperty.call(nextData, field.name)) continue;

    const oldValue = previousValues[field.name];
    const newValue = nextData[field.name];
    if (typeof oldValue !== "string" || !isStringOrNull(newValue) || oldValue === newValue) continue;

    try {
      await options.onAssetReplaced({
        model: config.model,
        id,
        field,
        oldValue,
        newValue,
      });
    } catch (error) {
      console.warn(`[crud] failed to clean up replaced asset "${oldValue}"`, error);
    }
  }

  // Gallery fields: diff URL arrays
  for (const field of galleryAssetFields(config.fields)) {
    if (!Object.prototype.hasOwnProperty.call(nextData, field.name)) continue;

    const oldItems = previousValues[field.name];
    const newItems = nextData[field.name];
    if (!Array.isArray(oldItems) || !Array.isArray(newItems)) continue;

    const newUrls = new Set(
      newItems
        .map((item): string | null => {
          if (item && typeof item === "object" && "url" in item && typeof item.url === "string") {
            return item.url;
          }
          return null;
        })
        .filter((u): u is string => u !== null),
    );

    for (const oldItem of oldItems) {
      if (!oldItem || typeof oldItem !== "object" || !("url" in oldItem)) continue;
      const oldUrl = (oldItem as { url: unknown }).url;
      if (typeof oldUrl !== "string" || newUrls.has(oldUrl)) continue;

      try {
        await options.onAssetReplaced({
          model: config.model,
          id,
          field,
          oldValue: oldUrl,
          newValue: null,
        });
      } catch (error) {
        console.warn(`[crud] failed to clean up gallery asset "${oldUrl}"`, error);
      }
    }
  }
}
