import type { ReactElement } from "react";

export default function AboutPage(): ReactElement {
  return (
    <>
      <div id="cursor"></div><div id="dot"></div>
      <div id="splash"><img src="/assets/img/logo.svg" alt="Forkumi" /><div className="sname">Forkumi</div><div className="bar"><i></i></div></div>
      <nav id="nav-mount"></nav>
      
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_purple.png" style={{ top: "40%", right: "9%", width: "46px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <span className="crumb"><a href="/" data-i="nHome"></a> / <span data-i="nAbout"></span></span>
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
      
      <section className="sec g-pink">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="whySubEye"></span><h2 className="sec-head reveal" data-head="whySubHead"></h2></div><p className="intro reveal d1" data-i="whySubIntro"></p></div>
          <div className="reveal" data-list="comparison"></div>
          <p className="whysub-line reveal" data-i="whySubLine"></p>
        </div>
      </section>
      
      <section className="sec g-peach">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="trEye"></span><h2 className="sec-head reveal" data-head="trHead"></h2></div><p className="intro reveal d1" data-i="trIntro"></p></div>
          <div className="grid g3" data-list="trust"></div>
        </div>
      </section>
      
      <section className="sec dark" id="process">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" style={{ color: "var(--gold)" }} data-i="procEye"></span><h2 className="sec-head reveal" data-head="procHead" style={{ color: "#fff" }}></h2></div></div>
          <div data-list="phases"></div>
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
