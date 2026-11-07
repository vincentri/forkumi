/**
 * Where the markdown routes fetch the rendered HTML from. On Vercel the public domain sits
 * behind Cloudflare, which answers server-side self-fetches with 403, so go straight to the
 * deployment URL (protected: needs the "Protection Bypass for Automation" secret).
 */
export function selfFetchTarget(
  origin: string,
  env: Record<string, string | undefined> = process.env,
): { origin: string; headers: Record<string, string> } {
  const secret = env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (env.VERCEL_URL && secret) {
    return {
      origin: `https://${env.VERCEL_URL}`,
      headers: { "x-vercel-protection-bypass": secret },
    };
  }
  return { origin, headers: {} };
}

export function fallbackMarkdown(
  url: string,
  title: string,
  description: string,
  locale: "id" | "en",
  index: string,
): string {
  const more =
    locale === "en"
      ? `Full page content is temporarily unavailable as markdown. Open ${url} or read ${index}.`
      : `Konten lengkap halaman ini sementara tidak tersedia sebagai markdown. Buka ${url} atau baca ${index}.`;
  return `# ${title}\n\n${description}\n\n${more}`;
}
