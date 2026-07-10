import type { ReactElement } from "react";

import {
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
  resolveAssetUrl,
  safeHref,
  WHATSAPP_FALLBACK,
  INSTAGRAM_FALLBACK,
} from "../../front-page-settings";
import { getPortfolios } from "../../portfolio";
import { Breadcrumb } from "../_components/Breadcrumb";
import { CtaBand } from "../_components/CtaBand";
import { Fab } from "../_components/Fab";

type PortfolioPageProps = {
  params: Promise<{ locale: string }>;
};

const FEATURED_DEFAULTS: Record<"id" | "en", {
  badgeFeatured: string;
  badgeOther: string;
  ctaVisit: string;
  ctaDiscuss: string;
}> = {
  en: {
    badgeFeatured: "Latest Client",
    badgeOther: "Client",
    ctaVisit: "Visit Website",
    ctaDiscuss: "Discuss a Project",
  },
  id: {
    badgeFeatured: "Klien Terbaru",
    badgeOther: "Klien",
    ctaVisit: "Kunjungi Website",
    ctaDiscuss: "Diskusi Proyek",
  },
};

const H1_DEFAULTS: Record<"id" | "en", {
  line1: string;
  line2: string;
  lead: string;
}> = {
  en: {
    line1: "Our latest",
    line2: "work",
    lead: "Real work for real brands. This is Forkumi in action.",
  },
  id: {
    line1: "Karya",
    line2: "terbaru kami",
    lead: "Karya nyata untuk brand nyata. Inilah hasil kerja Forkumi.",
  },
};

const IG_DEFAULTS: Record<"id" | "en", { heading: string; paragraph: string }> = {
  en: {
    heading: "See more of our work",
    paragraph: "Fresh updates every week on Instagram.",
  },
  id: {
    heading: "Lihat lebih banyak karya kami",
    paragraph: "Update terbaru tiap minggu di Instagram.",
  },
};

const WHATSAPP_FALLBACK_URL_DEFAULT =
  "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20punya%20proyek%20desain.";

const PAGE_LABEL: Record<"id" | "en", string> = { id: "Portfolio", en: "Portfolio" };

export default async function PortfolioPage({ params }: PortfolioPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const [items, settings] = await Promise.all([
    getPortfolios(locale),
    getFrontPageSettings(locale),
  ]);

  const featuredDefaults = FEATURED_DEFAULTS[locale];
  const featuredBadge =
    firstValue(settings.featuredBadgeFeatured, featuredDefaults.badgeFeatured) ??
    featuredDefaults.badgeFeatured;
  const featuredBadgeOther =
    firstValue(settings.featuredBadgeOther, featuredDefaults.badgeOther) ??
    featuredDefaults.badgeOther;
  const featuredCtaVisit =
    firstValue(settings.featuredCtaVisit, featuredDefaults.ctaVisit) ??
    featuredDefaults.ctaVisit;
  const featuredCtaDiscuss =
    firstValue(settings.featuredCtaDiscuss, featuredDefaults.ctaDiscuss) ??
    featuredDefaults.ctaDiscuss;
  const featuredWhatsappFallback =
    settings.featuredWhatsappFallback || WHATSAPP_FALLBACK_URL_DEFAULT;

  const h1Def = H1_DEFAULTS[locale];
  const h1L1 = firstValue(settings.portfolioH1Line1, h1Def.line1) ?? h1Def.line1;
  const h1L2 = firstValue(settings.portfolioH1Line2, h1Def.line2) ?? h1Def.line2;
  const h1Hl = Number.parseInt(settings.portfolioH1HighlightIndex ?? "1", 10);
  const lead = firstValue(settings.portfolioPageLead, h1Def.lead) ?? h1Def.lead;

  const igDef = IG_DEFAULTS[locale];
  const igHeading = firstValue(settings.portfolioIgHeading, igDef.heading) ?? igDef.heading;
  const igParagraph = firstValue(settings.portfolioIgParagraph, igDef.paragraph) ?? igDef.paragraph;
  const igUrl = safeHref(settings.socialInstagramUrl, INSTAGRAM_FALLBACK);

  const fabHref = safeHref(settings.contactWhatsappUrl, WHATSAPP_FALLBACK);

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "38%", right: "9%", width: "48px" }} data-d="0.5" alt="" />
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
          {items.map((item, i) => {
            const badge = i === 0 ? featuredBadge : featuredBadgeOther;
            const isLogo = !!item.logoBg;
            const resolvedImage = resolveAssetUrl(item.image);
            const imageBlock = isLogo ? (
              <div className="pimg logo" style={{ background: item.logoBg ?? "#241C16" }}>
                <span className="pbadge">{badge}</span>
                {resolvedImage ? <img src={resolvedImage} alt={item.name} loading="lazy" /> : null}
              </div>
            ) : resolvedImage ? (
              <div className="pimg">
                <span className="ph">{item.name}</span>
                <span className="pbadge">{badge}</span>
                <img src={resolvedImage} alt={item.name} loading="lazy" />
              </div>
            ) : (
              <div className="pimg">
                <span className="ph">{item.name}</span>
                <span className="pbadge">{badge}</span>
              </div>
            );
            const primaryCta = item.url ? (
              <a className="btn primary sm" href={item.url} target="_blank" rel="noopener">
                {featuredCtaVisit} <span className="ar">➔</span>
              </a>
            ) : (
              <a className="btn primary sm" href={featuredWhatsappFallback} target="_blank" rel="noopener">
                {featuredCtaDiscuss} <span className="ar">➔</span>
              </a>
            );
            const secondaryCta = item.igUrl ? (
              <a className="btn ghost sm" href={item.igUrl} target="_blank" rel="noopener">Instagram</a>
            ) : null;
            return (
              <div key={item.id} className="port-feat reveal" style={{ marginBottom: "26px" }}>
                {imageBlock}
                <div className="port-info">
                  <h3>{item.name}</h3>
                  <div className="psub">{item.sub}</div>
                  {item.tags.length > 0 ? (
                    <div className="ptags">
                      {item.tags.map((tag, ti) => (
                        <span key={ti}>{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  <p>{item.blurb}</p>
                  <div className="port-btns">
                    {primaryCta}
                    {secondaryCta}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="ig-cta reveal">
            <div><h4>{igHeading}</h4><p>{igParagraph}</p></div>
            <a className="btn" href={igUrl} target="_blank" rel="noopener">@forkumi.design <span className="ar">➔</span></a>
          </div>
        </div>
      </section>

      <CtaBand locale={locale} settings={settings} />
      <Fab href={fabHref} />
    </>
  );
}
