function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type IndustryItemData = {
  id: string;
  name: string;
  tag: string;
};

export async function getIndustryItems(locale: "id" | "en"): Promise<IndustryItemData[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(`${apiOrigin()}/api/trpc/public.industry.list?input=${input}`, {
      next: { revalidate: 60, tags: ["public:industry"] },
    });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as { result?: { data?: { json?: IndustryItemData[] } } };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}
