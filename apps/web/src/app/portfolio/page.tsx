import type { ReactElement } from "react";

export default function PortfolioPage(): ReactElement {
  return (
    <>
      <div id="cursor"></div><div id="dot"></div>
      <div id="splash"><img src="/assets/img/logo.svg" alt="Forkumi" /><div className="sname">Forkumi</div><div className="bar"><i></i></div></div>
      <nav id="nav-mount"></nav>
      
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "38%", right: "9%", width: "48px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <span className="crumb"><a href="/" data-i="nHome"></a> / <span data-i="nPort"></span></span>
          <h1 data-head="featHead"></h1>
          <p data-i="pagePortLead"></p>
        </div>
      </section>
      
      <section className="sec g-lav">
        <div className="wrap">
          <div data-list="portfolio"></div>
          <div className="ig-cta reveal">
            <div><h4 data-i="igH"></h4><p data-i="igP"></p></div>
            <a className="btn" href="https://www.instagram.com/forkumi.design/" target="_blank" rel="noopener">@forkumi.design <span className="ar">➔</span></a>
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
            <a className="btn primary" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20punya%20proyek%20desain." target="_blank" rel="noopener"><span data-i="ctaBtn"></span> <span className="ar">➔</span></a>
            <a className="btn ghost" href="/packages"><span data-i="ctaBtn2"></span></a>
          </div>
        </div>
      </section>
      
      <footer id="footer-mount"></footer>
      <a className="fab" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener" title="WhatsApp"><span className="icon-dot" aria-hidden="true" /></a>
    </>
  );
}
