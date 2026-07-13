function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type SectionCardKind = "included" | "terms" | "payment" | "trust";

export const SECTION_CARD_ICONS: Record<string, string> = {
  bolt: '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>',
  star: '<path d="M12 2l2.6 6.6L21 9.2l-5 4.3L17.5 21 12 17.3 6.5 21 8 13.5l-5-4.3 6.4-.6z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  brand: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
  graphic: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/>',
  uiux: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  social: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.5M15.4 6.5l-6.8 4"/>',
  motion: '<polygon points="5 3 19 12 5 21 5 3"/>',
  video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="M22 8l-6 4 6 4z"/>',
  illus: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M2 2l7.5 7.5M2 2l4 1 1 4"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  data: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>',
};

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
