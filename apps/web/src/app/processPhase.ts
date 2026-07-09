function apiOrigin(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

export type ProcessPhaseData = {
  id: string;
  title: string;
  description: string;
  steps: string[];
};

export async function getProcessPhases(locale: "id" | "en"): Promise<ProcessPhaseData[]> {
  try {
    const input = encodeURIComponent(JSON.stringify({ json: { locale } }));
    const response = await fetch(
      `${apiOrigin()}/api/trpc/public.processPhase.list?input=${input}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return [];
    }
    const payload = await response.json() as {
      result?: { data?: { json?: ProcessPhaseData[] } };
    };
    return payload.result?.data?.json ?? [];
  } catch {
    return [];
  }
}
