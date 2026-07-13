import { DEFAULT_ADMIN_ASSETS } from "@repo/db/default-assets";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";

async function main(): Promise<void> {
  const password = await bcrypt.hash("password", 10);

  const superAdminRole = await prisma.role.upsert({
    where: { name: "Super Admin" },
    update: {
      permissions: ["*:view", "*:create", "*:update", "*:delete"],
      protected: true,
    },
    create: {
      name: "Super Admin",
      permissions: ["*:view", "*:create", "*:update", "*:delete"],
      protected: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      name: "Admin",
      password,
      roleId: superAdminRole.id,
    },
    create: {
      email: "admin@example.com",
      name: "Admin",
      password,
      roleId: superAdminRole.id,
    },
  });

  const brandingSettings = [
    ["brandingLogoLightUrl", DEFAULT_ADMIN_ASSETS[0]?.path ?? ""],
    ["brandingLogoDarkUrl", DEFAULT_ADMIN_ASSETS[1]?.path ?? ""],
    ["brandingFaviconUrl", DEFAULT_ADMIN_ASSETS[2]?.path ?? ""],
    ["brandingAppName", "Quantyx"],
  ] as const;

  for (const [key, value] of brandingSettings) {
    await prisma.settings.upsert({
      where: { key },
      update: { namespace: "branding", value },
      create: { key, namespace: "branding", value },
    });
  }

  console.log("Seeded core admin data.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
