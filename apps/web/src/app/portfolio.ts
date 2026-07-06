import { resolveAssetUrl } from "./front-page-settings";

export type PortfolioItem = {
  id: string;
  name: string;
  sub: string;
  blurb: string;
  image: string | null;
  logoBg: string | null;
  tags: string[];
  url: string | null;
  igUrl: string | null;
};

// ponytail: image URLs come from three sources:
//  - absolute (external CDNs like api.jajanpedia.com) → use as-is
//  - `/uploads/...` (admin uploads, lives on API or S3 in prod) → prepend storage origin
//  - `/assets/...` (web public, also pushed to S3 in prod) → prepend storage origin
// `resolveAssetUrl` covers both managed paths and falls back to API origin in local dev.
// In local dev with S3 .env, set `NEXT_PUBLIC_STORAGE_BASE_URL` to the CDN/bucket URL.
function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export async function getPortfolios(locale: "id" | "en"): Promise<PortfolioItem[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(`${apiOrigin()}/api/trpc/public.portfolio.list?input=${input}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as { result?: { data?: { json?: PortfolioItem[] } } };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}