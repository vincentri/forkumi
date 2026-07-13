function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type SectionCardKind = "included" | "terms" | "payment" | "trust";

export type SectionCardData = {
  id: string;
  section: SectionCardKind;
  color: string;
  heading: string;
  paragraph: string;
  icon: string | null;
};

export async function getSectionCards(
  locale: "id" | "en",
  section?: SectionCardKind,
): Promise<SectionCardData[]> {
  try {
    const input = encodeURIComponent(
      JSON.stringify({ json: { locale, ...(section ? { section } : {}) } }),
    );
    const response = await fetch(
      `${apiOrigin()}/api/trpc/public.sectionCard.list?input=${input}`,
      { next: { revalidate: 60, tags: ["public:sectionCard"] } },
    );
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as {
      result?: { data?: { json?: SectionCardData[] } };
    };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}
