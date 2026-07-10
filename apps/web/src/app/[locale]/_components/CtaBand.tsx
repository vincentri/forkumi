import type { ReactElement } from "react";

import { firstValue } from "../../front-page-settings";

type CtaBandProps = {
  locale: "id" | "en";
  settings: Record<string, string>;
};

const CTA_DEFAULTS: Record<"id" | "en", {
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
    eye: "Let’s build",
    headLine1: "Got a project",
    headLine2: "in mind?",
    sub: "Free consult & fast replies. Flexible & no lock-in, start this week.",
    btnPrimary: "Let’s talk",
    btnSecondary: "View Packages",
    btnPrimaryUrl:
      "https://wa.me/6580892716?text=Hi%20Forkumi!%20I%20have%20a%20design%20project.",
    btnSecondaryUrl: "packages",
  },
  id: {
    eye: "Ayo mulai",
    headLine1: "Punya proyek",
    headLine2: "desain?",
    sub: "Konsultasi gratis & respons cepat. Fleksibel & bebas ikatan, bisa mulai minggu ini.",
    btnPrimary: "Ngobrol yuk",
    btnSecondary: "Lihat Paket",
    btnPrimaryUrl:
      "https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20punya%20proyek%20desain.",
    btnSecondaryUrl: "packages",
  },
};

const HIGHLIGHT_DEFAULT = "1";

function safeHref(value: string | undefined, fallback: string): string {
  return value && /^(https?:|mailto:|tel:)/.test(value) ? value : fallback;
}

export function CtaBand({ locale, settings }: CtaBandProps): ReactElement {
  const d = CTA_DEFAULTS[locale];
  const eye = firstValue(settings.ctaEye, d.eye) ?? d.eye;
  const headLine1 = firstValue(settings.ctaHeadLine1, d.headLine1) ?? d.headLine1;
  const headLine2 = firstValue(settings.ctaHeadLine2, d.headLine2) ?? d.headLine2;
  const hl = Number.parseInt(settings.ctaHeadHighlightIndex ?? HIGHLIGHT_DEFAULT, 10);
  const sub = firstValue(settings.ctaSub, d.sub) ?? d.sub;
  const btnPrimary = firstValue(settings.ctaBtnPrimaryLabel, d.btnPrimary) ?? d.btnPrimary;
  const btnSecondary = firstValue(settings.ctaBtnSecondaryLabel, d.btnSecondary) ?? d.btnSecondary;
  const btnPrimaryUrl = safeHref(settings.ctaBtnPrimaryUrl, d.btnPrimaryUrl);
  const btnSecondaryUrl = settings.ctaBtnSecondaryUrl?.trim() || d.btnSecondaryUrl;

  return (
    <section className="cta-sec">
      <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ top: "20%", left: "14%", width: "44px" }} data-d="0.6" alt="" />
      <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ bottom: "18%", right: "16%", width: "52px" }} data-d="0.7" alt="" />
      <div className="wrap">
        <span className="eyebrow center reveal" style={{ color: "var(--gold)", justifyContent: "center", width: "100%" }}>{eye}</span>
        <h2 className="reveal" style={{ margin: "14px 0 0" }}>
          <span className={hl === 0 ? "hl" : undefined}>{headLine1}</span>
          <br />
          <span className={hl === 1 ? "hl" : undefined}>{headLine2}</span>
        </h2>
        <p className="sub reveal d1">{sub}</p>
        <div className="cta reveal d2">
          <a className="btn primary" href={btnPrimaryUrl} target="_blank" rel="noopener">
            {btnPrimary} <span className="ar">➔</span>
          </a>
          <a className="btn ghost" href={btnSecondaryUrl}>{btnSecondary}</a>
        </div>
      </div>
    </section>
  );
}
