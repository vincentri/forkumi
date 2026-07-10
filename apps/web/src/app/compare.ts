function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type CompareData = {
  categories: string[];
  rows: Array<{ label: string; cells: string[] }>;
};

export async function getCompareData(locale: "id" | "en"): Promise<CompareData> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(`${apiOrigin()}/api/trpc/public.compare.list?input=${input}`, {
      next: { revalidate: 60, tags: ["public:compare"] },
    });
    if (!response.ok) {
      return { categories: [], rows: [] };
    }
    const payload = await response.json() as { result?: { data?: { json?: CompareData } } };
    return payload.result?.data?.json ?? { categories: [], rows: [] };
  } catch {
    return { categories: [], rows: [] };
  }
}