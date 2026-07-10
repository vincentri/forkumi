"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactElement } from "react";

import { resolveAssetUrl } from "../../front-page-settings";

type SiteNavProps = {
  locale: "id" | "en";
  settings: Record<string, string>;
};

const NAV: Array<{ path: string; page: string; label: Record<"id" | "en", string> }> = [
  { path: "", page: "home", label: { id: "Beranda", en: "Home" } },
  { path: "/services", page: "services", label: { id: "Layanan", en: "Services" } },
  { path: "/portfolio", page: "portfolio", label: { id: "Portfolio", en: "Portfolio" } },
  { path: "/packages", page: "packages", label: { id: "Paket", en: "Packages" } },
  { path: "/about", page: "about", label: { id: "Tentang", en: "About" } },
  { path: "/contact", page: "contact", label: { id: "Kontak", en: "Contact" } },
];

const TALK: Record<"id" | "en", string> = { id: "Ngobrol yuk", en: "Let’s talk" };
const WA_FALLBACK =
  "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan.";

function localeHref(locale: "id" | "en", path: string): string {
  return `/${locale}${path}`;
}

export function SiteNav({ locale, settings }: SiteNavProps): ReactElement {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const logo = resolveAssetUrl(settings.logo) ?? "/assets/img/logo.svg";
  const ctaLabel = settings.headerCtaLabel?.trim() || TALK[locale];
  const ctaUrl = settings.headerCtaUrl?.trim() || WA_FALLBACK;

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function setLang(next: "id" | "en"): void {
    if (next === locale) return;
    localStorage.setItem("forkumi_lang", next);
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "id" || parts[0] === "en") {
      parts[0] = next;
    } else {
      parts.unshift(next);
    }
    router.push("/" + parts.join("/") + window.location.search + window.location.hash);
  }

  return (
    <nav className={scrolled ? "scrolled" : undefined} id="nav-mount">
      <Link className="brand" href={localeHref(locale, "")}>
        <img src={logo} alt="Logo" />
      </Link>
      <div className={`nav-links${open ? " open" : ""}`}>
        {NAV.map((item) => {
          const href = localeHref(locale, item.path);
          const active =
            item.path === ""
              ? pathname === `/${locale}` || pathname === `/${locale}/`
              : pathname.startsWith(`/${locale}${item.path}`);
          return (
            <Link
              key={item.page}
              href={href}
              data-page={item.page}
              className={active ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label[locale]}
            </Link>
          );
        })}
      </div>
      <div className="nav-right">
        <div className="lang">
          <button type="button" id="lang-id" className={locale === "id" ? "on" : undefined} onClick={() => setLang("id")}>
            ID
          </button>
          <button type="button" id="lang-en" className={locale === "en" ? "on" : undefined} onClick={() => setLang("en")}>
            EN
          </button>
        </div>
        <a className="talk" href={ctaUrl} target="_blank" rel="noopener">
          <span>{ctaLabel}</span> →
        </a>
        <button
          type="button"
          className="burger"
          aria-label="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
