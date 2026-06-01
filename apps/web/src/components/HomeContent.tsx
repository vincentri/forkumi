"use client";

import Navbar from "~/components/layout/Navbar";
import Footer from "~/components/layout/Footer";
import { HeroSection } from "~/components/home/HeroSection";
import { ServicesSection } from "~/components/home/ServicesSection";
import { HowWeWorkSection } from "~/components/home/HowWeWorkSection";
import { CapabilityProofSection } from "~/components/home/CapabilityProofSection";
import { TechStackSection } from "~/components/home/TechStackSection";
import { WhatTeamsValueSection } from "~/components/home/WhatTeamsValueSection";
import { FaqSection } from "~/components/home/FaqSection";
import { ContactCTASection } from "~/components/home/ContactCTASection";
import { BrandWordmark } from "~/components/home/BrandWordmark";
import { ClientsStrip } from "~/components/home/ClientsStrip";
import { ScrollProgress } from "~/components/magicui/ScrollProgress";

interface HomeContentProps {
  siteName: string;
  logo: string;
  whatsAppHref: string;
  hasWhatsApp: boolean;
  stacks: string[];
  navbarPages: { slug: string; title: string }[];
}

export default function HomeContent({ siteName, logo, whatsAppHref, hasWhatsApp, stacks, navbarPages }: HomeContentProps) {
  return (
    <>
      <ScrollProgress />
      <Navbar logo={logo} siteName={siteName} pages={navbarPages} />
      <main className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <HeroSection whatsAppHref={whatsAppHref} hasWhatsApp={hasWhatsApp} />
        <ClientsStrip />
        <ServicesSection />
        <HowWeWorkSection />
        <CapabilityProofSection />
        <TechStackSection />
        <WhatTeamsValueSection />
        <FaqSection />
        <ContactCTASection whatsAppHref={whatsAppHref} hasWhatsApp={hasWhatsApp} />
      </main>
      <Footer siteName={siteName} logo={logo} />
      <BrandWordmark siteName={siteName} />
    </>
  );
}
