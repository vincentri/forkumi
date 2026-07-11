import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { DEFAULT_BRANDING_SETTINGS } from "./default-assets";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Quantyx — seeding database...");

  const hash = await bcrypt.hash("password", 10);

  // Step 1: Create roles FIRST (before any user upsert)
  // "super admin" is the protected built-in role — cannot be edited or deleted
  const superAdminRole = await prisma.role.upsert({
    where: { name: "super admin" },
    update: {}, // never change permissions of the protected role via seed
    create: {
      name: "super admin",
      permissions: ["*:view", "*:create", "*:update", "*:delete"],
      protected: true,
    },
  });

  await prisma.role.upsert({
    where: { name: "viewer" },
    update: {},
    create: {
      name: "viewer",
      permissions: ["*:view"],
      protected: false,
    },
  });

  // Step 2: Upsert admin user — always connect to super admin role
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: { connect: { id: superAdminRole.id } } },
    create: {
      email: "admin@example.com",
      name: "Admin",
      password: hash,
      role: { connect: { id: superAdminRole.id } },
    },
  });

  // Default branding for fresh installs. Existing projects keep their uploaded values.
  for (const setting of DEFAULT_BRANDING_SETTINGS) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        ...setting,
        namespace: "branding",
      },
    });
  }

  await seedFaqs(prisma);
  await seedIndustries(prisma);
  await seedSectionCards(prisma);
  await seedProcessPhases(prisma);
  await seedServiceCategories(prisma);
  await seedPlans(prisma);
  await seedPlanOfInterest(prisma);

  console.log("Seed complete.");
}

type SeededLocale = "id" | "en";

type SeededFaqRow = {
  question: Record<SeededLocale, string>;
  answer: Record<SeededLocale, string>;
};

const SEED_FAQ_ITEMS: SeededFaqRow[] = [
  {
    question: {
      id: "Secepat apa desainku jadi?",
      en: "How fast will I get my designs?",
    },
    answer: {
      id: "Rata-rata request standar (Branding, Desain Grafis, Social Media) kelar maks 24 jam. Request kompleks kayak Website & App butuh waktu lebih, dan pasti kami kabari transparan.",
      en: "Standard requests (Branding, Graphic Design, Social Media) in max 24h. Complex work like Website & App takes a bit longer — always communicated transparently.",
    },
  },
  {
    question: {
      id: "Kalau aku nggak suka hasilnya?",
      en: "What if I don't like the result?",
    },
    answer: {
      id: "Santai! Revisi sepuasnya — kami sempurnakan sampai kamu puas. Tapi ingat, makin banyak revisi makin memengaruhi waktu pengiriman akhir.",
      en: "No worries! Unlimited revisions — we refine until you're happy. Note: more revisions will affect final delivery time.",
    },
  },
  {
    question: {
      id: "Gimana fitur Pause-nya?",
      en: "How does Pause work?",
    },
    answer: {
      id: "Forkumi sistem bulan ke bulan. Kamu bisa jeda atau batalkan kapan aja tanpa denda atau biaya tersembunyi — bebas pilih kapan mau lanjut.",
      en: "Forkumi is month-to-month. Pause or cancel anytime — no penalties, no hidden fees. Resume whenever you're ready.",
    },
  },
  {
    question: {
      id: "Siapa yang punya hak desainnya?",
      en: "Who owns the designs?",
    },
    answer: {
      id: "Kamu, 100%. Setelah desain selesai & dikirim, semua aset kreatif untuk brand-mu jadi milikmu sepenuhnya.",
      en: "You — 100%. Once delivered, all creative assets for your brand are fully yours.",
    },
  },
  {
    question: {
      id: "Kenapa harus Forkumi?",
      en: "Why choose Forkumi?",
    },
    answer: {
      id: "Desain berkualitas tanpa pusing tunjangan karyawan & admin ribet. Biaya tetap bulanan, dan bisa kamu on/off sesuai beban kerja. Fokus bisnis, desain biar kami yang urus.",
      en: "Quality design without HR or messy admin. Flat monthly fee you can switch on/off anytime. Focus on business — we handle design.",
    },
  },
  {
    question: {
      id: "Gimana cara kerjanya?",
      en: "How does it work?",
    },
    answer: {
      id: "Pilih paket → isi form & meeting → bayar → digarap (≤24 jam) → revisi bebas → laporan tiap 3 bulan.",
      en: "Pick a plan → brief & meeting → pay → delivered (≤24h) → revise freely → quarterly report.",
    },
  },
];

async function seedFaqs(prisma: PrismaClient): Promise<void> {
  let inserted = 0;
  for (const locale of ["id", "en"] as const) {
    const existing = await prisma.faqItem.count({ where: { locale } });
    if (existing > 0) {
      continue;
    }
    for (let i = 0; i < SEED_FAQ_ITEMS.length; i += 1) {
      const item = SEED_FAQ_ITEMS[i];
      await prisma.faqItem.create({
        data: {
          question: item.question[locale],
          answer: item.answer[locale],
          locale,
          position: i,
          active: true,
        },
      });
      inserted += 1;
    }
  }
  if (inserted > 0) {
    console.log(`Seeded ${inserted} FAQ rows.`);
  }
}

type SeededIndustryRow = {
  name: Record<SeededLocale, string>;
  tag: Record<SeededLocale, string>;
};

const SEED_INDUSTRY_ITEMS: SeededIndustryRow[] = [
  {
    name: { id: "Startup & Teknologi", en: "Startup & Tech" },
    tag: { id: "Branding · UI/UX · Web", en: "Branding · UI/UX · Web" },
  },
  {
    name: { id: "UMKM & Ritel", en: "SME & Retail" },
    tag: { id: "Logo · Sosmed · Promosi", en: "Logo · Social · Promo" },
  },
  {
    name: { id: "F&B / Kuliner", en: "Food & Beverage" },
    tag: { id: "Kemasan · Menu · Konten", en: "Packaging · Menu · Content" },
  },
  {
    name: { id: "Fashion & Beauty", en: "Fashion & Beauty" },
    tag: { id: "Branding · Katalog · Sosmed", en: "Branding · Catalog · Social" },
  },
  {
    name: { id: "Properti", en: "Property" },
    tag: { id: "Brosur · Web · Iklan", en: "Brochure · Web · Ads" },
  },
  {
    name: { id: "Edukasi", en: "Education" },
    tag: { id: "Materi · Slide · Ilustrasi", en: "Materials · Slides · Illustration" },
  },
  {
    name: { id: "Kesehatan & Wellness", en: "Health & Wellness" },
    tag: { id: "Branding · Konten · App", en: "Branding · Content · App" },
  },
  {
    name: { id: "Jasa & Kreatif", en: "Services & Creative" },
    tag: { id: "Identitas · Web · Motion", en: "Identity · Web · Motion" },
  },
];

async function seedIndustries(prisma: PrismaClient): Promise<void> {
  let inserted = 0;
  for (const locale of ["id", "en"] as const) {
    const existing = await prisma.industryItem.count({ where: { locale } });
    if (existing > 0) {
      continue;
    }
    for (let i = 0; i < SEED_INDUSTRY_ITEMS.length; i += 1) {
      const item = SEED_INDUSTRY_ITEMS[i];
      await prisma.industryItem.create({
        data: {
          name: item.name[locale],
          tag: item.tag[locale],
          locale,
          position: i,
          active: true,
        },
      });
      inserted += 1;
    }
  }
  if (inserted > 0) {
    console.log(`Seeded ${inserted} Industry rows.`);
  }
}

type SeededSectionRow = {
  section: "included" | "terms" | "payment";
  color: string;
  heading: Record<SeededLocale, string>;
  paragraph: Record<SeededLocale, string>;
};

const SEED_SECTION_CARDS: SeededSectionRow[] = [
  {
    section: "included",
    color: "purple",
    heading: {
      id: "Pengerjaan ≤24 jam",
      en: "≤24h turnaround",
    },
    paragraph: {
      id: "Untuk request desain standar.",
      en: "For standard design requests.",
    },
  },
  {
    section: "included",
    color: "rose",
    heading: {
      id: "Revisi sepuasnya",
      en: "Unlimited revisions",
    },
    paragraph: {
      id: "Sampai kamu benar-benar puas.",
      en: "Until you're fully satisfied.",
    },
  },
  {
    section: "included",
    color: "gold",
    heading: {
      id: "Bebas Ikatan",
      en: "No Lock-In",
    },
    paragraph: {
      id: "Pause atau stop kapan aja, fleksibel bulanan.",
      en: "Pause or cancel anytime, flexible monthly.",
    },
  },
  {
    section: "included",
    color: "purple",
    heading: {
      id: "File milikmu",
      en: "You own the files",
    },
    paragraph: {
      id: "Semua aset final 100% milikmu.",
      en: "All final assets are 100% yours.",
    },
  },
  {
    section: "terms",
    color: "purple",
    heading: {
      id: "Permintaan Desain",
      en: "Design Requests",
    },
    paragraph: {
      id: "Sesuai paket (1–3 request aktif), digarap satu per satu.",
      en: "Per plan (1–3 active requests), handled one at a time.",
    },
  },
  {
    section: "terms",
    color: "purple",
    heading: {
      id: "Waktu Pengerjaan",
      en: "Turnaround",
    },
    paragraph: {
      id: "Desain standar maks 24 jam; request kompleks dikabari transparan.",
      en: "Standard in 24h; complex work communicated transparently.",
    },
  },
  {
    section: "terms",
    color: "purple",
    heading: {
      id: "Revisi",
      en: "Revisions",
    },
    paragraph: {
      id: "Unlimited untuk tiap desain sampai kamu puas.",
      en: "Unlimited per design until you're satisfied.",
    },
  },
  {
    section: "terms",
    color: "purple",
    heading: {
      id: "Pause / Berhenti",
      en: "Pause / Cancel",
    },
    paragraph: {
      id: "Kapan aja — tanpa ikatan jangka panjang, tanpa penalti.",
      en: "Anytime — no long-term lock-in, no penalty.",
    },
  },
  {
    section: "terms",
    color: "purple",
    heading: {
      id: "Kepemilikan File",
      en: "File Ownership",
    },
    paragraph: {
      id: "Semua file final 100% milikmu setelah pembayaran.",
      en: "All final files are 100% yours after payment.",
    },
  },
  {
    section: "payment",
    color: "rose",
    heading: {
      id: "Siklus Bulanan",
      en: "Monthly Cycle",
    },
    paragraph: {
      id: "Dibayar di muka tiap awal periode.",
      en: "Billed upfront each period.",
    },
  },
  {
    section: "payment",
    color: "rose",
    heading: {
      id: "Metode",
      en: "Methods",
    },
    paragraph: {
      id: "Transfer bank (BCA/Mandiri) & e-wallet (GoPay, OVO, DANA).",
      en: "Bank transfer & e-wallets (GoPay, OVO, DANA).",
    },
  },
  {
    section: "payment",
    color: "rose",
    heading: {
      id: "Aktivasi",
      en: "Activation",
    },
    paragraph: {
      id: "Pembayaran masuk, desain langsung digarap.",
      en: "Work starts once payment clears.",
    },
  },
  {
    section: "payment",
    color: "rose",
    heading: {
      id: "Tanpa Biaya Tersembunyi",
      en: "No Hidden Fees",
    },
    paragraph: {
      id: "Harga tetap — no per proyek, no kejutan.",
      en: "Flat price — no per-project fees, no surprises.",
    },
  },
  {
    section: "trust",
    color: "purple",
    heading: {
      id: "Bebas Revisi",
      en: "Unlimited Revisions",
    },
    paragraph: {
      id: "Revisi terus sampai kamu sreg. Kepuasanmu nomor satu.",
      en: "Endless revisions until it's perfect. Your happiness comes first.",
    },
  },
  {
    section: "trust",
    color: "rose",
    heading: {
      id: "Konsultasi Gratis",
      en: "Free Consultation",
    },
    paragraph: {
      id: "Ngobrol soal brand-mu tanpa biaya. Kami bantu dari nol.",
      en: "Talk through your brand for free. We help from zero.",
    },
  },
  {
    section: "trust",
    color: "gold",
    heading: {
      id: "File & Aset Stok Gratis",
      en: "Free Files & Stock Assets",
    },
    paragraph: {
      id: "Semua file final + aset stok premium, gratis buat kamu.",
      en: "All final files + premium stock assets, on us.",
    },
  },
  {
    section: "trust",
    color: "purple",
    heading: {
      id: "Hasil Cepat",
      en: "Fast Results",
    },
    paragraph: {
      id: "Tim kami gerak cepat — desain pertama meluncur ≤24 jam.",
      en: "Our team moves fast — first design in ≤24h.",
    },
  },
  {
    section: "trust",
    color: "rose",
    heading: {
      id: "Jeda & Batalkan Mudah",
      en: "Easy Pause & Cancel",
    },
    paragraph: {
      id: "Pause atau stop kapan aja. Bulan ke bulan, no drama.",
      en: "Pause or stop anytime. Month-to-month, no drama.",
    },
  },
  {
    section: "trust",
    color: "gold",
    heading: {
      id: "Tim Profesional",
      en: "Professional Team",
    },
    paragraph: {
      id: "Dikerjakan tim desainer beneran, bukan template asal jadi.",
      en: "Done by a real design team, not lazy templates.",
    },
  },
];

async function seedSectionCards(prisma: PrismaClient): Promise<void> {
  let inserted = 0;
  const sectionsToSeed = Array.from(new Set(SEED_SECTION_CARDS.map((c) => c.section)));
  for (const locale of ["id", "en"] as const) {
    const counts = new Map<string, number>();
    for (const section of sectionsToSeed) {
      const alreadyExists = await prisma.sectionCard.count({
        where: { locale, section },
      });
      if (alreadyExists > 0) {
        continue;
      }
      const sectionCards = SEED_SECTION_CARDS.filter((c) => c.section === section);
      let position = 0;
      for (const card of sectionCards) {
        counts.set(card.section, (counts.get(card.section) ?? 0) + 1);
        await prisma.sectionCard.create({
          data: {
            section: card.section,
            color: card.color,
            heading: card.heading[locale],
            paragraph: card.paragraph[locale],
            locale,
            position,
            active: true,
          },
        });
        inserted += 1;
        position += 1;
      }
    }
  }
  if (inserted > 0) {
    console.log(`Seeded ${inserted} Section Card rows.`);
  }
}

type SeededPhaseRow = {
  title: Record<SeededLocale, string>;
  steps: Record<SeededLocale, string[]>;
  description: Record<SeededLocale, string>;
};

const SEED_PROCESS_PHASES: SeededPhaseRow[] = [
  {
    title: { id: "Pemesanan", en: "Order" },
    steps: {
      id: ["Pilih paket", "Isi form kebutuhan", "Jadwalkan meeting"],
      en: ["Pick a plan", "Fill the brief", "Book a meeting"],
    },
    description: {
      id: "Pilih paket yang pas sama kebutuhanmu, isi form, lalu kita meeting buat bahas detailnya.",
      en: "Pick the plan that fits, fill the form, then we meet to map out the details.",
    },
  },
  {
    title: { id: "Pengerjaan", en: "Production" },
    steps: {
      id: ["Konfirmasi pembayaran", "Tim langsung gas", "Kirim ≤24 jam"],
      en: ["Confirm payment", "Team gets to work", "Deliver in ≤24h"],
    },
    description: {
      id: "Begitu pembayaran masuk, tim langsung garap sesuai brief-mu. Pengiriman pertama maks 24 jam.",
      en: "Once payment clears, the team starts right away. First delivery in max 24 hours.",
    },
  },
  {
    title: { id: "Penilaian", en: "Review" },
    steps: {
      id: ["Revisi sepuasnya", "Laporan tiap 3 bulan", "Penyesuaian strategi"],
      en: ["Revise freely", "Quarterly reports", "Strategy tune-ups"],
    },
    description: {
      id: "Minta revisi sepuasnya dari tiap hasil. Tiap 3 bulan kami kirim laporan biar strategimu makin tajam.",
      en: "Request all the revisions you want. Every 3 months we report back so your strategy stays sharp.",
    },
  },
];

async function seedProcessPhases(prisma: PrismaClient): Promise<void> {
  let inserted = 0;
  for (const locale of ["id", "en"] as const) {
    const existing = await prisma.processPhase.count({ where: { locale } });
    if (existing > 0) {
      continue;
    }
    for (let i = 0; i < SEED_PROCESS_PHASES.length; i += 1) {
      const phase = SEED_PROCESS_PHASES[i];
      await prisma.processPhase.create({
        data: {
          title: phase.title[locale],
          steps: phase.steps[locale].join("\n"),
          description: phase.description[locale],
          locale,
          position: i,
          active: true,
        },
      });
      inserted += 1;
    }
  }
  if (inserted > 0) {
    console.log(`Seeded ${inserted} Process Phase rows.`);
  }
}

type SeededServiceCategoryRow = {
  name: Record<SeededLocale, string>;
  items: Record<SeededLocale, string[]>;
  tint: string;
};

const SEED_SERVICE_CATEGORIES: SeededServiceCategoryRow[] = [
  {
    name: { id: "Branding", en: "Branding" },
    items: {
      id: ["Logo", "Mascot", "Brand Strategy", "Market Research", "Competitor Analysis"],
      en: ["Logo", "Mascot", "Brand Strategy", "Market Research", "Competitor Analysis"],
    },
    tint: "rose",
  },
  {
    name: { id: "Desain Grafis", en: "Graphic Design" },
    items: {
      id: ["Packaging", "Menu Book", "Company Profile", "Invitation", "Motion Graphics"],
      en: ["Packaging", "Menu Book", "Company Profile", "Invitation", "Motion Graphics"],
    },
    tint: "blue",
  },
  {
    name: { id: "Website", en: "Website" },
    items: {
      id: [
        "Personal & Company Website",
        "E-Commerce",
        "UI Design",
        "UX Research",
        "Development",
        "Maintenance",
      ],
      en: [
        "Personal & Company Website",
        "E-Commerce",
        "UI Design",
        "UX Research",
        "Development",
        "Maintenance",
      ],
    },
    tint: "purple",
  },
  {
    name: { id: "Sosial Media", en: "Social Media" },
    items: {
      id: [
        "Content Design",
        "Social Media Management",
        "Food & Product Photography",
        "Video Editing",
      ],
      en: [
        "Content Design",
        "Social Media Management",
        "Food & Product Photography",
        "Video Editing",
      ],
    },
    tint: "yellow",
  },
];

async function seedServiceCategories(prisma: PrismaClient): Promise<void> {
  let inserted = 0;
  for (const locale of ["id", "en"] as const) {
    const existing = await prisma.serviceCategory.count({ where: { locale } });
    if (existing > 0) {
      continue;
    }
    for (let i = 0; i < SEED_SERVICE_CATEGORIES.length; i += 1) {
      const card = SEED_SERVICE_CATEGORIES[i];
      await prisma.serviceCategory.create({
        data: {
          name: card.name[locale],
          items: card.items[locale].join("\n"),
          tint: card.tint,
          locale,
          position: i,
          active: true,
        },
      });
      inserted += 1;
    }
  }
  if (inserted > 0) {
    console.log(`Seeded ${inserted} Service Category rows.`);
  }
}

type SeededPlan = {
  name: string;
  color: string;
  price: Record<SeededLocale, string>;
  normalPrice: Record<SeededLocale, string>;
  best: boolean;
  position: number;
};

const SEED_PLANS: SeededPlan[] = [
  {
    name: "Basic",
    color: "rose",
    price: { en: "Rp 1.500k", id: "Rp 1.500k" },
    normalPrice: { en: "Rp 2.500k", id: "Rp 2.500k" },
    best: false,
    position: 0,
  },
  {
    name: "Standard",
    color: "purple",
    price: { en: "Rp 3.000k", id: "Rp 3.000k" },
    normalPrice: { en: "Rp 4.500k", id: "Rp 4.500k" },
    best: true,
    position: 1,
  },
  {
    name: "Premium",
    color: "gold",
    price: { en: "Rp 6.000k", id: "Rp 6.000k" },
    normalPrice: { en: "Rp 9.000k", id: "Rp 9.000k" },
    best: false,
    position: 2,
  },
];

const SEED_PLAN_FEATURES: Record<string, Record<SeededLocale, string[]>> = {
  Basic: {
    en: [
      "1 active request at a time",
      "Branding & graphic design",
      "Max 24h turnaround",
      "Unlimited revisions",
      "Email support",
    ],
    id: [
      "1 request aktif pada satu waktu",
      "Branding & desain grafis",
      "Kelar maks 24 jam",
      "Revisi sepuasnya",
      "Dukungan email",
    ],
  },
  Standard: {
    en: [
      "2 active requests at a time",
      "All Basic services + Website & App",
      "Max 24h turnaround",
      "Unlimited revisions",
      "Priority support",
      "Monthly strategy call",
    ],
    id: [
      "2 request aktif pada satu waktu",
      "Semua layanan Basic + Website & App",
      "Kelar maks 24 jam",
      "Revisi sepuasnya",
      "Dukungan prioritas",
      "Strategy call bulanan",
    ],
  },
  Premium: {
    en: [
      "3 active requests at a time",
      "All Standard services",
      "Max 24h turnaround",
      "Unlimited revisions",
      "Dedicated manager",
      "Weekly strategy call",
      "Quarterly report",
    ],
    id: [
      "3 request aktif pada satu waktu",
      "Semua layanan Standard",
      "Kelar maks 24 jam",
      "Revisi sepuasnya",
      "Manajer khusus",
      "Strategy call mingguan",
      "Laporan kuartalan",
    ],
  },
};

async function seedPlans(prisma: PrismaClient): Promise<void> {
  const existing = await prisma.plan.count();
  if (existing > 0) {
    return;
  }
  let featuresInserted = 0;
  for (const p of SEED_PLANS) {
    for (const locale of ["id", "en"] as const) {
      const plan = await prisma.plan.create({
        data: {
          name: p.name,
          color: p.color,
          price: p.price[locale],
          normalPrice: p.normalPrice[locale],
          best: p.best,
          locale,
          position: p.position,
          active: true,
        },
      });
      const texts = SEED_PLAN_FEATURES[p.name][locale];
      for (let i = 0; i < texts.length; i += 1) {
        await prisma.planFeature.create({
          data: {
            planId: plan.id,
            text: texts[i],
            locale,
            position: i,
          },
        });
        featuresInserted += 1;
      }
    }
  }
  console.log(`Seeded ${SEED_PLANS.length * 2} plans (en+id) and ${featuresInserted} plan features.`);
}

const SEED_PLAN_OF_INTEREST: Record<SeededLocale, string[]> = {
  id: ["Basic", "Standard", "Premium"],
  en: ["Basic", "Standard", "Premium"],
};

async function seedPlanOfInterest(prisma: PrismaClient): Promise<void> {
  let inserted = 0;
  for (const locale of ["id", "en"] as const) {
    const existing = await prisma.planOfInterest.count({ where: { locale } });
    if (existing > 0) {
      continue;
    }
    const names = SEED_PLAN_OF_INTEREST[locale];
    for (let i = 0; i < names.length; i += 1) {
      await prisma.planOfInterest.create({
        data: {
          name: names[i],
          locale,
          position: i,
          active: true,
        },
      });
      inserted += 1;
    }
  }
  if (inserted > 0) {
    console.log(`Seeded ${inserted} Plan of Interest rows.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
