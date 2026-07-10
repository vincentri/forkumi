import type { ReactElement } from "react";

import {
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
  resolveAssetUrl,
  safeHref,
  WHATSAPP_FALLBACK,
} from "../../front-page-settings";
import { getIndustryItems } from "../../industry";
import { getServiceCategories } from "../../serviceCategory";
import { Breadcrumb } from "../_components/Breadcrumb";
import { CtaBand } from "../_components/CtaBand";
import { Fab } from "../_components/Fab";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

const SVC_DEFAULTS: Record<"id" | "en", {
  h1Line1: string;
  h1Line2: string;
  lead: string;
}> = {
  en: {
    h1Line1: "What we",
    h1Line2: "deliver",
    lead: "Every design service you need in one subscription.",
  },
  id: {
    h1Line1: "Yang bisa",
    h1Line2: "kami kerjakan",
    lead: "Semua layanan desain yang kamu butuhkan dalam satu langganan.",
  },
};

const CATALOG_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
}> = {
  en: {
    eye: "Full Services",
    headLine1: "Every design need,",
    headLine2: "one team",
  },
  id: {
    eye: "Layanan Lengkap",
    headLine1: "Semua kebutuhan",
    headLine2: "desainmu, satu tim",
  },
};

const IND_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
  intro: string;
}> = {
  en: {
    eye: "Industries",
    headLine1: "Industries",
    headLine2: "we serve",
    intro: "From tech startups to local SMEs — Forkumi fits every sector.",
  },
  id: {
    eye: "Industri",
    headLine1: "Industri yang",
    headLine2: "kami layani",
    intro: "Dari startup teknologi sampai UMKM lokal — desain Forkumi cocok untuk semua bidang.",
  },
};

const PAGE_LABEL: Record<"id" | "en", string> = { id: "Layanan", en: "Services" };

export default async function ServicesPage({ params }: ServicesPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const [settings, categories, industries] = await Promise.all([
    getFrontPageSettings(locale),
    getServiceCategories(locale),
    getIndustryItems(locale),
  ]);

  const svcDef = SVC_DEFAULTS[locale];
  const h1L1 = firstValue(settings.servicesH1Line1, svcDef.h1Line1) ?? svcDef.h1Line1;
  const h1L2 = firstValue(settings.servicesH1Line2, svcDef.h1Line2) ?? svcDef.h1Line2;
  const h1Hl = Number.parseInt(settings.servicesH1HighlightIndex ?? "1", 10);
  const lead = firstValue(settings.servicesPageLead, svcDef.lead) ?? svcDef.lead;

  const catDef = CATALOG_DEFAULTS[locale];
  const catEye = firstValue(settings.servicesCatalogEye, catDef.eye) ?? catDef.eye;
  const catL1 = firstValue(settings.servicesCatalogHeadLine1, catDef.headLine1) ?? catDef.headLine1;
  const catL2 = firstValue(settings.servicesCatalogHeadLine2, catDef.headLine2) ?? catDef.headLine2;
  const catHl = Number.parseInt(settings.servicesCatalogHeadHighlightIndex ?? "1", 10);

  const indDef = IND_DEFAULTS[locale];
  const indEye = firstValue(settings.servicesIndustriesEye, indDef.eye) ?? indDef.eye;
  const indL1 = firstValue(settings.servicesIndustriesHeadLine1, indDef.headLine1) ?? indDef.headLine1;
  const indL2 = firstValue(settings.servicesIndustriesHeadLine2, indDef.headLine2) ?? indDef.headLine2;
  const indHl = Number.parseInt(settings.servicesIndustriesHeadHighlightIndex ?? "1", 10);
  const indIntro = firstValue(settings.servicesIndustriesIntro, indDef.intro) ?? indDef.intro;

  const fabHref = safeHref(settings.contactWhatsappUrl, WHATSAPP_FALLBACK);

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_purple.png" style={{ top: "40%", right: "8%", width: "46px" }} data-d="0.5" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ bottom: "14%", right: "22%", width: "30px" }} data-d="0.8" alt="" />
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
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{catEye}</span>
              <h2 className="sec-head reveal">
                <span className={catHl === 0 ? "hl" : undefined}>{catL1}</span>
                <br />
                <span className={catHl === 1 ? "hl" : undefined}>{catL2}</span>
              </h2>
            </div>
          </div>
          {categories.length > 0 ? (
            <div className="svccats">
              {categories.map((card) => {
                const iconSrc = resolveAssetUrl(card.image);
                return (
                  <div key={card.id} className={`svccat ${card.tint} reveal`}>
                    {iconSrc ? <img className="ic" src={iconSrc} alt="" loading="lazy" /> : null}
                    <h3>{card.name}</h3>
                    <div className="rule"></div>
                    <ul>
                      {card.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="sec g-pink" id="industries">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{indEye}</span>
              <h2 className="sec-head reveal">
                <span className={indHl === 0 ? "hl" : undefined}>{indL1}</span>
                <br />
                <span className={indHl === 1 ? "hl" : undefined}>{indL2}</span>
              </h2>
            </div>
            <p className="intro reveal d1">{indIntro}</p>
          </div>
          {industries.length > 0 ? (
            <div>
              {industries.map((item, i) => (
                <div key={item.id} className="ind reveal">
                  <div className="n">
                    <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                    <span className="name">{item.name}</span>
                  </div>
                  <div className="tag">
                    <span className="txt">{item.tag}</span>
                    <span className="go">
                      <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </span>
                  </div>
                </div>
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
