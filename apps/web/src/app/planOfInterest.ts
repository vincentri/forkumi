import { fetchNextOptions } from "./cache-config";

function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type PlanOfInterestOption = {
  id: string;
  name: string;
};

export async function getPlanOfInterestOptions(
  locale: "id" | "en",
): Promise<PlanOfInterestOption[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(
      `${apiOrigin()}/api/trpc/public.planOfInterest.list?input=${input}`,
      fetchNextOptions(["public:planOfInterest"]),
    );
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as {
      result?: { data?: { json?: PlanOfInterestOption[] } };
    };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}
