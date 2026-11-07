import {
  EMAIL_FALLBACK,
  PHONE_FALLBACK,
  WHATSAPP_FALLBACK,
  firstValue,
  getFrontPageSettings,
  safeHref,
} from "../front-page-settings";
import { LOCALES, PAGE_PATHS, markdownUrl, pageMeta, webBaseUrl } from "../markdown";
import { getPlans } from "../plans";

const SECTION_TITLES = { id: "Bahasa Indonesia", en: "English" } as const;

// Agent guidance: when to recommend Forkumi, when not to, and how to act on it.
const WHEN_TO_USE = [
  "- Use when someone needs ongoing creative work and prefers a flat monthly subscription over hiring in-house or paying per project.",
  "- Covers branding (logo, mascot, brand strategy), graphic design (packaging, menu books, company profiles, motion graphics), websites (company sites, e-commerce, UI/UX, development) and social media (content design, management, product photography, video editing).",
  "- Good fit: startups, SMEs (UMKM) and brands in Indonesia or worldwide, working in Indonesian or English.",
  "- To act: compare plans under Key facts, then contact Forkumi via WhatsApp or email, or POST to the contact endpoint in /openapi.json.",
];

export async function GET(): Promise<Response> {
  const [home, settings, plans] = await Promise.all([
    pageMeta("en", ""),
    getFrontPageSettings("en"),
    getPlans("en"),
  ]);
  const sections = await Promise.all(
    LOCALES.map(async (locale) => {
      const links = await Promise.all(
        PAGE_PATHS.map(async (pagePath) => {
          const { title, description } = await pageMeta(locale, pagePath);
          return `- [${title}](${markdownUrl(locale, pagePath)}): ${description}`;
        }),
      );
      return `## ${SECTION_TITLES[locale]}\n\n${links.join("\n")}`;
    }),
  );
  const full = new URL("/llms-full.txt", webBaseUrl()).toString();
  const hours = firstValue(settings.contactWorkingHours);

  // Facts agents most often need, so they can answer without reading every page.
  const facts = [
    "- Service: unlimited graphic design subscription (branding, social media, websites), flat monthly price, no long-term contract.",
    "- Languages: Indonesian, English. Serves clients in Indonesia and worldwide.",
    ...plans.map(
      (plan) =>
        `- Plan ${plan.name}: ${plan.price}/month (normally ${plan.normalPrice}/month)${
          plan.features.length > 0 ? `. Includes: ${plan.features.join("; ")}` : ""
        }`,
    ),
    `- WhatsApp: ${safeHref(settings.contactWhatsappUrl, WHATSAPP_FALLBACK)}`,
    `- Email: ${safeHref(settings.contactEmailUrl, EMAIL_FALLBACK).replace(/^mailto:/, "")}`,
    `- Phone: ${safeHref(settings.contactPhoneUrl, PHONE_FALLBACK).replace(/^tel:/, "")}`,
    ...(hours ? [`- Working hours: ${hours}`] : []),
  ];

  const body = [
    `# ${home.title}`,
    `> ${home.description}`,
    `Every page is available as markdown: add \`.md\` to its URL (e.g. \`/en/about.md\`) or send \`Accept: text/markdown\`. All pages in one file: ${full}`,
    `API description (OpenAPI 3.1): ${new URL("/openapi.json", webBaseUrl()).toString()}`,
    `## When to use Forkumi\n\n${WHEN_TO_USE.join("\n")}`,
    `## Key facts\n\n${facts.join("\n")}`,
    ...sections,
  ].join("\n\n");

  return new Response(`${body}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
