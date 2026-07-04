import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { DEFAULT_BRANDING_SETTINGS } from "./default-assets";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Framework built-ins only (roles, admin user, branding). App content
// (front-page settings, contact topics) is seeded app-side — see
// apps/api/scripts/seed.ts. Keep this package generic.
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
