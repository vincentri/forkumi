"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { TRPCClientError } from "@trpc/client";
import superjson from "superjson";
import { SessionProvider, signOut } from "next-auth/react";
import { api } from "./client";
import { AdminProvider } from "@repo/admin/ui";

function isUnauthorized(err: unknown) {
  return err instanceof TRPCClientError && err.data?.code === "UNAUTHORIZED";
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err) => {
            if (isUnauthorized(err)) void signOut({ callbackUrl: "/auth/signin" });
          },
        }),
        mutationCache: new MutationCache({
          onError: (err) => {
            if (isUnauthorized(err)) void signOut({ callbackUrl: "/auth/signin" });
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: "/api/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <SessionProvider>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AdminProvider api={api}>{children}</AdminProvider>
        </QueryClientProvider>
      </api.Provider>
    </SessionProvider>
  );
}
