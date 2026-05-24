export function crudModelToSlug(model: string): string {
  return model
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

export function isCRUDResourceSlug(model: string, slug: string): boolean {
  return slug === model || slug === crudModelToSlug(model);
}
