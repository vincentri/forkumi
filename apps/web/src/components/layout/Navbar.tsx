"use client";

import Link from "next/link";
import Image from "next/image";
import type { Page } from "~/lib/trpc/server";
import { resolveApiPublicUrl } from "~/lib/public-url";

const DEFAULT_SITE_LOGO = "/defaults/admin/default-logo-light.png";

export default function Navbar({
  logo,
  siteName = "Quantyx",
  pages = [],
}: {
  logo?: string;
  siteName?: string;
  pages?: Pick<Page, "slug" | "title">[];
} = {}) {
  const logoSrc = resolveApiPublicUrl(logo || DEFAULT_SITE_LOGO);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="inline-flex items-center">
          <Image
            src={logoSrc}
            alt="Site logo"
            width={140}
            height={44}
            className="h-9 w-auto object-contain"
            loading="eager"
            fetchPriority="high"
          />
          <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 lg:inline ml-4">{siteName}</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm text-slate-600">
          {pages.map((page) => (
            <Link key={page.slug} href={`/${page.slug}`} className="transition hover:text-slate-950">
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
