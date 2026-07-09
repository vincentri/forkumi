"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactElement } from "react";

type SoftNavInterceptorProps = {
  locale: "id" | "en";
};

function isExternal(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.startsWith("javascript:")
  );
}

function resolveInternalHref(locale: "id" | "en", href: string): string | null {
  if (!href || isExternal(href)) return null;
  if (href.startsWith(`/${locale}/`) || href === `/${locale}` || href === `/${locale}/`) {
    return href;
  }
  if (/^\/(id|en)(\/|$)/.test(href)) return href;
  if (href.startsWith("/")) return `/${locale}${href === "/" ? "" : href}`;
  // relative like "packages" or "../packages"
  if (href === "packages" || href.endsWith("/packages")) return `/${locale}/packages`;
  if (href === "contact" || href.endsWith("/contact")) return `/${locale}/contact`;
  if (href === "portfolio" || href.endsWith("/portfolio")) return `/${locale}/portfolio`;
  if (href === "services" || href.endsWith("/services")) return `/${locale}/services`;
  if (href === "about" || href.endsWith("/about")) return `/${locale}/about`;
  if (href === ".." || href === "../" || href === "./") return `/${locale}`;
  return null;
}

export function SoftNavInterceptor({ locale }: SoftNavInterceptorProps): ReactElement | null {
  const router = useRouter();

  useEffect(() => {
    function onClick(event: MouseEvent): void {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      const next = resolveInternalHref(locale, href);
      if (!next) return;
      event.preventDefault();
      router.push(next);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [locale, router]);

  return null;
}
