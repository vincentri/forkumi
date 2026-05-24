"use client";

import { createContext, useContext } from "react";

const AdminApiContext = createContext<any>(null);

export function AdminProvider({
  api,
  children,
}: {
  api: unknown;
  children: React.ReactNode;
}) {
  return (
    <AdminApiContext.Provider value={api}>{children}</AdminApiContext.Provider>
  );
}

export function useAdminApi(): any {
  const api = useContext(AdminApiContext);
  if (!api)
    throw new Error("useAdminApi must be used within <AdminProvider>");
  return api;
}
