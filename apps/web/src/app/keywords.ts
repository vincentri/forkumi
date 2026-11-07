/** Comma-separated meta keywords to a clean list, de-duplicated case-insensitively. */
export function parseKeywords(raw: string | null | undefined): string[] {
  const terms = new Map<string, string>();
  for (const part of (raw ?? "").split(",")) {
    const term = part.trim().replace(/\s+/g, " ");
    if (term && !terms.has(term.toLowerCase())) terms.set(term.toLowerCase(), term);
  }
  return [...terms.values()];
}
