import type { ReactElement } from "react";

import { getIndustryItems } from "../../industry";
import { getServiceCategories } from "../../serviceCategory";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

function normalizeLocale(locale: string): "id" | "en" {
  return locale === "en" ? "en" : "id";
}

export default async function ServicesPage({ params }: ServicesPageProps): Promise<ReactElement> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const [categories, industries] = await Promise.all([
    getServiceCategories(locale),
    getIndustryItems(locale),
  ]);

  return (
    <>
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_purple.png" style={{ top: "40%", right: "8%", width: "46px" }} data-d="0.5" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ bottom: "14%", right: "22%", width: "30px" }} data-d="0.8" alt="" />
        <div className="wrap">
          <span className="crumb"><a href="../" data-i="nHome"></a> / <span data-i="nSvc"></span></span>
          <h1 data-head="svcHead"></h1>
          <p data-i="pageSvcLead"></p>
        </div>
      </section>

      <section className="sec g-lav">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="svcCatEye"></span><h2 className="sec-head reveal" data-head="svcCatHead"></h2></div></div>
          {categories.length > 0 ? (
            <div className="svccats">
              {categories.map((card) => (
                <div key={card.id} className={`svccat ${card.tint} reveal`}>
                  <h3>{card.name}</h3>
                  <div className="rule"></div>
                  <ul>
                    {card.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="sec g-pink" id="industries">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="indEye"></span><h2 className="sec-head reveal" data-head="indHead"></h2></div><p className="intro reveal d1" data-i="indIntro"></p></div>
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
