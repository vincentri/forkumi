function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type FaqItemData = {
  id: string;
  question: string;
  answer: string;
};

export async function getFaqItems(locale: "id" | "en"): Promise<FaqItemData[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(`${apiOrigin()}/api/trpc/public.faq.list?input=${input}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as { result?: { data?: { json?: FaqItemData[] } } };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}
