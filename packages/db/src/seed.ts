import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_BRANDING_SETTINGS = [
  { key: "brandingAppName", value: "Quantyx" },
  { key: "brandingLogoLightUrl", value: "/defaults/admin/default-logo-light.png" },
  { key: "brandingLogoDarkUrl", value: "/defaults/admin/default-logo-dark.png" },
  { key: "brandingFaviconUrl", value: "/defaults/admin/default-favicon.png" },
  { key: "brandingLoginTitle", value: "Everything you need\nto run your app." },
  { key: "brandingLoginSubtitle", value: "Users, roles, permissions—everything in one place." },
];

async function main() {
  console.log("Quantyx — seeding database...");

  const hash = await bcrypt.hash("password", 10);

  // Step 1: Create roles FIRST (before any user upsert)
  // "super admin" is the protected built-in role — cannot be edited or deleted
  const superAdminRole = await prisma.role.upsert({
    where: { name: "super admin" },
    update: {}, // never change permissions of the protected role via seed
    create: {
      name: "super admin",
      permissions: ["*:view", "*:create", "*:update", "*:delete"],
      protected: true,
    },
  });

  await prisma.role.upsert({
    where: { name: "viewer" },
    update: {},
    create: {
      name: "viewer",
      permissions: ["*:view"],
      protected: false,
    },
  });

  // Step 2: Upsert admin user — always connect to super admin role
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: { connect: { id: superAdminRole.id } } },
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: hash,
      role: { connect: { id: superAdminRole.id } },
    },
  });

  // Default branding for fresh installs. Existing projects keep their uploaded values.
  for (const setting of DEFAULT_BRANDING_SETTINGS) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        ...setting,
        namespace: "branding",
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
