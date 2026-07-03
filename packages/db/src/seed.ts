import bcrypt from "bcryptjs";
import { prisma } from "./index";
import { DEFAULT_BRANDING_SETTINGS, DEFAULT_FRONT_PAGE_SETTINGS } from "./default-assets";

type FrontPageSettingSeed = {
  key: string;
  value: string;
  namespace: string;
};

type FrontPageSettingsDelegate = {
  upsert: (args: {
    where: { key: string };
    update: Record<string, never>;
    create: FrontPageSettingSeed;
  }) => Promise<unknown>;
};

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

  // Default public/front-page settings live separately from admin branding settings.
  const frontPageSettings = (prisma as unknown as { frontPageSettings: FrontPageSettingsDelegate }).frontPageSettings;
  for (const setting of DEFAULT_FRONT_PAGE_SETTINGS) {
    await frontPageSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
