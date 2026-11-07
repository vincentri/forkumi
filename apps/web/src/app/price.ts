const MULTIPLIERS: Record<string, number> = { k: 1e3, rb: 1e3, jt: 1e6 };

const CURRENCIES: Array<[RegExp, string]> = [
  [/\b(rp|idr)\b/i, "IDR"],
  [/\b(sgd|s\$)/i, "SGD"],
  [/\b(usd|us\$)|\$/i, "USD"],
];

/**
 * Parses free-text CMS prices ("Rp 1.500k", "USD 299", "Rp 1,5jt") for structured data.
 * ponytail: heuristic, separator + exactly 3 digits = thousands, else decimal. Returns
 * undefined when the currency or number is unclear, so the schema omits the price
 * instead of stating a wrong one.
 */
export function parsePrice(text: string): { price: number; currency: string } | undefined {
  const currency = CURRENCIES.find(([pattern]) => pattern.test(text))?.[1];
  const match = /(\d[\d.,]*)\s*(k|rb|jt)?\b/i.exec(text);
  if (!currency || !match) return undefined;
  const [, raw, suffix] = match;
  const normalized = raw.replace(/[.,](?=\d{3}(?!\d))/g, "").replace(",", ".");
  const price = Number(normalized) * (MULTIPLIERS[suffix?.toLowerCase() ?? ""] ?? 1);
  return Number.isFinite(price) && price > 0
    ? { price: Number(price.toFixed(2)), currency }
    : undefined;
}
