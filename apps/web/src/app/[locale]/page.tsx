import type { Metadata } from "next";
import { Fragment, type ReactElement } from "react";

import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
  resolveAssetUrl,
  safeHref,
} from "../front-page-settings";
import { getMarqueeItems } from "../marquee";
import { WhySubscribeSection } from "./_components/WhySubscribeSection";
import { PlansSection } from "./_components/PlansSection";
import { FaqCollapse } from "./_components/FaqCollapse";
import { FaqItem } from "./_components/FaqItem";
import { getPortfolios, type PortfolioItem } from "../portfolio";
import { getFaqItems } from "../faq";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const HERO_DEFAULTS: Record<"id" | "en", {
  stamp: string;
  titleLine1: string;
  titleLine2: string;
  titleLine3: string;
  subtitle: string;
  primaryLabel: string;
  secondaryLabel: string;
  scrollText: string;
}> = {
  en: {
    stamp: "INDONESIA · WORLDWIDE",
    titleLine1: "Unlimited",
    titleLine2: "design",
    titleLine3: "for brands on the rise",
    subtitle:
      "Your design subscription for startups & SMEs. One monthly price, unlimited requests, premium-quality design — zero drama.",
    primaryLabel: "Get Started",
    secondaryLabel: "View Packages",
    scrollText: "Scroll",
  },
  id: {
    stamp: "INDONESIA · GLOBAL",
    titleLine1: "Desain",
    titleLine2: "tanpa batas",
    titleLine3: "buat brand yang naik kelas",
    subtitle:
      "Partner desain langganan buat startup & UMKM. Satu harga bulanan, request sepuasnya, kualitas desain premium — tanpa drama.",
    primaryLabel: "Mulai Sekarang",
    secondaryLabel: "Lihat Paket",
    scrollText: "Gas scroll",
  },
};

const HERO_HIGHLIGHT_INDEX_DEFAULT = "1";
const HERO_SECONDARY_URL_DEFAULT = "packages";
const HERO_MASCOT_FALLBACK = "/assets/img/mascot.png";
const HERO_WHATSAPP_FALLBACK =
  "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan.";

const WHY_FORKUMI_DEFAULTS: Record<"id" | "en", {
  eye: string;
  head: string;
  labels: [string, string, string, string];
  units: [string, string, string, string];
}> = {
  en: {
    eye: "Why Forkumi",
    head: "Real results, zero drama",
    labels: ["First design", "Unlimited revisions", "Long-term lock-in", "Files are yours"],
    units: ["H", "", "", ""],
  },
  id: {
    eye: "Kenapa Forkumi",
    head: "Hasil nyata, tanpa drama",
    labels: ["Desain pertama", "Revisi sepuasnya", "Ikatan jangka panjang", "File jadi milikmu"],
    units: ["JAM", "", "", ""],
  },
};

const WHY_FORKUMI_NUMS = ["≤24", "∞", "0", "100%"] as const;
const WHY_FORKUMI_BG_COLORS = ["var(--card-purple)", "var(--card-rose)", "var(--card-yellow)", "var(--card-purple)"] as const;
const WHY_FORKUMI_TEXT_COLORS = ["var(--purple)", "var(--rose)", "#EFC75E", "var(--purple)"] as const;

const WORK_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
  intro: string;
}> = {
  en: {
    eye: "Portfolio",
    headLine1: "Our latest",
    headLine2: "work",
    intro: "Our latest client — plus plenty more on Instagram.",
  },
  id: {
    eye: "Portfolio",
    headLine1: "Karya",
    headLine2: "terbaru kami",
    intro: "Klien terbaru kami — dan masih banyak lagi di Instagram.",
  },
};

const WORK_HIGHLIGHT_INDEX_DEFAULT = "1";
const FEATURED_DEFAULTS: Record<"id" | "en", {
  badgeFeatured: string;
  badgeOther: string;
  ctaVisit: string;
  ctaDiscuss: string;
  ctaSeeAll: string;
}> = {
  en: {
    badgeFeatured: "Latest Client",
    badgeOther: "Client",
    ctaVisit: "Visit Website",
    ctaDiscuss: "Discuss a Project",
    ctaSeeAll: "See all",
  },
  id: {
    badgeFeatured: "Klien Terbaru",
    badgeOther: "Klien",
    ctaVisit: "Kunjungi Website",
    ctaDiscuss: "Diskusi Proyek",
    ctaSeeAll: "Lihat semua",
  },
};
const PKG_HIGHLIGHT_INDEX_DEFAULT = "1";

const CTA_BAND_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
  sub: string;
  btnPrimary: string;
  btnSecondary: string;
  btnPrimaryUrl: string;
  btnSecondaryUrl: string;
}> = {
  en: {
    eye: "Let's build",
    headLine1: "Got a project",
    headLine2: "in mind?",
    sub: "Free consult & fast replies. Flexible & no lock-in, start this week.",
    btnPrimary: "Let's talk",
    btnSecondary: "View Packages",
    btnPrimaryUrl: "https://wa.me/6580892716?text=Hi%20Forkumi!%20I%20have%20a%20design%20project.",
    btnSecondaryUrl: "packages",
  },
  id: {
    eye: "Ayo mulai",
    headLine1: "Punya proyek",
    headLine2: "desain?",
    sub: "Konsultasi gratis & respons cepat. Fleksibel & bebas ikatan, bisa mulai minggu ini.",
    btnPrimary: "Ngobrol yuk",
    btnSecondary: "Lihat Paket",
    btnPrimaryUrl: "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20punya%20proyek%20desain.",
    btnSecondaryUrl: "packages",
  },
};
const CTA_BAND_HEAD_HIGHLIGHT_DEFAULT = "1";
const WHATSAPP_FALLBACK_URL_DEFAULT = "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20punya%20proyek%20desain.";

const FAQ_HOME_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
}> = {
  en: { eye: "FAQ", headLine1: "Still", headLine2: "unsure?" },
  id: { eye: "FAQ", headLine1: "Masih", headLine2: "ragu?" },
};
const FAQ_HOME_HEAD_HIGHLIGHT_DEFAULT = "1";

const PKG_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
  intro: string;
  note: string;
}> = {
  en: {
    eye: "Packages",
    headLine1: "Pick the",
    headLine2: "right plan",
    intro: "Flat monthly price, no hidden fees. Pause or cancel anytime.",
    note: "Limited promo — normal price struck through. Pause or cancel anytime, no penalty.",
  },
  id: {
    eye: "Paket",
    headLine1: "Pilih paket",
    headLine2: "yang pas",
    intro: "Harga tetap bulanan, tanpa biaya tersembunyi. Pause atau stop kapan aja.",
    note: "Promo terbatas — harga normal dicoret. Pause / stop kapan aja, tanpa penalti.",
  },
};

function pickFeatured(items: PortfolioItem[], id: string | undefined): PortfolioItem[] {
  if (!id) {
    return [];
  }
  const match = items.find((item) => item.id === id);
  return match ? [match] : [];
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const settings = await getFrontPageSettings(locale);
  const title = firstValue(settings.homePageSeoMetaTitle, settings.meta_title) ?? DEFAULT_TITLE;
  const description =
    firstValue(settings.homePageSeoMetaDescription, settings.meta_description) ?? DEFAULT_DESCRIPTION;
  const keywords = firstValue(settings.homePageSeoMetaKeywords, settings.meta_keywords);

  return {
    title,
    description,
    keywords,
    alternates: {
      languages: {
        id: "/id/",
        en: "/en/",
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const settings = await getFrontPageSettings(locale);
  const defaults = HERO_DEFAULTS[locale];

  const whatsappUrl = safeHref(settings.contactWhatsappUrl, HERO_WHATSAPP_FALLBACK);

  const stamp = firstValue(settings.heroStamp, defaults.stamp) ?? defaults.stamp;
  const titleLines = [
    firstValue(settings.heroTitleLine1, defaults.titleLine1) ?? defaults.titleLine1,
    firstValue(settings.heroTitleLine2, defaults.titleLine2) ?? defaults.titleLine2,
    firstValue(settings.heroTitleLine3, defaults.titleLine3) ?? defaults.titleLine3,
  ];
  const highlightIndex = Number.parseInt(
    settings.heroTitleHighlightIndex ?? HERO_HIGHLIGHT_INDEX_DEFAULT,
    10,
  );
  const subtitle = firstValue(settings.heroSubtitle, defaults.subtitle) ?? defaults.subtitle;
  const primaryLabel =
    firstValue(settings.heroCtaPrimaryLabel, defaults.primaryLabel) ?? defaults.primaryLabel;
  const secondaryLabel =
    firstValue(settings.heroCtaSecondaryLabel, defaults.secondaryLabel) ?? defaults.secondaryLabel;
  const secondaryUrl = settings.heroCtaSecondaryUrl || HERO_SECONDARY_URL_DEFAULT;
  const mascotSrc = resolveAssetUrl(settings.heroImage) ?? HERO_MASCOT_FALLBACK;
  const scrollText = firstValue(settings.heroScrollText, defaults.scrollText) ?? defaults.scrollText;
  const marqueeItems = await getMarqueeItems(locale);

  const workDefaults = WORK_DEFAULTS[locale];
  const workEye = firstValue(settings.workEye, workDefaults.eye) ?? workDefaults.eye;
  const workHeadLine1 =
    firstValue(settings.workHeadLine1, workDefaults.headLine1) ?? workDefaults.headLine1;
  const workHeadLine2 =
    firstValue(settings.workHeadLine2, workDefaults.headLine2) ?? workDefaults.headLine2;
  const workHighlightIndex = Number.parseInt(
    settings.workHeadHighlightIndex ?? WORK_HIGHLIGHT_INDEX_DEFAULT,
    10,
  );
  const workIntro = firstValue(settings.workIntro, workDefaults.intro) ?? workDefaults.intro;

  const pkgDefaults = PKG_DEFAULTS[locale];
  const pkgEye = firstValue(settings.pkgEye, pkgDefaults.eye) ?? pkgDefaults.eye;
  const pkgHeadLine1 =
    firstValue(settings.pkgHeadLine1, pkgDefaults.headLine1) ?? pkgDefaults.headLine1;
  const pkgHeadLine2 =
    firstValue(settings.pkgHeadLine2, pkgDefaults.headLine2) ?? pkgDefaults.headLine2;
  const pkgHighlightIndex = Number.parseInt(
    settings.pkgHeadHighlightIndex ?? PKG_HIGHLIGHT_INDEX_DEFAULT,
    10,
  );
  const pkgIntro = firstValue(settings.pkgIntro, pkgDefaults.intro) ?? pkgDefaults.intro;

  const featuredDefaults = FEATURED_DEFAULTS[locale];
  const featuredBadge =
    firstValue(settings.featuredBadgeFeatured, featuredDefaults.badgeFeatured) ??
    featuredDefaults.badgeFeatured;
  const featuredBadgeOther =
    firstValue(settings.featuredBadgeOther, featuredDefaults.badgeOther) ?? featuredDefaults.badgeOther;
  const featuredCtaVisit =
    firstValue(settings.featuredCtaVisit, featuredDefaults.ctaVisit) ?? featuredDefaults.ctaVisit;
  const featuredCtaDiscuss =
    firstValue(settings.featuredCtaDiscuss, featuredDefaults.ctaDiscuss) ??
    featuredDefaults.ctaDiscuss;
  const featuredCtaSeeAll =
    firstValue(settings.featuredCtaSeeAll, featuredDefaults.ctaSeeAll) ??
    featuredDefaults.ctaSeeAll;

  const ctaDefaults = CTA_BAND_DEFAULTS[locale];
  const ctaEye = firstValue(settings.ctaEye, ctaDefaults.eye) ?? ctaDefaults.eye;
  const ctaHeadLine1 =
    firstValue(settings.ctaHeadLine1, ctaDefaults.headLine1) ?? ctaDefaults.headLine1;
  const ctaHeadLine2 =
    firstValue(settings.ctaHeadLine2, ctaDefaults.headLine2) ?? ctaDefaults.headLine2;
  const ctaHeadHighlightIndex = Number.parseInt(
    settings.ctaHeadHighlightIndex ?? CTA_BAND_HEAD_HIGHLIGHT_DEFAULT,
    10,
  );
  const ctaSub = firstValue(settings.ctaSub, ctaDefaults.sub) ?? ctaDefaults.sub;
  const ctaBtnPrimary =
    firstValue(settings.ctaBtnPrimaryLabel, ctaDefaults.btnPrimary) ??
    ctaDefaults.btnPrimary;
  const ctaBtnSecondary =
    firstValue(settings.ctaBtnSecondaryLabel, ctaDefaults.btnSecondary) ??
    ctaDefaults.btnSecondary;
  const ctaBtnPrimaryUrl = settings.ctaBtnPrimaryUrl || ctaDefaults.btnPrimaryUrl;
  const ctaBtnSecondaryUrl = settings.ctaBtnSecondaryUrl || ctaDefaults.btnSecondaryUrl;

  const featuredWhatsappFallback =
    settings.featuredWhatsappFallback || WHATSAPP_FALLBACK_URL_DEFAULT;

  const faqHomeDefaults = FAQ_HOME_DEFAULTS[locale];
  const faqHomeEye =
    firstValue(settings.faqHomeEye, faqHomeDefaults.eye) ?? faqHomeDefaults.eye;
  const faqHomeHeadLine1 =
    firstValue(settings.faqHomeHeadLine1, faqHomeDefaults.headLine1) ??
    faqHomeDefaults.headLine1;
  const faqHomeHeadLine2 =
    firstValue(settings.faqHomeHeadLine2, faqHomeDefaults.headLine2) ??
    faqHomeDefaults.headLine2;
  const faqHomeHeadHighlightIndex = Number.parseInt(
    settings.faqHomeHeadHighlightIndex ?? FAQ_HOME_HEAD_HIGHLIGHT_DEFAULT,
    10,
  );

  const pkgNote = firstValue(settings.pkgNote, pkgDefaults.note) ?? pkgDefaults.note;

  const allPortfolios = await getPortfolios(locale);
  const featuredPortfolios = pickFeatured(allPortfolios, settings.homeFeaturedPortfolioId);

  const faqItems = await getFaqItems(locale);
  const faqVisible = faqItems.slice(0, 3);
  const faqHidden = faqItems.slice(3);
  const faqSeeMoreLabel = locale === "id" ? "Lihat pertanyaan lainnya" : "See more questions";
  const faqSeeLessLabel = locale === "id" ? "Tutup" : "Show less";

  const whyDefaults = WHY_FORKUMI_DEFAULTS[locale];
  const whyEye = firstValue(settings.whyForkumiEye, whyDefaults.eye) ?? whyDefaults.eye;
  const whyHead = firstValue(settings.whyForkumiHead, whyDefaults.head) ?? whyDefaults.head;
  const whyStats = WHY_FORKUMI_NUMS.map((defaultNum, i) => {
    const slot = i + 1;
    return {
      num: settings[`stat${slot}Num`] || defaultNum,
      unit: settings[`stat${slot}Unit`] ?? whyDefaults.units[i],
      label:
        firstValue(settings[`stat${slot}Label`], whyDefaults.labels[i]) ??
        whyDefaults.labels[i],
      bgColor: settings[`stat${slot}Color`]?.trim() || WHY_FORKUMI_BG_COLORS[i],
      textColor: settings[`stat${slot}TextColor`]?.trim() || WHY_FORKUMI_TEXT_COLORS[i],
    };
  });

  return (
    <>
      <header className="hero" id="top">
        <img className="sparkle" src="/assets/img/sparkle_purple.png" style={{ top: "17%", left: "43%", width: "42px" }} data-d="0.5" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ bottom: "26%", left: "30%", width: "32px" }} data-d="0.8" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "30%", right: "30%", width: "50px" }} data-d="0.6" alt="" />
        <div className="stamp">{stamp}</div>
        <div className="wrap">
          <div className="hero-left">
            <h1>
              {titleLines.map((line, i) => (
                <Fragment key={i}>
                  {i > 0 ? <br /> : null}
                  <span className={i === highlightIndex ? "hl" : undefined}>{line}</span>
                </Fragment>
              ))}
            </h1>
            <p className="sub">{subtitle}</p>
            <div className="cta">
              <a className="btn primary" href={whatsappUrl} target="_blank" rel="noopener">
                {primaryLabel} <span className="ar">➔</span>
              </a>
              <a className="btn ghost" href={secondaryUrl}>{secondaryLabel}</a>
            </div>
          </div>
          <div className="hero-right"><img className="mascot" src={mascotSrc} alt="Forkumi mascot" /></div>
        </div>
        <a className="scrolldown" href="#stats"><span className="m"></span><span>{scrollText}</span></a>
      </header>
      
      <div className="strip">
        {marqueeItems.length > 0 ? (
          <div className="t">
            <span>{marqueeItems.map((item) => `✦ ${item}`).join("\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0"}</span>
            <span aria-hidden="true">{marqueeItems.map((item) => `✦ ${item}`).join("\u00A0\u00A0\u00A0") + "\u00A0\u00A0\u00A0"}</span>
          </div>
        ) : null}
      </div>
      
      <section className="sec g-lav" id="stats">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal">{whyEye}</span><h2 className="sec-head reveal">{whyHead}</h2></div></div>
          <div className="stats">
            {whyStats.map((stat, i) => (
              <div key={i} className="stat reveal" style={{ background: stat.bgColor }}>
                <div className="num" style={{ color: stat.textColor }}>{stat.num}{stat.unit ? <span style={{ fontSize: ".5em" }}> {stat.unit}</span> : null}</div>
                <div className="lbl">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <WhySubscribeSection rawLocale={rawLocale} bg="g-pink" />
      
      <section className="sec g-peach" id="work">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{workEye}</span>
              <h2 className="sec-head reveal">
                <span className={workHighlightIndex === 0 ? "hl" : undefined}>{workHeadLine1}</span>
                <br />
                <span className={workHighlightIndex === 1 ? "hl" : undefined}>{workHeadLine2}</span>
              </h2>
            </div>
            <p className="intro reveal d1">{workIntro}</p>
          </div>
          {featuredPortfolios.map((item, i) => {
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
                    <a className="btn ghost sm" href="/portfolio">
                      {featuredCtaSeeAll}
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      <section className="sec g-blue" id="packages">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{pkgEye}</span>
              <h2 className="sec-head reveal">
                <span className={pkgHighlightIndex === 0 ? "hl" : undefined}>{pkgHeadLine1}</span>
                <br />
                <span className={pkgHighlightIndex === 1 ? "hl" : undefined}>{pkgHeadLine2}</span>
              </h2>
            </div>
            <p className="intro reveal d1">{pkgIntro}</p>
          </div>
          <PlansSection locale={locale} />
          <p className="pnote reveal">{pkgNote}</p>
        </div>
      </section>
      
      <section className="sec g-lav" id="faq">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{faqHomeEye}</span>
              <h2 className="sec-head reveal">
                <span className={faqHomeHeadHighlightIndex === 0 ? "hl" : undefined}>{faqHomeHeadLine1}</span>
                <br />
                <span className={faqHomeHeadHighlightIndex === 1 ? "hl" : undefined}>{faqHomeHeadLine2}</span>
              </h2>
            </div>
          </div>
          {faqItems.length > 0 ? (
            <div className="faqs">
              {faqVisible.map((item) => (
                <FaqItem key={item.id} question={item.question} answer={item.answer} />
              ))}
              <FaqCollapse
                hidden={faqHidden}
                seeMoreLabel={faqSeeMoreLabel}
                seeLessLabel={faqSeeLessLabel}
              />
            </div>
          ) : null}
        </div>
      </section>
      
      <section className="cta-sec">
        <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ top: "20%", left: "14%", width: "44px" }} data-d="0.6" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ bottom: "18%", right: "16%", width: "52px" }} data-d="0.7" alt="" />
        <div className="wrap">
          <span className="eyebrow center reveal" style={{ color: "var(--gold)", justifyContent: "center", width: "100%" }}>{ctaEye}</span>
          <h2 className="reveal" style={{ margin: "14px 0 0" }}>
            <span className={ctaHeadHighlightIndex === 0 ? "hl" : undefined}>{ctaHeadLine1}</span>
            <br />
            <span className={ctaHeadHighlightIndex === 1 ? "hl" : undefined}>{ctaHeadLine2}</span>
          </h2>
          <p className="sub reveal d1">{ctaSub}</p>
          <div className="cta reveal d2">
            <a className="btn primary" href={ctaBtnPrimaryUrl} target="_blank" rel="noopener">
              {ctaBtnPrimary} <span className="ar">➔</span>
            </a>
            <a className="btn ghost" href={ctaBtnSecondaryUrl}>{ctaBtnSecondary}</a>
          </div>
        </div>
      </section>
      
      <a className="fab" href={whatsappUrl} target="_blank" rel="noopener" title="WhatsApp"><span className="icon-dot" aria-hidden="true" /></a>
    </>
  );
}
