import Link from "next/link";
import Image from "next/image";
import { getContent } from "~/lib/trpc/server";
import { resolveApiPublicUrl } from "~/lib/public-url";

const DEFAULT_SITE_LOGO = "/defaults/admin/default-logo-light.png";

export default async function Footer() {
  const data = await getContent("general");
  const logoSrc = resolveApiPublicUrl(data.logo || DEFAULT_SITE_LOGO);

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center md:flex-row md:text-left">
        <Link href="/" className="inline-flex items-center">
          <Image src={logoSrc} alt="Site logo" width={140} height={44} className="h-9 w-auto object-contain" />
        </Link>
        <div className="text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Default Template. All rights reserved.</p>
          <p className="mt-1">Powered by Quantyx</p>
        </div>
      </div>
    </footer>
  );
}
