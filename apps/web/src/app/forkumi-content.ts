/* eslint-disable */
// @ts-nocheck
// Forkumi site copy and DOM renderer.
/* Forkumi — shared site script */
const WA_BASE="https://wa.me/6580892716";
const WA=WA_BASE+"?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20layanan%20desain%20langganan.";
const WAP="https://wa.me/6580892716?text=Halo%20Forkumi!%20Saya%20tertarik%20dengan%20paket%20";
const IG="https://www.instagram.com/forkumi.design/";
const MAIL="mailto:linkforkumi@gmail.com";
let lang=localStorage.getItem('forkumi_lang')||'id';

const ICONS={brand:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',graphic:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l5-5 4 4 3-3 6 6"/>',uiux:'<rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',social:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 3.5M15.4 6.5l-6.8 4"/>',motion:'<polygon points="5 3 19 12 5 21 5 3"/>',video:'<rect x="2" y="5" width="14" height="14" rx="2"/><path d="M22 8l-6 4 6 4z"/>',illus:'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M2 2l7.5 7.5M2 2l4 1 1 4"/>',web:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',star:'<path d="M12 2l2.6 6.6L21 9.2l-5 4.3L17.5 21 12 17.3 6.5 21 8 13.5l-5-4.3 6.4-.6z"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',bolt:'<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>',team:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',data:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',chat:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',insta:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>'};

const T={
 // nav / chrome
 nHome:{id:'Beranda',en:'Home'},nPort:{id:'Portfolio',en:'Portfolio'},nSvc:{id:'Layanan',en:'Services'},nPkg:{id:'Paket',en:'Packages'},nAbout:{id:'Tentang',en:'About'},nContact:{id:'Kontak',en:'Contact'},
 talk:{id:'Ngobrol yuk',en:'Let’s talk'},
 // home hero
 kicker:{id:'Desain Langganan',en:'Design-as-a-Subscription'},
 heroSub:{id:'Partner desain langganan buat startup & UMKM. Satu harga bulanan, request sepuasnya, kualitas desain premium — tanpa drama.',en:'Your design subscription for startups & SMEs. One monthly price, unlimited requests, premium-quality design — zero drama.'},
 ctaStart:{id:'Mulai Sekarang',en:'Get Started'},ctaPkg:{id:'Lihat Paket',en:'View Packages'},
 microHero:{id:'Fleksibel & bebas ikatan · Pause kapan aja · Revisi sepuasnya',en:'Flexible & no lock-in · Pause anytime · Unlimited revisions'},
 scroll:{id:'Gas scroll',en:'Scroll'},stamp:{id:'INDONESIA · GLOBAL',en:'INDONESIA · WORLDWIDE'},
 heroHead:{id:['Desain','tanpa batas','buat brand yang naik kelas'],en:['Unlimited','design','for brands on the rise'],hl:1},
 trialBadge:{id:'🌐 Agensi Kualitas Global',en:'🌐 Global Quality Agency'},
 whySubEye:{id:'Kenapa Langganan',en:'Why Subscribe'},whySubHead:{id:['Capek sama','cara lama?'],en:['Tired of the','old way?'],hl:1},
 whySubIntro:{id:'Rekrut in-house, agency mahal, atau coba AI sendiri — masing-masing ada repotnya. Forkumi bikin semuanya simpel.',en:'In-house hiring, pricey agencies, or doing AI yourself — each has its headaches. Forkumi keeps it simple.'},
 whySubLine:{id:'Forkumi = semua beres dalam satu langganan. Tanpa drama. ✦',en:'Forkumi = everything sorted in one subscription. Zero drama. ✦'},
 svcCatEye:{id:'Layanan Lengkap',en:'Full Services'},svcCatHead:{id:['Semua kebutuhan','desainmu, satu tim'],en:['Every design need,','one team'],hl:1},
 // sections
 statsEye:{id:'Kenapa Forkumi',en:'Why Forkumi'},statsHead:{id:['Hasil nyata,','tanpa drama'],en:['Real results,','zero drama'],hl:1},
 whyEye:{id:'Keunggulan',en:'Our Edge'},whyHead:{id:['Kenapa pilih','Forkumi'],en:['Why choose','Forkumi'],hl:1},
 whyIntro:{id:'Lebih hemat dari karyawan tetap, lebih konsisten dari freelancer.',en:'Cheaper than a full-time hire, more consistent than freelancers.'},
 featEye:{id:'Portfolio',en:'Portfolio'},featHead:{id:['Karya','terbaru kami'],en:['Our latest','work'],hl:1},
 featIntro:{id:'Klien terbaru kami — dan masih banyak lagi di Instagram.',en:'Our latest client — plus plenty more on Instagram.'},
 pkgEye:{id:'Paket',en:'Packages'},pkgHead:{id:['Pilih paket','yang pas'],en:['Pick the','right plan'],hl:1},
 pkgIntro:{id:'Harga tetap bulanan, tanpa biaya tersembunyi. Pause atau stop kapan aja.',en:'Flat monthly price, no hidden fees. Pause or cancel anytime.'},
 faqEye:{id:'FAQ',en:'FAQ'},faqHead:{id:['Masih','ragu?'],en:['Still','unsure?'],hl:1},
 pkgNote:{id:'Promo terbatas — harga normal dicoret. Pause / stop kapan aja, tanpa penalti.',en:'Limited promo — normal price struck through. Pause or cancel anytime, no penalty.'},
 // industries / services / about / etc
 indEye:{id:'Industri',en:'Industries'},indHead:{id:['Industri yang','kami layani'],en:['Industries','we serve'],hl:1},
 indIntro:{id:'Dari startup teknologi sampai UMKM lokal — desain Forkumi cocok untuk semua bidang.',en:'From tech startups to local SMEs — Forkumi fits every sector.'},
 svcEye:{id:'Layanan',en:'Services'},svcHead:{id:['Yang bisa','kami kerjakan'],en:['What we','deliver'],hl:1},
 svcIntro:{id:'Satu tim kreatif untuk semua kebutuhan visualmu. Tinggal request, kami eksekusi.',en:'One creative team for all your visual needs. Just request, we execute.'},
 trEye:{id:'Jaminan',en:'Guarantees'},trHead:{id:['Kenapa kamu bisa','percaya kami'],en:['Why you can','trust us'],hl:1},
 trIntro:{id:'Bukan janji manis — ini komitmen yang kami pegang di tiap proyek.',en:'Not empty promises — commitments we hold on every project.'},
 procEye:{id:'Proses',en:'Process'},procHead:{id:['Cara kerja yang','simpel & transparan'],en:['A simple,','transparent process'],hl:1},
 vmEye:{id:'Visi & Misi',en:'Vision & Mission'},vmHead:{id:['Kenapa kami','ada'],en:['Why we','exist'],hl:1},
 vmVisionH:{id:'Visi',en:'Vision'},vmVisionP:{id:'Bikin akses ke desain kelas dunia jadi simpel, terjangkau, dan unlimited untuk setiap bisnis — Indonesia & global.',en:'Make world-class design simple, affordable & unlimited for every business — local & global.'},
 vmMissionH:{id:'Misi',en:'Mission'},vmMissionP:{id:'Harga transparan, hapus ribetnya rekrutmen & kontrak panjang, dan jadi perpanjangan tim kreatifmu — bukan sekadar vendor.',en:'Transparent pricing, no hiring or long contracts, and being your creative team — not just a vendor.'},
 termsEye:{id:'Ketentuan',en:'Terms'},termsHead:{id:['Syarat &','Pembayaran'],en:['Terms &','Payment'],hl:1},
 // portfolio
 portBadge:{id:'Klien Terbaru',en:'Latest Client'},portVisit:{id:'Kunjungi Website',en:'Visit Website'},
 portBlurb:{id:'Brand & website untuk restoran pasta premium “From Sea to Table”. Dari identitas visual, desain web, hingga konten media sosial — kami bantu Hoz Pasta tampil semewah rasanya.',en:'Brand & website for a premium pasta restaurant, “From Sea to Table.” From visual identity and web design to social content — we helped Hoz Pasta look as premium as it tastes.'},
 igH:{id:'Lihat lebih banyak karya kami',en:'See more of our work'},igP:{id:'Update terbaru tiap minggu di Instagram.',en:'Fresh updates every week on Instagram.'},
 // contact
 cEye:{id:'Kontak',en:'Contact'},cHead:{id:['Ayo mulai','bareng kami'],en:["Let's start","together"],hl:1},
 cIntro:{id:'Punya proyek atau pertanyaan? Kami balas cepat. Pilih cara paling nyaman buatmu.',en:'Got a project or question? We reply fast. Pick whatever works for you.'},
 hoursH:{id:'Jam Operasional',en:'Working Hours'},hours:{id:'Senin – Jumat · 09.00 – 18.00 WIB',en:'Mon – Fri · 09:00 – 18:00 GMT+7'},
 formH:{id:'Kirim pesan singkat',en:'Send a quick message'},
 fName:{id:'Nama',en:'Name'},fEmail:{id:'Email',en:'Email'},fPkg:{id:'Paket diminati',en:'Plan of interest'},fMsg:{id:'Pesan',en:'Message'},fSend:{id:'Kirim via WhatsApp',en:'Send via WhatsApp'},
 // cta band
 ctaEye:{id:'Ayo mulai',en:'Let’s build'},ctaHead:{id:['Punya proyek','desain?'],en:['Got a project','in mind?'],hl:1},
 ctaSub:{id:'Konsultasi gratis & respons cepat. Fleksibel & bebas ikatan, bisa mulai minggu ini.',en:'Free consult & fast replies. Flexible & no lock-in, start this week.'},
 ctaBtn:{id:'Ngobrol yuk',en:'Let’s talk'},ctaBtn2:{id:'Lihat Paket',en:'View Packages'},
 // footer
 fTag:{id:'Partner desain langganan untuk brand yang ingin tampil pro tanpa ribet.',en:'A design subscription partner for brands that want to look pro without the hassle.'},
 fExplore:{id:'Jelajahi',en:'Explore'},fContact:{id:'Kontak',en:'Contact'},fFollow:{id:'Ikuti kami',en:'Follow us'},
 fRights:{id:'Hak cipta dilindungi.',en:'All rights reserved.'},fMade:{id:'Dibuat dengan ❤ untuk brand yang bertumbuh.',en:'Made with ❤ for growing brands.'},
 // misc
 learn:{id:'Selengkapnya',en:'Learn more'},seeAll:{id:'Lihat semua',en:'See all'},
 pageSvcLead:{id:'Semua layanan desain yang kamu butuhkan dalam satu langganan.',en:'Every design service you need in one subscription.'},
 pagePortLead:{id:'Karya nyata untuk brand nyata. Inilah hasil kerja Forkumi.',en:'Real work for real brands. This is Forkumi in action.'},
 pagePkgLead:{id:'Transparan, fleksibel, dan bebas ikatan jangka panjang. Pilih, bayar, kami garap.',en:'Transparent, flexible, no long-term lock-in. Pick, pay, we build.'},
 pageAboutLead:{id:'Kami percaya desain hebat harusnya mudah diakses semua bisnis.',en:'We believe great design should be accessible to every business.'},
 inclEye:{id:'Yang Kamu Dapat',en:"What's Included"},inclHead:{id:['Semua paket','sudah termasuk'],en:['Every plan','includes'],hl:1}
};

const MARQUEE={id:['UNLIMITED DESIGN','TANPA RIBET','≤24 JAM','PAUSE KAPAN AJA','HARGA TETAP','KONSULTASI GRATIS'],en:['UNLIMITED DESIGN','ZERO HASSLE','≤24H DELIVERY','PAUSE ANYTIME','FLAT PRICE','FREE CONSULT']};
const STATS=[
 {num:'≤24',u:'JAM',ue:'H',l:{id:'Desain pertama',en:'First design'}},
 {num:'∞',l:{id:'Revisi sepuasnya',en:'Unlimited revisions'}},
 {num:'0',l:{id:'Ikatan jangka panjang',en:'Long-term lock-in'}},
 {num:'100%',l:{id:'File jadi milikmu',en:'Files are yours'}}
];
const WHY=[
 {ic:'team',c:'purple',h:{id:'Lebih dari Karyawan',en:'Beyond a Hire'},p:{id:'Satu tim desainer & strategist dengan biaya lebih murah dari satu karyawan senior.',en:'A full team for less than one senior hire.'}},
 {ic:'data',c:'rose',h:{id:'Berbasis Data',en:'Data-Driven'},p:{id:'Tiap desain dibekali prinsip UI/UX & tren pasar terkini.',en:'Every design backed by UX principles & market trends.'}},
 {ic:'bolt',c:'gold',h:{id:'Hasil Cepat',en:'Fast Results'},p:{id:'Tim kami gerak cepat — desain pertama meluncur ≤24 jam.',en:'Our team moves fast — first design in ≤24h.'}}
];
const INDUSTRIES=[
 {name:{id:'Startup & Teknologi',en:'Startup & Tech'},tag:{id:'Branding · UI/UX · Web',en:'Branding · UI/UX · Web'}},
 {name:{id:'UMKM & Ritel',en:'SME & Retail'},tag:{id:'Logo · Sosmed · Promosi',en:'Logo · Social · Promo'}},
 {name:{id:'F&B / Kuliner',en:'Food & Beverage'},tag:{id:'Kemasan · Menu · Konten',en:'Packaging · Menu · Content'}},
 {name:{id:'Fashion & Beauty',en:'Fashion & Beauty'},tag:{id:'Branding · Katalog · Sosmed',en:'Branding · Catalog · Social'}},
 {name:{id:'Properti',en:'Property'},tag:{id:'Brosur · Web · Iklan',en:'Brochure · Web · Ads'}},
 {name:{id:'Edukasi',en:'Education'},tag:{id:'Materi · Slide · Ilustrasi',en:'Materials · Slides · Illustration'}},
 {name:{id:'Kesehatan & Wellness',en:'Health & Wellness'},tag:{id:'Branding · Konten · App',en:'Branding · Content · App'}},
 {name:{id:'Jasa & Kreatif',en:'Services & Creative'},tag:{id:'Identitas · Web · Motion',en:'Identity · Web · Motion'}}
];
const SERVICES=[
 {ic:'brand',c:'purple',h:{id:'Branding & Logo',en:'Branding & Logo'},p:{id:'Identitas visual yang membekas.',en:'Memorable brand identity.'}},
 {ic:'graphic',c:'rose',h:{id:'Desain Grafis',en:'Graphic Design'},p:{id:'Konten promosi scroll-stopping.',en:'Scroll-stopping content.'}},
 {ic:'uiux',c:'gold',h:{id:'UI/UX Design',en:'UI/UX Design'},p:{id:'Antarmuka cakep & gampang dipakai.',en:'Beautiful, usable interfaces.'}},
 {ic:'social',c:'purple',h:{id:'Social Media',en:'Social Media'},p:{id:'Feed & story eye-catching.',en:'Eye-catching social content.'}},
 {ic:'motion',c:'rose',h:{id:'Motion Graphics',en:'Motion Graphics'},p:{id:'Animasi biar konten hidup.',en:'Animations that pop.'}},
 {ic:'video',c:'gold',h:{id:'Video Editing',en:'Video Editing'},p:{id:'Editing video yang nendang.',en:'Punchy video editing.'}},
 {ic:'illus',c:'purple',h:{id:'Ilustrasi',en:'Illustration'},p:{id:'Ilustrasi custom khas brand.',en:'Custom on-brand art.'}},
 {ic:'web',c:'rose',h:{id:'Website & App',en:'Website & App'},p:{id:'Landing page sampai aplikasi.',en:'Landing pages to apps.'}}
];
const TRUST=[
 {ic:'star',c:'purple',h:{id:'Bebas Revisi',en:'Unlimited Revisions'},p:{id:'Revisi terus sampai kamu sreg. Kepuasanmu nomor satu.',en:'Endless revisions until it’s perfect. Your happiness comes first.'}},
 {ic:'chat',c:'rose',h:{id:'Konsultasi Gratis',en:'Free Consultation'},p:{id:'Ngobrol soal brand-mu tanpa biaya. Kami bantu dari nol.',en:'Talk through your brand for free. We help from zero.'}},
 {ic:'file',c:'gold',h:{id:'File & Aset Stok Gratis',en:'Free Files & Stock Assets'},p:{id:'Semua file final + aset stok premium, gratis buat kamu.',en:'All final files + premium stock assets, on us.'}},
 {ic:'bolt',c:'purple',h:{id:'Hasil Cepat',en:'Fast Results'},p:{id:'Tim kami gerak cepat — desain pertama meluncur ≤24 jam.',en:'Our team moves fast — first design in ≤24h.'}},
 {ic:'lock',c:'rose',h:{id:'Jeda & Batalkan Mudah',en:'Easy Pause & Cancel'},p:{id:'Pause atau stop kapan aja. Bulan ke bulan, no drama.',en:'Pause or stop anytime. Month-to-month, no drama.'}},
 {ic:'team',c:'gold',h:{id:'Tim Profesional',en:'Professional Team'},p:{id:'Dikerjakan tim desainer beneran, bukan template asal jadi.',en:'Done by a real design team, not lazy templates.'}}
];
const WHYSUB=[
 {ic:'team',c:'purple',h:{id:'Punya desainer in-house?',en:'Hiring in-house?'},p:{id:'Gaji + BPJS + asuransi, izin sakit, butuh pelatihan, beli tools sendiri. Ribet & mahal.',en:'Salary + benefits + insurance, sick days, training, paying for tools. Pricey & messy.'}},
 {ic:'brand',c:'rose',h:{id:'Pakai agency lama?',en:'Old-school agency?'},p:{id:'Harga fantastis, sistem ribet, kurang cocok buat startup, gonta-ganti agency.',en:'Sky-high prices, clunky systems, not startup-friendly, agency-hopping.'}},
 {ic:'bolt',c:'gold',h:{id:'Mau coba AI sendiri?',en:'Thinking of DIY AI?'},p:{id:'Boleh-boleh aja, tapi langganan tool-nya nggak murah dan harus kamu bayar sendiri. Nulis prompt yang pas juga butuh latihan, dan hasilnya sering belum sreg sama brand — ujungnya waktumu habis, fokus bisnis terganggu.',en:'Totally fair to try — but the tools aren’t cheap and you’d pay for them yourself. Writing the right prompt takes practice, and results often miss your brand — eating your time and pulling focus from your business.'}}
];
const COMPARE={
 cols:{id:['Forkumi','In-House','AI'],en:['Forkumi','In-House','AI']},
 rows:[
  {h:{id:'Harga terjangkau',en:'Affordable price'},v:['y','n','l']},
  {h:{id:'Pengerjaan cepat (≤24 jam)',en:'Fast turnaround (≤24h)'},v:['y','l','l']},
  {h:{id:'Revisi sepuasnya',en:'Unlimited revisions'},v:['y','l','l']},
  {h:{id:'Fleksibel & bebas ikatan',en:'Flexible, no lock-in'},v:['y','n','y']},
  {h:{id:'Kualitas profesional & konsisten',en:'Professional, consistent quality'},v:['y','y','n']},
  {h:{id:'Tanpa drama rekrut & admin',en:'No hiring or admin hassle'},v:['y','n','y']},
  {h:{id:'Fokus penuh ke bisnismu',en:'Stay focused on your business'},v:['y','l','n']}
 ]
};
const SERVICECATS=[
 {img:'ic-branding-flat.svg',tint:'rose',h:'Branding',items:['Logo','Mascot','Brand Strategy','Market Research','Competitor Analysis']},
 {img:'ic-graphic-flat.svg',tint:'blue',h:'Graphic Design',items:['Packaging','Menu Book','Company Profile','Invitation','Motion Graphics']},
 {img:'ic-website-flat.svg',tint:'purple',h:'Website',items:['Personal & Company Website','E-Commerce','UI Design','UX Research','Development','Maintenance']},
 {img:'ic-social-flat.svg',tint:'yellow',h:'Social Media',items:['Content Design','Social Media Management','Food & Product Photography','Video Editing']}
];
const PHASES=[
 {t:{id:'Pemesanan',en:'Order'},steps:{id:['Pilih paket','Isi form kebutuhan','Jadwalkan meeting'],en:['Pick a plan','Fill the brief','Book a meeting']},d:{id:'Pilih paket yang pas sama kebutuhanmu, isi form, lalu kita meeting buat bahas detailnya.',en:'Pick the plan that fits, fill the form, then we meet to map out the details.'}},
 {t:{id:'Pengerjaan',en:'Production'},steps:{id:['Konfirmasi pembayaran','Tim langsung gas','Kirim ≤24 jam'],en:['Confirm payment','Team gets to work','Deliver in ≤24h']},d:{id:'Begitu pembayaran masuk, tim langsung garap sesuai brief-mu. Pengiriman pertama maks 24 jam.',en:'Once payment clears, the team starts right away. First delivery in max 24 hours.'}},
 {t:{id:'Penilaian',en:'Review'},steps:{id:['Revisi sepuasnya','Laporan tiap 3 bulan','Penyesuaian strategi'],en:['Revise freely','Quarterly reports','Strategy tune-ups']},d:{id:'Minta revisi sepuasnya dari tiap hasil. Tiap 3 bulan kami kirim laporan biar strategimu makin tajam.',en:'Request all the revisions you want. Every 3 months we report back so your strategy stays sharp.'}}
];
const PLANS=[
 {c:'purple',name:'Basic',price:'Rp 1.500k',normal:'Rp 2.500k',feats:{id:['1 Permintaan Desain','Branding','Sosial Media','Riset','Laporan Kuartalan'],en:['1 Design Request','Branding','Social Media','Research','Quarterly Report']}},
 {c:'rose',best:true,name:'Standard',price:'Rp 4.500k',normal:'Rp 6.500k',feats:{id:['2 Permintaan Desain','Semua di Basic','Video Editing','Pengemasan','Website'],en:['2 Design Requests','All in Basic','Video Editing','Packaging','Website']}},
 {c:'gold',name:'Premium',price:'Rp 6.500k',normal:'Rp 9.500k',feats:{id:['3 Permintaan Desain','Semua di Standard','Ilustrasi','UI/UX Design','Motion Graphics'],en:['3 Design Requests','All in Standard','Illustration','UI/UX Design','Motion Graphics']}}
];
const PKGNOTE={id:'Promo terbatas — harga normal dicoret. Pause / stop kapan aja, tanpa penalti.',en:'Limited promo — normal price struck through. Pause or cancel anytime, no penalty.'};
const INCLUDED=[
 {ic:'bolt',c:'purple',h:{id:'Pengerjaan ≤24 jam',en:'≤24h turnaround'},p:{id:'Untuk request desain standar.',en:'For standard design requests.'}},
 {ic:'star',c:'rose',h:{id:'Revisi sepuasnya',en:'Unlimited revisions'},p:{id:'Sampai kamu benar-benar puas.',en:'Until you’re fully satisfied.'}},
 {ic:'lock',c:'gold',h:{id:'Bebas Ikatan',en:'No Lock-In'},p:{id:'Pause atau stop kapan aja, fleksibel bulanan.',en:'Pause or cancel anytime, flexible monthly.'}},
 {ic:'file',c:'purple',h:{id:'File milikmu',en:'You own the files'},p:{id:'Semua aset final 100% milikmu.',en:'All final assets are 100% yours.'}}
];
const TERMS=[
 {h:{id:'Permintaan Desain',en:'Design Requests'},p:{id:'Sesuai paket (1–3 request aktif), digarap satu per satu.',en:'Per plan (1–3 active requests), handled one at a time.'}},
 {h:{id:'Waktu Pengerjaan',en:'Turnaround'},p:{id:'Desain standar maks 24 jam; request kompleks dikabari transparan.',en:'Standard in 24h; complex work communicated transparently.'}},
 {h:{id:'Revisi',en:'Revisions'},p:{id:'Unlimited untuk tiap desain sampai kamu puas.',en:'Unlimited per design until you’re satisfied.'}},
 {h:{id:'Pause / Berhenti',en:'Pause / Cancel'},p:{id:'Kapan aja — tanpa ikatan jangka panjang, tanpa penalti.',en:'Anytime — no long-term lock-in, no penalty.'}},
 {h:{id:'Kepemilikan File',en:'File Ownership'},p:{id:'Semua file final 100% milikmu setelah pembayaran.',en:'All final files are 100% yours after payment.'}}
];
const PAYMENT=[
 {h:{id:'Siklus Bulanan',en:'Monthly Cycle'},p:{id:'Dibayar di muka tiap awal periode.',en:'Billed upfront each period.'}},
 {h:{id:'Metode',en:'Methods'},p:{id:'Transfer bank (BCA/Mandiri) & e-wallet (GoPay, OVO, DANA).',en:'Bank transfer & e-wallets (GoPay, OVO, DANA).'}},
 {h:{id:'Aktivasi',en:'Activation'},p:{id:'Pembayaran masuk, desain langsung digarap.',en:'Work starts once payment clears.'}},
 {h:{id:'Tanpa Biaya Tersembunyi',en:'No Hidden Fees'},p:{id:'Harga tetap — no per proyek, no kejutan.',en:'Flat price — no per-project fees, no surprises.'}}
];
const FAQ=[
 {q:{id:'Secepat apa desainku jadi?',en:'How fast will I get my designs?'},a:{id:'Rata-rata request standar (Branding, Desain Grafis, Social Media) kelar maks 24 jam. Request kompleks kayak Website & App butuh waktu lebih, dan pasti kami kabari transparan.',en:'Standard requests (Branding, Graphic Design, Social Media) in max 24h. Complex work like Website & App takes a bit longer — always communicated transparently.'}},
 {q:{id:'Kalau aku nggak suka hasilnya?',en:'What if I don’t like the result?'},a:{id:'Santai! Revisi sepuasnya — kami sempurnakan sampai kamu puas. Tapi ingat, makin banyak revisi makin memengaruhi waktu pengiriman akhir.',en:'No worries! Unlimited revisions — we refine until you’re happy. Note: more revisions will affect final delivery time.'}},
 {q:{id:'Gimana fitur Pause-nya?',en:'How does Pause work?'},a:{id:'Forkumi sistem bulan ke bulan. Kamu bisa jeda atau batalkan kapan aja tanpa denda atau biaya tersembunyi — bebas pilih kapan mau lanjut.',en:'Forkumi is month-to-month. Pause or cancel anytime — no penalties, no hidden fees. Resume whenever you’re ready.'}},
 {q:{id:'Siapa yang punya hak desainnya?',en:'Who owns the designs?'},a:{id:'Kamu, 100%. Setelah desain selesai & dikirim, semua aset kreatif untuk brand-mu jadi milikmu sepenuhnya.',en:'You — 100%. Once delivered, all creative assets for your brand are fully yours.'}},
 {q:{id:'Kenapa harus Forkumi?',en:'Why choose Forkumi?'},a:{id:'Desain berkualitas tanpa pusing tunjangan karyawan & admin ribet. Biaya tetap bulanan, dan bisa kamu on/off sesuai beban kerja. Fokus bisnis, desain biar kami yang urus.',en:'Quality design without HR or messy admin. Flat monthly fee you can switch on/off anytime. Focus on business — we handle design.'}},
 {q:{id:'Gimana cara kerjanya?',en:'How does it work?'},a:{id:'Pilih paket → isi form & meeting → bayar → digarap (≤24 jam) → revisi bebas → laporan tiap 3 bulan.',en:'Pick a plan → brief & meeting → pay → delivered (≤24h) → revise freely → quarterly report.'}}
];
const THUMBS=['e801aa13b9bd064a4cf17857f9365b42','369f963daec79f586889fa0bac35b258','dcc59d638387e03ea641c5b14d61a1d2','aa762bc353b7c3274b65bf48bdb739b0'];
const HOZ="https://api.hozpasta.com/uploads/media/";
const PORTFOLIO=[
 {name:'Jajanpedia',sub:'Cerita Rasa & Kuliner Nusantara',img:'https://api.jajanpedia.com/uploads/789c023acb5e0e973bebb00414b6a063.jpg',tags:['Branding','Website','F&B'],url:'https://jajanpedia.com/',
  blurb:{id:'Branding & website untuk platform kuliner Nusantara. Dari logo & identitas visual sampai desain web — kami bangun brand Jajanpedia dari nol biar cerita rasanya makin hidup.',en:'Branding & website for a Nusantara culinary platform. From logo & visual identity to web design — we built the Jajanpedia brand from the ground up.'}},
 {name:'Kak-Yah Rasa',sub:'Asian Cuisine Restaurant',logo:'kakyah-logo.svg',bg:'#F6F0E1',tags:['Branding','Logo','F&B'],
  blurb:{id:'Branding & logo untuk restoran masakan Asia Kak-Yah Rasa. Kami racik identitas visualnya biar terasa hangat, autentik, dan gampang diingat.',en:'Branding & logo for the Asian cuisine restaurant Kak-Yah Rasa. We crafted a visual identity that feels warm, authentic, and memorable.'}},
 {name:'Hoz Pasta',sub:'From Sea to Table',img:'https://api.hozpasta.com/uploads/media/e4eb690faf6f9648b1dc10132b997718.jpeg',tags:['Website','F&B'],url:'https://hozpasta.com/',ig:'https://www.instagram.com/hozpasta/',
  blurb:{id:'Website untuk restoran pasta premium “From Sea to Table”. Kami rancang desain web-nya biar tampil semewah rasanya.',en:'Website for a premium pasta restaurant, “From Sea to Table.” We designed the site to look as premium as it tastes.'}}
];

function t(o){return o?o[lang]:''}
function headHTML(o){return o[lang].map((l,i)=>`<span ${i===o.hl?'class="hl"':''}>${l}</span>`).join('<br>')}
function card(c){return `<div class="gcard ${c.c} reveal"><div class="ci"><svg viewBox="0 0 24 24">${ICONS[c.ic]}</svg></div><h4>${t(c.h)}</h4><p>${t(c.p)}</p></div>`}
function planCard(pl){return `<div class="plan ${pl.c} ${pl.best?'best':''} reveal">${pl.best?`<span class="star">★ ${lang==='id'?'Favorit':'Popular'}</span>`:''}<div class="pn">${pl.name}</div><ul>${pl.feats[lang].map(f=>`<li>${f}</li>`).join('')}</ul><div class="startfrom">${lang==='id'?'Mulai dari':'Start from'}</div><div class="price">${pl.price}<span style="font-size:14px">/mo</span></div><div class="normal">${pl.normal}/mo</div><a class="pick" href="${WAP+encodeURIComponent(pl.name)}" target="_blank" rel="noopener">${lang==='id'?'Pilih Paket':'Choose Plan'}</a><div class="tc-note">${lang==='id'?'*S&K berlaku':'*T&C applied'}</div></div>`}
function faqItem(qa){return `<div class="faq-q reveal"><div class="q" onclick="this.parentNode.classList.toggle('open')"><span>${t(qa.q)}</span><span class="plus">+</span></div><div class="a"><p>${t(qa.a)}</p></div></div>`}
function mark(v){var m=v==='y'?['yes','✓']:v==='n'?['no','✕']:['lim','–'];return '<span class="mk '+m[0]+'">'+m[1]+'</span>'}
function portCard(p,home,i){
 var badge=i===0?(lang==='id'?'Klien Terbaru':'Latest Client'):(lang==='id'?'Klien':'Client');
 var btns='';
 if(p.url) btns+='<a class="btn primary sm" href="'+p.url+'" target="_blank" rel="noopener">'+(lang==='id'?'Kunjungi Website':'Visit Website')+' <span class="ar">➔</span></a>';
 else btns+='<a class="btn primary sm" href="'+WA+'" target="_blank" rel="noopener">'+(lang==='id'?'Diskusi Proyek':'Discuss a Project')+' <span class="ar">➔</span></a>';
 if(home) btns+='<a class="btn ghost sm" href="/portfolio">'+(lang==='id'?'Lihat semua':'See all')+'</a>';
 else if(p.ig) btns+='<a class="btn ghost sm" href="'+p.ig+'" target="_blank" rel="noopener">Instagram</a>';
 var pimg=p.logo
  ? '<div class="pimg logo" style="background:'+(p.bg||'#241C16')+'"><span class="pbadge">'+badge+'</span><img src="assets/img/'+p.logo+'" alt="'+p.name+'" loading="lazy"></div>'
  : '<div class="pimg"><span class="ph">'+p.name+'</span><span class="pbadge">'+badge+'</span><img src="'+p.img+'" alt="'+p.name+'" loading="lazy" onerror="this.style.display=\'none\'"></div>';
 return '<div class="port-feat reveal" style="margin-bottom:26px">'+pimg+'<div class="port-info"><h3>'+p.name+'</h3><div class="psub">'+p.sub+'</div><div class="ptags">'+p.tags.map(function(x){return '<span>'+x+'</span>'}).join('')+'</div><p>'+t(p.blurb)+'</p><div class="port-btns">'+btns+'</div></div></div>';
}
function toggleFaq(btn){var ex=document.getElementById('faqExtra');if(!ex)return;var opening=!ex.classList.contains('open');
 if(opening){ex.classList.add('open');ex.style.overflow='hidden';ex.style.maxHeight=ex.scrollHeight+'px';var d=function(){ex.style.maxHeight='none';ex.style.overflow='visible';ex.removeEventListener('transitionend',d)};ex.addEventListener('transitionend',d);}
 else{ex.style.overflow='hidden';ex.style.maxHeight=ex.scrollHeight+'px';requestAnimationFrame(function(){ex.classList.remove('open');ex.style.maxHeight='0px'});}
 btn.innerHTML=(opening?(lang==='id'?'Tutup':'Show less'):(lang==='id'?'Lihat pertanyaan lainnya':'See more questions'))+' <span class="ico">'+(opening?'↑':'↓')+'</span>';}

const LIST={
 strip:()=>{const s='<span>'+MARQUEE[lang].map(x=>'✦ '+x).join('&nbsp;&nbsp;&nbsp;')+'&nbsp;&nbsp;&nbsp;</span>';return s+s;},
 stats:()=>STATS.map(s=>`<div class="stat reveal"><div class="num">${s.num}${s.u?`<span style="font-size:.5em"> ${lang==='id'?s.u:s.ue}</span>`:''}</div><div class="lbl">${t(s.l)}</div></div>`).join(''),
 why:()=>WHY.map(card).join(''),
 services:()=>SERVICES.map(card).join(''),
 trust:()=>TRUST.map(card).join(''),
 included:()=>INCLUDED.map(card).join(''),
 whysub:()=>WHYSUB.map(c=>`<div class="gcard ${c.c} reveal"><div class="ci"><svg viewBox="0 0 24 24">${ICONS[c.ic]}</svg></div><h4>${t(c.h)}</h4><p>${t(c.p)}</p></div>`).join(''),
 comparison:()=>{var L=COMPARE.cols[lang];var h='<div class="cmp-wrap"><div class="cmp"><div class="cmp-row cmp-head"><div class="cmp-c crit"></div><div class="cmp-c f">'+L[0]+'</div>'+L.slice(1).map(function(x){return '<div class="cmp-c">'+x+'</div>'}).join('')+'</div>';COMPARE.rows.forEach(function(r){h+='<div class="cmp-row"><div class="cmp-c crit">'+t(r.h)+'</div>'+r.v.map(function(val,i){return '<div class="cmp-c '+(i===0?'f':'')+'">'+mark(val)+'</div>'}).join('')+'</div>'});return h+'</div></div>'},
 servicecats:()=>SERVICECATS.map(c=>`<div class="svccat ${c.tint} reveal"><img class="ic" src="assets/img/ill/${c.img}" alt="${c.h}" loading="lazy"><h3>${c.h}</h3><div class="rule"></div><ul>${c.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`).join(''),
 industries:()=>INDUSTRIES.map((it,i)=>`<div class="ind reveal"><div class="n"><span class="idx">${String(i+1).padStart(2,'0')}</span><span class="name">${t(it.name)}</span></div><div class="tag"><span class="txt">${t(it.tag)}</span><span class="go"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></div>`).join(''),
 phases:()=>PHASES.map((p,i)=>`<div class="phase reveal"><div class="big">0${i+1}</div><div><h3>${t(p.t)}</h3><div class="steps">${p.steps[lang].map(s=>`<span>${s}</span>`).join('')}</div><p>${t(p.d)}</p></div></div>`).join(''),
 plans:()=>PLANS.map(planCard).join(''),
 faq:()=>FAQ.map(faqItem).join(''),
 faq3:()=>FAQ.slice(0,3).map(faqItem).join(''),
 faqHome:()=>{var a=FAQ.slice(0,3).map(faqItem).join('');var b=FAQ.slice(3).map(faqItem).join('');return '<div class="faqs">'+a+'<div class="faq-extra" id="faqExtra">'+b+'</div></div><div style="text-align:center;margin-top:22px"><button class="see-more" onclick="toggleFaq(this)">'+(lang==='id'?'Lihat pertanyaan lainnya':'See more questions')+' <span class="ico">↓</span></button></div>'},
 terms:()=>TERMS.map(x=>`<div class="gcard purple reveal"><h4>${t(x.h)}</h4><p>${t(x.p)}</p></div>`).join(''),
 payment:()=>PAYMENT.map(x=>`<div class="gcard rose reveal"><h4>${t(x.h)}</h4><p>${t(x.p)}</p></div>`).join(''),
 pthumbs:()=>THUMBS.map(id=>`<a class="pthumb" href="https://hozpasta.com/" target="_blank" rel="noopener"><img src="${HOZ}${id}.jpeg" loading="lazy" alt="Hoz Pasta" onerror="this.style.display='none'"></a>`).join(''),
 portfolioHome:()=>portCard(PORTFOLIO[0],true,0),
 portfolio:()=>PORTFOLIO.map(function(p,i){return portCard(p,false,i)}).join('')
};

function navHTML(){
 const L=[['/','home','nHome'],['/services','services','nSvc'],['/portfolio','portfolio','nPort'],['/packages','packages','nPkg'],['/about','about','nAbout'],['/contact','contact','nContact']];
 return `<a class="brand" href="/"><img src="/assets/img/logo.svg" alt="Forkumi"><span>Forkumi</span></a>
  <div class="nav-links">${L.map(x=>`<a href="${x[0]}" data-page="${x[1]}" data-i="${x[2]}">${t(T[x[2]])}</a>`).join('')}</div>
  <div class="nav-right">
    <div class="lang"><button id="lang-id" onclick="setLang('id')">ID</button><button id="lang-en" onclick="setLang('en')">EN</button></div>
    <a class="talk" href="${WA}" target="_blank" rel="noopener"><span data-i="talk">${t(T.talk)}</span> →</a>
    <button class="burger" aria-label="menu"><span></span><span></span><span></span></button>
  </div>`;
}
function footerHTML(){
 return `<div class="wrap"><div class="fcols">
  <div><div class="fbrand"><img src="/assets/img/logo.svg" alt=""><span>Forkumi</span></div><p class="ftag" data-i="fTag">${t(T.fTag)}</p></div>
  <div><h5 data-i="fExplore">${t(T.fExplore)}</h5>
    <a href="/services" data-i="nSvc">${t(T.nSvc)}</a><a href="/portfolio" data-i="nPort">${t(T.nPort)}</a><a href="/packages" data-i="nPkg">${t(T.nPkg)}</a><a href="/about" data-i="nAbout">${t(T.nAbout)}</a></div>
  <div><h5 data-i="fContact">${t(T.fContact)}</h5><a href="${WA}" target="_blank" rel="noopener">+65 8089 2716</a><a href="${MAIL}">linkforkumi@gmail.com</a><a href="${IG}" target="_blank" rel="noopener">@forkumi.design</a></div>
  <div><h5 data-i="fFollow">${t(T.fFollow)}</h5><div class="fsoc">
    <a href="${IG}" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24">${ICONS.insta}</svg></a>
    <a href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24">${ICONS.chat}</svg></a>
    <a href="${MAIL}" aria-label="Email"><svg viewBox="0 0 24 24">${ICONS.mail}</svg></a></div></div>
  </div>
  <div class="fbot"><span>© 2026 Forkumi. <span data-i="fRights">${t(T.fRights)}</span></span><span data-i="fMade">${t(T.fMade)}</span></div></div>`;
}

function applyI18n(){
 document.querySelectorAll('[data-i]').forEach(el=>{const k=el.getAttribute('data-i');if(T[k]&&!T[k].hl)el.textContent=t(T[k])});
 document.querySelectorAll('[data-head]').forEach(el=>{const k=el.getAttribute('data-head');if(T[k]&&T[k].hl!==undefined)el.innerHTML=headHTML(T[k])});
 document.querySelectorAll('[data-list]').forEach(el=>{const k=el.getAttribute('data-list');if(LIST[k])el.innerHTML=LIST[k]()});
 const ph=document.getElementById('heroH1');if(ph)ph.innerHTML=headHTML(T.heroHead);
}

function renderAll(){
 const nm=document.getElementById('nav-mount');if(nm)nm.innerHTML=navHTML();
 const fm=document.getElementById('footer-mount');if(fm)fm.innerHTML=footerHTML();
 applyI18n();
 afterRender();
}
function setLang(l){lang=l;localStorage.setItem('forkumi_lang',l);renderAll();
 setTimeout(()=>document.querySelectorAll('.reveal').forEach(r=>{if(r.getBoundingClientRect().top<innerHeight*.92)r.classList.add('in')}),20);}

let ro;
function observeReveal(){
 if(ro)ro.disconnect();
 ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -6% 0px'});
 document.querySelectorAll('.reveal:not(.in)').forEach(el=>ro.observe(el));
}
function afterRender(){
 const idb=document.getElementById('lang-id'),enb=document.getElementById('lang-en');
 if(idb)idb.classList.toggle('on',lang==='id');if(enb)enb.classList.toggle('on',lang==='en');
 document.documentElement.lang=lang;
 const page=document.body.dataset.page;
 document.querySelectorAll('.nav-links a[data-page]').forEach(a=>a.classList.toggle('active',a.dataset.page===page));
 const links=document.querySelector('.nav-links'),b=document.querySelector('.burger');
 if(b)b.onclick=()=>links.classList.toggle('open');
 document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>links.classList.remove('open')));
 observeReveal();
}

/* nav scroll + parallax */
function onScroll(){const n=document.getElementById('nav-mount');if(n)n.firstElementChild&&document.querySelector('nav')&&document.querySelector('nav').classList.toggle('scrolled',scrollY>40);
 document.querySelectorAll('.sparkle').forEach(s=>{const d=parseFloat(s.dataset.d||.5);s.style.transform=`translateY(${-scrollY*0.05*d}px)`});}

/* cursor */
function initCursor(){
 if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
 const cur=document.getElementById('cursor'),dot=document.getElementById('dot');if(!cur)return;
 let mx=0,my=0,cx=0,cy=0;
 document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.left=mx+'px';dot.style.top=my+'px'});
 (function loop(){cx+=(mx-cx)*.18;cy+=(my-cy)*.18;cur.style.left=cx+'px';cur.style.top=cy+'px';requestAnimationFrame(loop)})();
 document.addEventListener('pointerover',e=>{cur.classList.toggle('big',!!e.target.closest('a,button,.ind,.gcard,.plan,.stat,.pthumb,.cbtn'))});
}
function initSplash(){
 const s=document.getElementById('splash');if(!s)return;
 if(sessionStorage.getItem('forkumi_seen')){s.classList.add('gone');return;}
 sessionStorage.setItem('forkumi_seen','1');
 setTimeout(()=>s.classList.add('gone'),1500);
 addEventListener('load',()=>setTimeout(()=>s.classList.add('gone'),900));
}

export function initForkumiSite(): void {
 renderAll();initCursor();initSplash();onScroll();
 addEventListener('scroll',onScroll,{passive:true});
 const nt=document.querySelector('.nav-toggle'),nm=document.querySelector('.nav-menu'); if(nt&&nm){nt.addEventListener('click',()=>nm.classList.toggle('open')); nm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nm.classList.remove('open')))}
 document.querySelectorAll('[data-wa]').forEach(a=>a.href=WAP+encodeURIComponent(a.dataset.wa||''));
}
