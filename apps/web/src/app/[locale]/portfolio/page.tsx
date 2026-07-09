import type { ReactElement } from "react";

import { getPortfolios } from "../../portfolio";
import {
  firstValue,
  getFrontPageSettings,
  resolveAssetUrl,
} from "../../front-page-settings";

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

const WHATSAPP_FALLBACK_URL_DEFAULT =
  "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20punya%20proyek%20desain.";

export default async function PortfolioPage({ params }: PortfolioPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "en" ? "en" : "id";
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

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "38%", right: "9%", width: "48px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <span className="crumb"><a href="../" data-i="nHome"></a> / <span data-i="nPort"></span></span>
          <h1 data-head="featHead"></h1>
          <p data-i="pagePortLead"></p>
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
            <div><h4 data-i="igH"></h4><p data-i="igP"></p></div>
            <a className="btn" href="#" target="_blank" rel="noopener" data-frontpage-instagram>@forkumi.design <span className="ar">➔</span></a>
          </div>
        </div>
      </section>
      
      <section className="cta-sec">
        <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ top: "20%", left: "14%", width: "44px" }} data-d="0.6" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ bottom: "18%", right: "16%", width: "52px" }} data-d="0.7" alt="" />
        <div className="wrap">
          <span className="eyebrow center" style={{ color: "var(--gold)", justifyContent: "center", width: "100%" }} data-i="ctaEye"></span>
          <h2 className="reveal" data-head="ctaHead" style={{ margin: "14px 0 0" }}></h2>
          <p className="sub reveal d1" data-i="ctaSub"></p>
          <div className="cta reveal d2">
            <a className="btn primary" href="#" target="_blank" rel="noopener" data-frontpage-cta-primary><span data-i="ctaBtn"></span> <span className="ar">➔</span></a>
            <a className="btn ghost" href="#" data-frontpage-cta-secondary><span data-i="ctaBtn2"></span></a>
          </div>
        </div>
      </section>
      
      <a className="fab" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener" title="WhatsApp" data-frontpage-whatsapp><span className="icon-dot" aria-hidden="true" /></a>
    </>
  );
}
