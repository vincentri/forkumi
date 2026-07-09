import type { ReactElement } from "react";

import { getFaqItems } from "../../faq";
import { getSectionCards } from "../../sectionCard";
import { FaqItem } from "../_components/FaqItem";
import { PlansSection } from "../_components/PlansSection";
import { normalizeLocale } from "../../front-page-settings";

type PackagesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PackagesPage({ params }: PackagesPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const [faqs, included, terms, payment] = await Promise.all([
    getFaqItems(locale),
    getSectionCards(locale, "included"),
    getSectionCards(locale, "terms"),
    getSectionCards(locale, "payment"),
  ]);

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ top: "40%", right: "10%", width: "46px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <span className="crumb"><a href="../" data-i="nHome"></a> / <span data-i="nPkg"></span></span>
          <h1 data-head="pkgHead"></h1>
          <p data-i="pagePkgLead"></p>
        </div>
      </section>

      <section className="sec g-lav">
        <div className="wrap">
          <PlansSection locale={locale} />
          <p className="pnote reveal" data-i="pkgNote"></p>
        </div>
      </section>

      <section className="sec g-pink">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="inclEye"></span><h2 className="sec-head reveal" data-head="inclHead"></h2></div></div>
          {included.length > 0 ? (
            <div className="grid">
              {included.map((card) => (
                <div key={card.id} className={`gcard ${card.color} reveal`}>
                  <h4>{card.heading}</h4>
                  <p>{card.paragraph}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="sec g-peach">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="termsEye"></span><h2 className="sec-head reveal" data-head="termsHead"></h2></div></div>
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
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="faqEye"></span><h2 className="sec-head reveal" data-head="faqHead"></h2></div></div>
          {faqs.length > 0 ? (
            <div className="faqs">
              {faqs.map((item) => (
                <FaqItem key={item.id} question={item.question} answer={item.answer} />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="cta-sec">
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "20%", left: "14%", width: "44px" }} data-d="0.6" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_purple.png" style={{ bottom: "18%", right: "16%", width: "52px" }} data-d="0.7" alt="" />
        <div className="wrap">
          <span className="eyebrow center" style={{ color: "var(--gold)", justifyContent: "center", width: "100%" }} data-i="ctaEye"></span>
          <h2 className="reveal" data-head="ctaHead" style={{ margin: "14px 0 0" }}></h2>
          <p className="sub reveal d1" data-i="ctaSub"></p>
          <div className="cta reveal d2">
            <a className="btn primary" href="#" target="_blank" rel="noopener" data-frontpage-cta-primary><span data-i="ctaBtn"></span> <span className="ar">➔</span></a>
            <a className="btn ghost" href="#" data-frontpage-cta-secondary><span data-i="nContact"></span></a>
          </div>
        </div>
      </section>

      <a className="fab" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener" title="WhatsApp" data-frontpage-whatsapp><span className="icon-dot" aria-hidden="true" /></a>
    </>
  );
}
