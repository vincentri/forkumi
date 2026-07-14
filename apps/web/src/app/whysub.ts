import { fetchNextOptions } from "./cache-config";

function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type WhysubCardData = {
  icon: string;
  color: string;
  heading: string;
  paragraph: string;
};

export async function getWhysubCards(locale: "id" | "en"): Promise<WhysubCardData[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(`${apiOrigin()}/api/trpc/public.whysub.list?input=${input}`, fetchNextOptions(["public:whysub"]));
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as { result?: { data?: { json?: WhysubCardData[] } } };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}