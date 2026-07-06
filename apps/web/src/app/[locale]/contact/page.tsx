import type { ReactElement } from "react";

export default function ContactPage(): ReactElement {
  return (
    <>
      <div id="cursor"></div><div id="dot"></div>
      <div id="splash"><img src="/assets/img/logo.svg" alt="Forkumi" /><div className="sname">Forkumi</div><div className="bar"><i></i></div></div>
      <nav id="nav-mount"></nav>
      
      <section className="page-hero">
        <img className="sparkle" src="/assets/img/sparkle_rose.png" style={{ top: "42%", right: "10%", width: "46px" }} data-d="0.5" alt="" />
        <div className="wrap">
          <span className="crumb"><a href="../" data-i="nHome"></a> / <span data-i="nContact"></span></span>
          <h1 data-head="cHead"></h1>
          <p data-i="cIntro"></p>
        </div>
      </section>
      
      <section className="sec g-lav">
        <div className="wrap">
          <div className="contact-grid">
            <div className="reveal">
              <div className="cbtns">
                <a className="cbtn wa" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener" data-frontpage-contact="whatsapp"><span className="ci"><span className="icon-dot" aria-hidden="true" /></span><div><b>WhatsApp</b><small>+65 8089 2716</small></div></a>
                <a className="cbtn mail" href="mailto:linkforkumi@gmail.com" data-frontpage-contact="email"><span className="ci"><span className="icon-dot" aria-hidden="true" /></span><div><b>Email</b><small>linkforkumi@gmail.com</small></div></a>
                <a className="cbtn ig" href="https://www.instagram.com/forkumi.design/" target="_blank" rel="noopener" data-frontpage-contact="instagram"><span className="ci"><span className="icon-dot" aria-hidden="true" /></span><div><b>Instagram</b><small>@forkumi.design</small></div></a>
                <a className="cbtn ph" href="tel:+6580892716" data-frontpage-contact="phone"><span className="ci"><span className="icon-dot" aria-hidden="true" /></span><div><b>+65 8089 2716</b><small>Singapore</small></div></a>
                <div className="cbtn" style={{ cursor: "default" }}><span className="ci" style={{ background: "var(--gold)" }}><span className="icon-dot" aria-hidden="true" /></span><div><b data-i="hoursH"></b><small data-i="hours" data-frontpage-working-hours></small></div></div>
              </div>
            </div>
            <form className="form reveal d1" id="contactForm">
              <div style={{ fontWeight: "800", fontSize: "20px", marginBottom: "4px" }} data-i="formH"></div>
              <label data-i="fName"></label><input name="cname" required />
              <label data-i="fEmail"></label><input name="cemail" type="email" required />
              <label data-i="fPkg"></label>
              <select name="cpkg"><option>Basic</option><option selected>Standard</option><option>Premium</option><option>—</option></select>
              <label data-i="fMsg"></label><textarea name="cmsg"></textarea>
              <button type="submit" className="btn primary"><span data-i="fSend"></span> <span className="ar">➔</span></button>
            </form>
          </div>
        </div>
      </section>
      
      <footer id="footer-mount"></footer>
      <a className="fab" href="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan." target="_blank" rel="noopener" title="WhatsApp" data-frontpage-whatsapp><span className="icon-dot" aria-hidden="true" /></a>
    </>
  );
}
