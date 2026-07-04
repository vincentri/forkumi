import { prisma } from "@repo/db";
import { DEFAULT_ADMIN_ASSETS } from "@repo/db/default-assets";
import assert from "node:assert";

// App-specific seed data. Lives here, NOT in @repo/db — that package seeds only
// framework built-ins (roles, admin user, branding). Run after the package seed
// (root `db:seed` chains them). Idempotent upserts.

// Default public/front-page settings for a fresh install. Namespaces group the
// keys the public site reads (general/contact/seo/scripts). Logo/favicon reuse
// the framework's default admin assets.
const DEFAULT_FRONT_PAGE_SETTINGS = [
  { key: "logo", value: DEFAULT_ADMIN_ASSETS[0].path, namespace: "general" },
  { key: "logo_dark", value: DEFAULT_ADMIN_ASSETS[1].path, namespace: "general" },
  { key: "favicon", value: DEFAULT_ADMIN_ASSETS[2].path, namespace: "general" },
  { key: "site_name", value: "Quantyx", namespace: "general" },
  { key: "whatsapp", value: "", namespace: "contact" },
  { key: "whatsapp_message", value: "", namespace: "contact" },
  { key: "meta_title", value: "Quantyx", namespace: "seo" },
  { key: "meta_description", value: "Quantyx is a framework for fullstack development", namespace: "seo" },
  { key: "meta_keywords", value: "Quantyx, framework, fullstack, development", namespace: "seo" },
  { key: "headerScript", value: "", namespace: "scripts" },
  { key: "footerScript", value: "", namespace: "scripts" },
] as const;

const DEFAULT_CONTACT_TOPICS = [
  "Rekomendasi tempat makan",
  "Umum",
  "Kerja sama / iklan",
  "Koreksi artikel",
];

// ponytail: self-check in place of a full test suite — fails loudly if the moved
// data is malformed (missing key/namespace or empty).
assert(DEFAULT_FRONT_PAGE_SETTINGS.length > 0, "front-page settings must not be empty");
for (const s of DEFAULT_FRONT_PAGE_SETTINGS) {
  assert(s.key && s.namespace, `front-page setting missing key/namespace: ${JSON.stringify(s)}`);
}

async function main() {
  console.log("apps/api — seeding app content...");

  for (const setting of DEFAULT_FRONT_PAGE_SETTINGS) {
    await prisma.frontPageSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  for (const name of DEFAULT_CONTACT_TOPICS) {
    await prisma.contactTopic.upsert({
      where: { id: name },
      update: { status: "active" },
      create: { id: name, name, status: "active" },
    });
  }

  console.log("App content seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
