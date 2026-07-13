import type { ReactElement } from "react";

import {
  firstValue,
  getFrontPageSettings,
  normalizeLocale,
  safeHref,
  WHATSAPP_FALLBACK,
} from "../../front-page-settings";
import { getProcessPhases } from "../../processPhase";
import { getSectionCards, SECTION_CARD_ICONS } from "../../sectionCard";
import { WhySubscribeSection } from "../_components/WhySubscribeSection";
import { Breadcrumb } from "../_components/Breadcrumb";
import { CtaBand } from "../_components/CtaBand";
import { Fab } from "../_components/Fab";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

const VM_DEFAULTS: Record<"id" | "en", {
  h1Line1: string;
  h1Line2: string;
  lead: string;
  eye: string;
  visionHeading: string;
  visionParagraph: string;
  missionHeading: string;
  missionParagraph: string;
}> = {
  en: {
    h1Line1: "Why we",
    h1Line2: "exist",
    lead: "We believe great design should be accessible to every business.",
    eye: "Vision & Mission",
    visionHeading: "Vision",
    visionParagraph:
      "Make world-class design simple, affordable & unlimited for every business — local & global.",
    missionHeading: "Mission",
    missionParagraph:
      "Transparent pricing, no hiring or long contracts, and being your creative team — not just a vendor.",
  },
  id: {
    h1Line1: "Kenapa kami",
    h1Line2: "ada",
    lead: "Kami percaya desain hebat harusnya mudah diakses semua bisnis.",
    eye: "Visi & Misi",
    visionHeading: "Visi",
    visionParagraph:
      "Bikin akses ke desain kelas dunia jadi simpel, terjangkau, dan unlimited untuk setiap bisnis — Indonesia & global.",
    missionHeading: "Misi",
    missionParagraph:
      "Harga transparan, hapus ribetnya rekrutmen & kontrak panjang, dan jadi perpanjangan tim kreatifmu — bukan sekadar vendor.",
  },
};

const TRUST_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
  intro: string;
}> = {
  en: {
    eye: "Guarantees",
    headLine1: "Why you can",
    headLine2: "trust us",
    intro: "Not empty promises — commitments we hold on every project.",
  },
  id: {
    eye: "Jaminan",
    headLine1: "Kenapa kamu bisa",
    headLine2: "percaya kami",
    intro: "Bukan janji manis — ini komitmen yang kami pegang di tiap proyek.",
  },
};

const PROCESS_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
}> = {
  en: {
    eye: "Process",
    headLine1: "A simple,",
    headLine2: "transparent process",
  },
  id: {
    eye: "Proses",
    headLine1: "Cara kerja yang",
    headLine2: "simpel & transparan",
  },
};

const PAGE_LABEL: Record<"id" | "en", string> = { id: "Tentang", en: "About" };

export default async function AboutPage({ params }: AboutPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const [settings, trustCards, processPhases] = await Promise.all([
    getFrontPageSettings(locale),
    getSectionCards(locale, "trust"),
    getProcessPhases(locale),
  ]);

  const vmDef = VM_DEFAULTS[locale];
  const h1L1 = firstValue(settings.aboutH1Line1, vmDef.h1Line1) ?? vmDef.h1Line1;
  const h1L2 = firstValue(settings.aboutH1Line2, vmDef.h1Line2) ?? vmDef.h1Line2;
  const h1Hl = Number.parseInt(settings.aboutH1HighlightIndex ?? "1", 10);
  const lead = firstValue(settings.pageAboutLead, vmDef.lead) ?? vmDef.lead;
  const vmEye = firstValue(settings.aboutVisionEye, vmDef.eye) ?? vmDef.eye;
  const visionH = firstValue(settings.aboutVisionHeading, vmDef.visionHeading) ?? vmDef.visionHeading;
  const visionP = firstValue(settings.aboutVisionParagraph, vmDef.visionParagraph) ?? vmDef.visionParagraph;
  const missionH = firstValue(settings.aboutMissionHeading, vmDef.missionHeading) ?? vmDef.missionHeading;
  const missionP = firstValue(settings.aboutMissionParagraph, vmDef.missionParagraph) ?? vmDef.missionParagraph;

  const trDef = TRUST_DEFAULTS[locale];
  const trEye = firstValue(settings.aboutTrustEye, trDef.eye) ?? trDef.eye;
  const trL1 = firstValue(settings.aboutTrustHeadLine1, trDef.headLine1) ?? trDef.headLine1;
  const trL2 = firstValue(settings.aboutTrustHeadLine2, trDef.headLine2) ?? trDef.headLine2;
  const trHl = Number.parseInt(settings.aboutTrustHeadHighlightIndex ?? "1", 10);
  const trIntro = firstValue(settings.aboutTrustIntro, trDef.intro) ?? trDef.intro;

  const procDef = PROCESS_DEFAULTS[locale];
  const procEye = firstValue(settings.processSectionEye, procDef.eye) ?? procDef.eye;
  const procL1 = firstValue(settings.processSectionHeadLine1, procDef.headLine1) ?? procDef.headLine1;
  const procL2 = firstValue(settings.processSectionHeadLine2, procDef.headLine2) ?? procDef.headLine2;
  const procHl = Number.parseInt(settings.processSectionHeadHighlightIndex ?? "1", 10);

  const fabHref = safeHref(settings.contactWhatsappUrl, WHATSAPP_FALLBACK);

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_purple.png" style={{ top: "40%", right: "9%", width: "46px" }} data-d="0.5" alt="" />
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
          <div className="sec-top"><div><span className="eyebrow reveal">{vmEye}</span></div></div>
          <div className="vm reveal">
            <div className="vmc"><h3>{visionH}</h3><p>{visionP}</p></div>
            <div className="vmc rose"><h3>{missionH}</h3><p>{missionP}</p></div>
          </div>
        </div>
      </section>

      <WhySubscribeSection rawLocale={rawLocale} bg="g-pink" />

      <section className="sec g-peach">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{trEye}</span>
              <h2 className="sec-head reveal">
                <span className={trHl === 0 ? "hl" : undefined}>{trL1}</span>
                <br />
                <span className={trHl === 1 ? "hl" : undefined}>{trL2}</span>
              </h2>
            </div>
            <p className="intro reveal d1">{trIntro}</p>
          </div>
          {trustCards.length > 0 ? (
            <div className="grid g3">
              {trustCards.map((card) => {
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

      <section className="sec dark" id="process">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal" style={{ color: "var(--gold)" }}>{procEye}</span>
              <h2 className="sec-head reveal" style={{ color: "#fff" }}>
                <span className={procHl === 0 ? "hl" : undefined}>{procL1}</span>
                <br />
                <span className={procHl === 1 ? "hl" : undefined}>{procL2}</span>
              </h2>
            </div>
          </div>
          {processPhases.length > 0 ? (
            <div>
              {processPhases.map((phase, i) => (
                <div key={phase.id} className="phase reveal">
                  <div className="big">0{i + 1}</div>
                  <div>
                    <h3>{phase.title}</h3>
                    <div className="steps">
                      {phase.steps.map((step, si) => (
                        <span key={si}>{step}</span>
                      ))}
                    </div>
                    <p>{phase.description}</p>
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
