function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

import { fetchNextOptions } from "./cache-config";

export async function getMarqueeItems(locale: "id" | "en"): Promise<string[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(`${apiOrigin()}/api/trpc/public.marquee.list?input=${input}`, fetchNextOptions(["public:marquee"]));
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as { result?: { data?: { json?: string[] } } };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}