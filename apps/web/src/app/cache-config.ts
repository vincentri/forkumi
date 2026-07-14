export function isCacheDisabled(): boolean {
  return process.env.DISABLE_CACHE === "true";
}

export function fetchNextOptions(
  tags: string[],
): { cache: "no-store" } | { next: { revalidate: number; tags: string[] } } {
  return isCacheDisabled()
    ? { cache: "no-store" }
    : { next: { revalidate: 60, tags } };
}
