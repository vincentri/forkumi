import type { ReactElement } from "react";

import {
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
  safeHref,
  WHATSAPP_FALLBACK,
} from "../../front-page-settings";
import { getFaqItems } from "../../faq";
import { getSectionCards } from "../../sectionCard";
import { FaqItem } from "../_components/FaqItem";
import { PlansSection } from "../_components/PlansSection";
import { Breadcrumb } from "../_components/Breadcrumb";
import { CtaBand } from "../_components/CtaBand";
import { Fab } from "../_components/Fab";

const SECTION_CARD_ICONS: Record<string, string> = {
  bolt: '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>',
  star: '<path d="M12 2l2.6 6.6L21 9.2l-5 4.3L17.5 21 12 17.3 6.5 21 8 13.5l-5-4.3 6.4-.6z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  brand: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
  graphic: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/>',
  uiux: '<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  social: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.5M15.4 6.5l-6.8 4"/>',
  motion: '<polygon points="5 3 19 12 5 21 5 3"/>',
  video: '<rect x="2" y="5" width="14" height="14" rx="2"/><path d="M22 8l-6 4 6 4z"/>',
  illus: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M2 2l7.5 7.5M2 2l4 1 1 4"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  data: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  insta: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>',
};

type PackagesPageProps = {
  params: Promise<{ locale: string }>;
};

const PKG_PAGE_DEFAULTS: Record<"id" | "en", {
  h1Line1: string;
  h1Line2: string;
  lead: string;
}> = {
  en: {
    h1Line1: "Pick the",
    h1Line2: "right plan",
    lead: "Transparent, flexible, no long-term lock-in. Pick, pay, we build.",
  },
  id: {
    h1Line1: "Pilih paket",
    h1Line2: "yang pas",
    lead: "Transparan, fleksibel, dan bebas ikatan jangka panjang. Pilih, bayar, kami garap.",
  },
};
const PKG_H1_HIGHLIGHT_DEFAULT = "1";

const PKG_NOTE_DEFAULTS: Record<"id" | "en", string> = {
  en: "Limited promo — normal price struck through. Pause or cancel anytime, no penalty.",
  id: "Promo terbatas — harga normal dicoret. Pause / stop kapan aja, tanpa penalti.",
};

const INCLUDED_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
}> = {
  en: {
    eye: "What’s Included",
    headLine1: "Every plan",
    headLine2: "includes",
  },
  id: {
    eye: "Yang Kamu Dapat",
    headLine1: "Semua paket",
    headLine2: "sudah termasuk",
  },
};

const TERMS_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
}> = {
  en: {
    eye: "Terms",
    headLine1: "Terms &",
    headLine2: "Payment",
  },
  id: {
    eye: "Ketentuan",
    headLine1: "Syarat &",
    headLine2: "Pembayaran",
  },
};

const FAQ_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
}> = {
  en: { eye: "FAQ", headLine1: "Still", headLine2: "unsure?" },
  id: { eye: "FAQ", headLine1: "Masih", headLine2: "ragu?" },
};

const PAGE_LABEL: Record<"id" | "en", string> = { id: "Paket", en: "Packages" };

export default async function PackagesPage({ params }: PackagesPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const [settings, faqs, included, terms, payment] = await Promise.all([
    getFrontPageSettings(locale),
    getFaqItems(locale),
    getSectionCards(locale, "included"),
    getSectionCards(locale, "terms"),
    getSectionCards(locale, "payment"),
  ]);

  const pageDef = PKG_PAGE_DEFAULTS[locale];
  const h1L1 = firstValue(settings.packagesH1Line1, pageDef.h1Line1) ?? pageDef.h1Line1;
  const h1L2 = firstValue(settings.packagesH1Line2, pageDef.h1Line2) ?? pageDef.h1Line2;
  const h1Hl = Number.parseInt(settings.packagesH1HighlightIndex ?? PKG_H1_HIGHLIGHT_DEFAULT, 10);
  const lead = firstValue(settings.packagesPageLead, pageDef.lead) ?? pageDef.lead;
  const pkgNote = firstValue(settings.pkgNote, PKG_NOTE_DEFAULTS[locale]) ?? PKG_NOTE_DEFAULTS[locale];

  const inclDef = INCLUDED_DEFAULTS[locale];
  const inclEye = firstValue(settings.packagesIncludedEye, inclDef.eye) ?? inclDef.eye;
  const inclL1 = firstValue(settings.packagesIncludedHeadLine1, inclDef.headLine1) ?? inclDef.headLine1;
  const inclL2 = firstValue(settings.packagesIncludedHeadLine2, inclDef.headLine2) ?? inclDef.headLine2;
  const inclHl = Number.parseInt(settings.packagesIncludedHeadHighlightIndex ?? "1", 10);

  const termsDef = TERMS_DEFAULTS[locale];
  const termsEye = firstValue(settings.packagesTermsEye, termsDef.eye) ?? termsDef.eye;
  const termsL1 = firstValue(settings.packagesTermsHeadLine1, termsDef.headLine1) ?? termsDef.headLine1;
  const termsL2 = firstValue(settings.packagesTermsHeadLine2, termsDef.headLine2) ?? termsDef.headLine2;
  const termsHl = Number.parseInt(settings.packagesTermsHeadHighlightIndex ?? "1", 10);

  const faqDef = FAQ_DEFAULTS[locale];
  const faqEye = firstValue(settings.faqHomeEye, faqDef.eye) ?? faqDef.eye;
  const faqL1 = firstValue(settings.faqHomeHeadLine1, faqDef.headLine1) ?? faqDef.headLine1;
  const faqL2 = firstValue(settings.faqHomeHeadLine2, faqDef.headLine2) ?? faqDef.headLine2;
  const faqHl = Number.parseInt(settings.faqHomeHeadHighlightIndex ?? "1", 10);

  const fabHref = safeHref(settings.contactWhatsappUrl, WHATSAPP_FALLBACK);

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ top: "40%", right: "10%", width: "46px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <Breadcrumb locale={locale} current={PAGE_LABEL[locale]} />
          <h1>
            <span className={h1Hl === 0 ? "hl" : undefined}>{h1L1}</span>
            <br />
            <span className={h1Hl === 1 ? "hl" : undefined}>{h1L2}</span>
          </h1>
          <p>{lead}</p>
        </div>
      </section>

      <section className="sec g-lav">
        <div className="wrap">
          <PlansSection locale={locale} />
          <p className="pnote reveal">{pkgNote}</p>
        </div>
      </section>

      <section className="sec g-pink">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{inclEye}</span>
              <h2 className="sec-head reveal">
                <span className={inclHl === 0 ? "hl" : undefined}>{inclL1}</span>
                <br />
                <span className={inclHl === 1 ? "hl" : undefined}>{inclL2}</span>
              </h2>
            </div>
          </div>
          {included.length > 0 ? (
            <div className="grid">
              {included.map((card) => {
                const iconPath = card.icon ? SECTION_CARD_ICONS[card.icon] : null;
                return (
                  <div key={card.id} className={`gcard ${card.color} reveal`}>
                    {iconPath ? (
                      <div className="ci">
                        <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: iconPath }} />
                      </div>
                    ) : null}
                    <h4>{card.heading}</h4>
                    <p>{card.paragraph}</p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="sec g-peach">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{termsEye}</span>
              <h2 className="sec-head reveal">
                <span className={termsHl === 0 ? "hl" : undefined}>{termsL1}</span>
                <br />
                <span className={termsHl === 1 ? "hl" : undefined}>{termsL2}</span>
              </h2>
            </div>
          </div>
          {terms.length > 0 ? (
            <div className="cards-flex reveal" style={{ marginBottom: "18px" }}>
              {terms.map((card) => (
                <div key={card.id} className="gcard purple reveal">
                  <h4>{card.heading}</h4>
                  <p>{card.paragraph}</p>
                </div>
              ))}
            </div>
          ) : null}
          {payment.length > 0 ? (
            <div className="cards-flex reveal">
              {payment.map((card) => (
                <div key={card.id} className="gcard rose reveal">
                  <h4>{card.heading}</h4>
                  <p>{card.paragraph}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="sec g-blue">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{faqEye}</span>
              <h2 className="sec-head reveal">
                <span className={faqHl === 0 ? "hl" : undefined}>{faqL1}</span>
                <br />
                <span className={faqHl === 1 ? "hl" : undefined}>{faqL2}</span>
              </h2>
            </div>
          </div>
          {faqs.length > 0 ? (
            <div className="faqs">
              {faqs.map((item) => (
                <FaqItem key={item.id} question={item.question} answer={item.answer} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <CtaBand locale={locale} settings={settings} />
      <Fab href={fabHref} />
    </>
  );
}
