import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerAuthSession } from "~/lib/auth";
import { prisma } from "@repo/db";
import * as CRUDConfigs from "~/crud";
import { toClientCRUDConfig, type CRUDConfig, type CRUDFieldSelect, type CRUDField } from "@repo/crud";
import { derivePermissionOptions } from "@repo/admin/server";
import { customLinks } from "~/lib/customLinks";
import CRUDResourceClient from "./CRUDResourceClient";

interface ResourcePageProps {
  params: Promise<{ resource: string }>;
}

export async function generateMetadata({ params }: ResourcePageProps): Promise<Metadata> {
  const { resource } = await params;
  const configs = Object.values(CRUDConfigs).filter(
    (v): v is CRUDConfig =>
      typeof v === "object" && v !== null && "model" in v && "label" in v,
  );
  const config = configs.find((c) => c.model === resource);
  return { title: config ? `${config.label} | Admin` : "Admin" };
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { resource } = await params;

  const configs = Object.values(CRUDConfigs).filter(
    (v): v is CRUDConfig =>
      typeof v === "object" && v !== null && "model" in v && "label" in v,
  );

  let config = configs.find((c) => c.model === resource);

  if (!config) {
    notFound();
  }

  // Inject role options into UserCRUD.roleId field so it has up-to-date options at render time.
  if (config.model === "user") {
    const roles = await prisma.role.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
    const roleOptions = roles.map((r) => ({ value: r.id, label: r.name }));
    config = {
      ...config,
      fields: config.fields.map((f) =>
        f.name === "roleId" ? ({ ...f, options: roleOptions } as CRUDFieldSelect) : f,
      ),
    };
  }

  // Inject derived permission options into RoleCRUD.permissions field at render time.
  if (config.model === "role") {
    const extraPermissions = customLinks.flatMap((l) =>
      (l.permissions ?? []).map((value) => ({
        value,
        label: `${l.label} — ${value.split(":")[1]?.replace(/^\w/, (c) => c.toUpperCase()) ?? value}`,
      })),
    );
    const permissionOptions = derivePermissionOptions(configs, extraPermissions);
    config = {
      ...config,
      fields: config.fields.map((f) =>
        f.name === "permissions" ? ({ ...f, options: permissionOptions } as CRUDField) : f,
      ),
    };
  }

  const session = await getServerAuthSession();
  const permissions: string[] = session?.user?.permissions ?? [];
  const isProtectedRole: boolean = session?.user?.isProtectedRole ?? false;
  const currentUserEmail: string = session?.user?.email ?? "";

  return <CRUDResourceClient config={toClientCRUDConfig(config)} permissions={permissions} isProtectedRole={isProtectedRole} currentUserEmail={currentUserEmail} />;
}
