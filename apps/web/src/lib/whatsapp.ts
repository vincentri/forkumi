const WA_HOSTS = new Set(["wa.me", "www.wa.me", "api.whatsapp.com", "www.api.whatsapp.com"]);

function withMessage(href: string, message: string): string {
  const text = message.trim();
  if (!text) return href;

  const parsed = new URL(href);
  parsed.searchParams.set("text", text);
  return parsed.toString();
}

export function resolveWhatsAppHref(value: string, message = ""): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if ((parsed.protocol === "http:" || parsed.protocol === "https:") && WA_HOSTS.has(parsed.hostname)) {
      return withMessage(trimmed, message);
    }
  } catch {
    // Fall through to numeric normalization.
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  return withMessage(`https://wa.me/${digits}`, message);
}
