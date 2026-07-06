import type { ReactElement } from "react";

export default function ServicesPage(): ReactElement {
  return (
    <>
      <div id="cursor"></div><div id="dot"></div>
      <div id="splash"><img src="/assets/img/logo.svg" alt="Forkumi" /><div className="sname">Forkumi</div><div className="bar"><i></i></div></div>
      <nav id="nav-mount"></nav>
      
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
          <div className="svccats" data-list="servicecats"></div>
        </div>
      </section>
      
      <section className="sec g-pink" id="industries">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="indEye"></span><h2 className="sec-head reveal" data-head="indHead"></h2></div><p className="intro reveal d1" data-i="indIntro"></p></div>
          <div data-list="industries"></div>
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
            <a className="btn primary" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20punya%20proyek%20desain." target="_blank" rel="noopener" data-frontpage-whatsapp><span data-i="ctaBtn"></span> <span className="ar">➔</span></a>
            <a className="btn ghost" href="../packages"><span data-i="ctaBtn2"></span></a>
          </div>
        </div>
      </section>
      
      <footer id="footer-mount"></footer>
      <a className="fab" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener" title="WhatsApp" data-frontpage-whatsapp><span className="icon-dot" aria-hidden="true" /></a>
    </>
  );
}
