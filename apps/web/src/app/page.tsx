import HomeContent from "~/components/HomeContent";
import { getContent, getPages } from "~/lib/trpc/server";
import { resolveWhatsAppHref } from "~/lib/whatsapp";
import { resolveApiPublicUrl } from "~/lib/public-url";

export default async function Home() {
  const [general, contact, pages] = await Promise.all([getContent("general"), getContent("contact"), getPages()]);
  const siteName = general.site_name || "Quantyx";
  const logo = resolveApiPublicUrl(general.logo || undefined);
  const logoDark = resolveApiPublicUrl(general.logo_dark || general.logo || undefined);
  const whatsAppHref = resolveWhatsAppHref(contact.whatsapp || "", contact.whatsapp_message || "") ?? "#contact";
  const hasWhatsApp = whatsAppHref !== "#contact";
  const navbarPages = pages.slice(0, 5).map(p => ({ slug: p.slug, title: p.title }));
  const stacks = [
    "Next.js",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Prisma",
    "tRPC",
    "Tailwind CSS",
    "Vercel",
  ];

  return (
    <HomeContent
      siteName={siteName}
      logo={logo}
      logoDark={logoDark}
      whatsAppHref={whatsAppHref}
      hasWhatsApp={hasWhatsApp}
      stacks={stacks}
      navbarPages={navbarPages}
    />
  );
}