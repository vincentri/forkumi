"use client";

import Link from "next/link";
import type { ReactElement } from "react";

import { resolveAssetUrl } from "../../front-page-settings";

type SiteFooterProps = {
  locale: "id" | "en";
  settings: Record<string, string>;
};

const LABELS = {
  explore: { id: "Jelajahi", en: "Explore" },
  contact: { id: "Kontak", en: "Contact" },
  follow: { id: "Ikuti kami", en: "Follow us" },
  rights: { id: "Hak cipta dilindungi.", en: "All rights reserved." },
  made: { id: "Dibuat dengan ❤ untuk brand yang bertumbuh.", en: "Made with ❤ for growing brands." },
  tag: {
    id: "Partner desain langganan untuk brand yang ingin tampil pro tanpa ribet.",
    en: "A design subscription partner for brands that want to look pro without the hassle.",
  },
  nSvc: { id: "Layanan", en: "Services" },
  nPort: { id: "Portfolio", en: "Portfolio" },
  nPkg: { id: "Paket", en: "Packages" },
  nAbout: { id: "Tentang", en: "About" },
  hours: { id: "Senin – Jumat · 09.00 – 18.00 WIB", en: "Mon – Fri · 09:00 – 18:00 GMT+7" },
} as const;

const WA =
  "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan.";
const PHONE = "tel:+6580892716";
const MAIL = "mailto:linkforkumi@gmail.com";
const IG = "https://www.instagram.com/forkumi.design/";

function pick(settings: Record<string, string>, key: string, fallback: string): string {
  const value = settings[key]?.trim();
  return value || fallback;
}

function safeHref(value: string, fallback: string): string {
  return /^(https?:|mailto:|tel:)/.test(value) ? value : fallback;
}

export function SiteFooter({ locale, settings }: SiteFooterProps): ReactElement {
  const logoFooter = resolveAssetUrl(settings.logoFooter) ?? "/assets/img/logo.svg";
  const phoneLabel = pick(settings, "contactPhoneLabel", "+65 8089 2716");
  const phoneUrl = safeHref(pick(settings, "contactPhoneUrl", PHONE), PHONE);
  const whatsappLabel = pick(settings, "contactWhatsappLabel", "WhatsApp");
  const whatsappUrl = safeHref(pick(settings, "contactWhatsappUrl", WA), WA);
  const emailLabel = pick(settings, "contactEmailLabel", "linkforkumi@gmail.com");
  const emailUrl = safeHref(pick(settings, "contactEmailUrl", MAIL), MAIL);
  const instagramLabel = pick(settings, "contactInstagramLabel", "@forkumi.design");
  const instagramUrl = safeHref(pick(settings, "contactInstagramUrl", IG), IG);
  const workingHours = pick(settings, "contactWorkingHours", LABELS.hours[locale]);
  const socialInstagramUrl = safeHref(pick(settings, "socialInstagramUrl", instagramUrl), instagramUrl);
  const socialWhatsappUrl = safeHref(pick(settings, "socialWhatsappUrl", whatsappUrl), whatsappUrl);
  const socialEmailUrl = safeHref(pick(settings, "socialEmailUrl", emailUrl), emailUrl);

  return (
    <footer id="footer-mount">
      <div className="wrap">
        <div className="fcols">
          <div>
            <div className="fbrand">
              <img src={logoFooter} alt="Logo" />
            </div>
            <p className="ftag">{pick(settings, "footerTagline", LABELS.tag[locale])}</p>
          </div>
          <div>
            <h5>{pick(settings, "footerExploreHeading", LABELS.explore[locale])}</h5>
            <Link href={`/${locale}/services`}>{LABELS.nSvc[locale]}</Link>
            <Link href={`/${locale}/portfolio`}>{LABELS.nPort[locale]}</Link>
            <Link href={`/${locale}/packages`}>{LABELS.nPkg[locale]}</Link>
            <Link href={`/${locale}/about`}>{LABELS.nAbout[locale]}</Link>
          </div>
          <div>
            <h5>{pick(settings, "footerContactHeading", LABELS.contact[locale])}</h5>
            <a href={whatsappUrl} target="_blank" rel="noopener">{whatsappLabel}</a>
            <a href={phoneUrl}>{phoneLabel}</a>
            <a href={emailUrl}>{emailLabel}</a>
            <a href={instagramUrl} target="_blank" rel="noopener">{instagramLabel}</a>
            <p>{workingHours}</p>
          </div>
          <div>
            <h5>{pick(settings, "footerFollowHeading", LABELS.follow[locale])}</h5>
            <div className="fsoc">
              <a href={socialInstagramUrl} target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /></svg>
              </a>
              <a href={socialWhatsappUrl} target="_blank" rel="noopener" aria-label="WhatsApp">
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </a>
              <a href={socialEmailUrl} aria-label="Email">
                <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="fbot">
          <span>
            © {new Date().getFullYear()}.{" "}
            <span>{pick(settings, "footerCopyrightText", pick(settings, "footerRightsText", LABELS.rights[locale]))}</span>
          </span>
          <span>{pick(settings, "footerMadeText", LABELS.made[locale])}</span>
        </div>
      </div>
    </footer>
  );
}
