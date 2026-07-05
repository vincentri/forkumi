import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CRUDConfigs } from "~/crud";
import { getServerAuthSession } from "~/lib/auth";
import {
  crudModelToSlug,
  isCRUDResourceSlug,
  toClientCRUDConfig,
  type CRUDConfig,
} from "@repo/crud";
import CRUDResourceClient from "./CRUDResourceClient";

type ResourcePageProps = {
  params: Promise<{ resource: string }>;
};

const configs = Object.values(CRUDConfigs) as CRUDConfig[];

function findConfig(resource: string): CRUDConfig | null {
  return configs.find((config) => isCRUDResourceSlug(config.model, resource)) ?? null;
}

export function generateStaticParams(): Array<{ resource: string }> {
  return configs.map((config) => ({ resource: crudModelToSlug(config.model) }));
}

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { resource } = await params;
  const config = findConfig(resource);

  return {
    title: config ? `${config.label} | Admin` : "Resource not found",
  };
}

export default async function ResourcePage({
  params,
}: ResourcePageProps): Promise<React.ReactElement> {
  const { resource } = await params;
  const config = findConfig(resource);

  if (!config) {
    notFound();
  }

  const session = await getServerAuthSession();

  return (
    <CRUDResourceClient
      config={toClientCRUDConfig(config)}
      permissions={session?.user?.permissions ?? []}
      isProtectedRole={Boolean(session?.user?.isProtectedRole)}
      currentUserEmail={session?.user?.email ?? undefined}
    />
  );
}
