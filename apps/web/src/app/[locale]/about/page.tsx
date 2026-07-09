import type { ReactElement } from "react";

import { normalizeLocale } from "../../front-page-settings";
import { getProcessPhases } from "../../processPhase";
import { getSectionCards } from "../../sectionCard";
import { WhySubscribeSection } from "../_components/WhySubscribeSection";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const [trustCards, processPhases] = await Promise.all([
    getSectionCards(locale, "trust"),
    getProcessPhases(locale),
  ]);

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_purple.png" style={{ top: "40%", right: "9%", width: "46px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <span className="crumb"><a href="../" data-i="nHome"></a> / <span data-i="nAbout"></span></span>
          <h1 data-head="vmHead"></h1>
          <p data-i="pageAboutLead"></p>
        </div>
      </section>

      <section className="sec g-lav">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="vmEye"></span></div></div>
          <div className="vm reveal">
            <div className="vmc"><h3 data-i="vmVisionH"></h3><p data-i="vmVisionP"></p></div>
            <div className="vmc rose"><h3 data-i="vmMissionH"></h3><p data-i="vmMissionP"></p></div>
          </div>
        </div>
      </section>

      <WhySubscribeSection rawLocale={rawLocale} bg="g-pink" />

      <section className="sec g-peach">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="trEye"></span><h2 className="sec-head reveal" data-head="trHead"></h2></div><p className="intro reveal d1" data-i="trIntro"></p></div>
          {trustCards.length > 0 ? (
            <div className="grid g3">
              {trustCards.map((card) => (
                <div key={card.id} className={`gcard ${card.color} reveal`}>
                  <h4>{card.heading}</h4>
                  <p>{card.paragraph}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="sec dark" id="process">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" style={{ color: "var(--gold)" }} data-i="procEye"></span><h2 className="sec-head reveal" data-head="procHead" style={{ color: "#fff" }}></h2></div></div>
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
