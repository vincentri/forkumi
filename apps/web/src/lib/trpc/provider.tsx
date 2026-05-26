"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { api as _api } from "./client";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const api = _api as any;

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createTRPCClient<any>({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/api/trpc`,
          transformer: superjson,
          fetch: (url, options) => fetch(url, { ...options, credentials: "include" }),
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </api.Provider>
  );
}
