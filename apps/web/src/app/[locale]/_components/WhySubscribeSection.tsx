import type { ReactElement } from "react";

import { firstValue, getFrontPageSettings, normalizeLocale } from "../../front-page-settings";
import { getCompareData } from "../../compare";
import { getWhysubCards } from "../../whysub";

const WHY_SUB_DEFAULTS: Record<"id" | "en", {
  eye: string;
  headLine1: string;
  headLine2: string;
  intro: string;
  line: string;
}> = {
  en: {
    eye: "Why Subscribe",
    headLine1: "Tired of the",
    headLine2: "old way?",
    intro:
      "In-house hiring, pricey agencies, or doing AI yourself — each has its headaches. Forkumi keeps it simple.",
    line: "Forkumi = everything sorted in one subscription. Zero drama. ✦",
  },
  id: {
    eye: "Kenapa Langganan",
    headLine1: "Capek sama",
    headLine2: "cara lama?",
    intro:
      "Rekrut in-house, agency mahal, atau coba AI sendiri — masing-masing ada repotnya. Forkumi bikin semuanya simpel.",
    line: "Forkumi = semua beres dalam satu langganan. Tanpa drama. ✦",
  },
};

const WHY_SUB_HIGHLIGHT_INDEX_DEFAULT = "1";

// ponytail: static marketing copy — no backend field. Wire to settings only if it needs editing.
const CMP_DEFAULTS: Record<"id" | "en", { eye: string; headLine1: string; headLine2: string }> = {
  en: { eye: "Comparison", headLine1: "Compare for", headLine2: "yourself" },
  id: { eye: "Perbandingan", headLine1: "Bandingkan", headLine2: "sendiri" },
};

const WHYSUB_ICONS: Record<string, string> = {
  team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  brand: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
  bolt: '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>',
  data: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  star: '<path d="M12 2l2.6 6.6L21 9.2l-5 4.3L17.5 21 12 17.3 6.5 21 8 13.5l-5-4.3 6.4-.6z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  web: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  social: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.5M15.4 6.5l-6.8 4"/>',
  motion: '<polygon points="5 3 19 12 5 21 5 3"/>',
};

type WhySubscribeSectionProps = {
  rawLocale: string;
  bg?: string;
};

export async function WhySubscribeSection({
  rawLocale,
  bg = "g-pink",
}: WhySubscribeSectionProps): Promise<ReactElement> {
  const locale = normalizeLocale(rawLocale);
  const settings = await getFrontPageSettings(locale);
  const defaults = WHY_SUB_DEFAULTS[locale];

  const eye = firstValue(settings.whySubEye, defaults.eye) ?? defaults.eye;
  const headLine1 = firstValue(settings.whySubHeadLine1, defaults.headLine1) ?? defaults.headLine1;
  const headLine2 = firstValue(settings.whySubHeadLine2, defaults.headLine2) ?? defaults.headLine2;
  const highlightIndex = Number.parseInt(
    settings.whySubHeadHighlightIndex ?? WHY_SUB_HIGHLIGHT_INDEX_DEFAULT,
    10,
  );
  const intro = firstValue(settings.whySubIntro, defaults.intro) ?? defaults.intro;
  const line = firstValue(settings.whySubLine, defaults.line) ?? defaults.line;

  const [compareData, cards] = await Promise.all([
    getCompareData(locale),
    getWhysubCards(locale),
  ]);

  const cmp = CMP_DEFAULTS[locale];
  const cols = compareData.categories.length;
  const gridTemplate = `1.9fr repeat(${cols}, 1fr)`;

  return (
    <>
      <section className={`sec ${bg}`} id="why">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal">{eye}</span>
              <h2 className="sec-head reveal">
                <span className={highlightIndex === 0 ? "hl" : undefined}>{headLine1}</span>
                <br />
                <span className={highlightIndex === 1 ? "hl" : undefined}>{headLine2}</span>
              </h2>
            </div>
            <p className="intro reveal d1">{intro}</p>
          </div>
          <div className="grid g3">
            {cards.map((card, i) => (
              <div key={i} className={`gcard ${card.color} reveal`}>
                <div className="ci">
                  <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: WHYSUB_ICONS[card.icon] ?? "" }} />
                </div>
                <h4>{card.heading}</h4>
                <p>{card.paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec dark" id="compare">
        <div className="wrap">
          <div className="sec-top">
            <div>
              <span className="eyebrow reveal" style={{ color: "var(--gold)" }}>{cmp.eye}</span>
              <h2 className="sec-head reveal" style={{ color: "#fff" }}>
                {cmp.headLine1}
                <br />
                <span className="hl">{cmp.headLine2}</span>
              </h2>
            </div>
          </div>

          {cols > 0 && compareData.rows.length > 0 ? (
            <div className="cmp-wrap reveal" style={{ marginTop: "30px" }}>
              <div className="cmp" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="cmp-row cmp-head" style={{ display: "grid", gridTemplateColumns: gridTemplate }}>
                  <div className="cmp-c crit"></div>
                  {compareData.categories.map((cat, i) => (
                    <div key={i} className={i === 0 ? "cmp-c f" : "cmp-c"}>{cat}</div>
                  ))}
                </div>
                {compareData.rows.map((row, ri) => (
                  <div key={ri} className="cmp-row" style={{ display: "grid", gridTemplateColumns: gridTemplate }}>
                    <div className="cmp-c crit">{row.label}</div>
                    {row.cells.map((cell, ci) => (
                      <div key={ci} className={ci === 0 ? "cmp-c f" : "cmp-c"}>
                        {cell === "y" ? <span className="mk yes">✓</span>
                          : cell === "n" ? <span className="mk no">✕</span>
                          : cell === "l" ? <span className="mk lim">–</span>
                          : cell === "?" ? <span className="mk lim">?</span>
                          : null}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <p className="whysub-line reveal">{line}</p>
        </div>
      </section>
    </>
  );
}