function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type ServiceCategoryData = {
  id: string;
  name: string;
  tint: string;
  image: string | null;
  items: string[];
};

export async function getServiceCategories(
  locale: "id" | "en",
): Promise<ServiceCategoryData[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(
      `${apiOrigin()}/api/trpc/public.serviceCategory.list?input=${input}`,
      { next: { revalidate: 60, tags: ["public:serviceCategory"] } },
    );
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as {
      result?: { data?: { json?: ServiceCategoryData[] } };
    };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}
