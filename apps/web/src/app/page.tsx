import type { ReactElement } from "react";

export default function HomePage(): ReactElement {
  return (
    <>
      <div id="cursor"></div><div id="dot"></div>
      <div id="splash"><img src="/assets/img/logo.svg" alt="Forkumi" /><div className="sname">Forkumi</div><div className="bar"><i></i></div></div>
      <nav id="nav-mount"></nav>
      
      <header className="hero" id="top">
        <img className="sparkle" src="/assets/img/sparkle_purple.png" style={{ top: "17%", left: "43%", width: "42px" }} data-d="0.5" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_gold_bright.png" style={{ bottom: "26%", left: "30%", width: "32px" }} data-d="0.8" alt="" />
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "30%", right: "30%", width: "50px" }} data-d="0.6" alt="" />
        <div className="stamp" data-i="stamp"></div>
        <div className="wrap">
          <div className="hero-left">
            <span className="trial-badge" data-i="trialBadge"></span>
            <h1 id="heroH1"></h1>
            <p className="sub" data-i="heroSub"></p>
            <div className="cta">
              <a className="btn primary" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener"><span data-i="ctaStart"></span> <span className="ar">➔</span></a>
              <a className="btn ghost" href="/packages"><span data-i="ctaPkg"></span></a>
            </div>
          </div>
          <div className="hero-right"><img className="mascot" src="/assets/img/mascot.png" id="heroMascot" alt="Forkumi mascot" /></div>
        </div>
        <a className="scrolldown" href="#stats"><span className="m"></span><span data-i="scroll"></span></a>
      </header>
      
      <div className="strip"><div className="t" data-list="strip"></div></div>
      
      <section className="sec g-lav" id="stats">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="statsEye"></span><h2 className="sec-head reveal" data-head="statsHead"></h2></div></div>
          <div className="stats" data-list="stats"></div>
        </div>
      </section>
      
      <section className="sec g-pink" id="why">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="whySubEye"></span><h2 className="sec-head reveal" data-head="whySubHead"></h2></div><p className="intro reveal d1" data-i="whySubIntro"></p></div>
          <div className="reveal" data-list="comparison"></div>
          <p className="whysub-line reveal" data-i="whySubLine"></p>
        </div>
      </section>
      
      <section className="sec g-peach" id="work">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="featEye"></span><h2 className="sec-head reveal" data-head="featHead"></h2></div><p className="intro reveal d1" data-i="featIntro"></p></div>
          <div data-list="portfolioHome"></div>
        </div>
      </section>
      
      <section className="sec g-blue" id="packages">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="pkgEye"></span><h2 className="sec-head reveal" data-head="pkgHead"></h2></div><p className="intro reveal d1" data-i="pkgIntro"></p></div>
          <div className="plans" data-list="plans"></div>
          <p className="pnote reveal" data-i="pkgNote"></p>
        </div>
      </section>
      
      <section className="sec g-lav" id="faq">
        <div className="wrap">
          <div className="sec-top"><div><span className="eyebrow reveal" data-i="faqEye"></span><h2 className="sec-head reveal" data-head="faqHead"></h2></div></div>
          <div data-list="faqHome"></div>
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
