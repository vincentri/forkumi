import { fetchNextOptions } from "./cache-config";

function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type PlanItem = {
  id: string;
  name: string;
  color: string;
  price: string;
  normalPrice: string;
  best: boolean;
  ctaUrl: string | null;
  features: string[];
};

export async function getPlans(locale: "id" | "en"): Promise<PlanItem[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(`${apiOrigin()}/api/trpc/public.plan.list?input=${input}`, fetchNextOptions(["public:plan"]));
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as { result?: { data?: { json?: PlanItem[] } } };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}