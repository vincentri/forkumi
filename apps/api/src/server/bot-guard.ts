export const BOT_MIN_SUBMIT_MS = 2500;

export function isBotSubmission(input: { website?: string | null; _t?: number | null }, now = Date.now()): boolean {
  if (input.website?.trim()) return true;
  // ponytail: simple time-trap; move to Turnstile if smart bots still get through.
  if (typeof input._t !== "number" || !Number.isFinite(input._t) || input._t <= 0) return true;
  if (now - input._t < BOT_MIN_SUBMIT_MS) return true;
  return false;
}
