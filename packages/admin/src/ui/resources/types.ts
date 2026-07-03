import type { QueryState } from "@repo/crud";

/**
 * Minimal structural type for the tRPC router shape that CRUDResourceClient expects.
 * Keep it loose on purpose — the actual router is generated per-app and tRPC's
 * inferred types aren't available at the package boundary. Callers can pass any
 * router that exposes the standard `list` / `create` / `update` / `delete` / `bulkDelete`
 * / `options` / `searchOptions` / `exportCsv` procedures.
 */
export type CRUDRouter = {
  list: { useQuery: (input: QueryState, opts?: { refetchOnMount?: "always" | boolean; gcTime?: number }) => { data: any; isLoading: boolean; isError: boolean; refetch: () => void } };
  options?: { useQuery: (input?: undefined, opts?: { enabled?: boolean; refetchOnMount?: "always" | boolean; gcTime?: number }) => { data?: Record<string, Array<{ value: string; label: string }>>; isLoading: boolean; isError: boolean; refetch: () => void } };
  searchOptions?: { useQuery: (input: { field: string; search?: string; selected?: string; ids?: string[] }, opts?: { enabled?: boolean }) => { data?: Array<{ value: string; label: string }>; isLoading: boolean } };
  exportCsv?: { useMutation: () => { mutateAsync: (input: Pick<QueryState, "sortField" | "sortDir" | "filters">) => Promise<{ filename: string; csv: string }> } };
  create?: { useMutation: (opts: { onSuccess: () => void }) => { mutateAsync: (data: Record<string, unknown>) => Promise<unknown> } };
  update?: { useMutation: (opts: { onSuccess: () => void }) => { mutateAsync: (input: { id: string; data: Record<string, unknown> }) => Promise<unknown> } };
  delete?: { useMutation: (opts: { onSuccess: () => void }) => { mutateAsync: (input: { id: string }) => Promise<unknown> } };
  bulkDelete?: { useMutation: (opts: { onSuccess: () => void }) => { mutateAsync: (input: { ids: string[] }) => Promise<unknown> } };
};
