"use client";

import Navbar from "~/components/layout/Navbar";
import Footer from "~/components/layout/Footer";
import { HeroSection } from "~/components/home/HeroSection";
import { ServicesSection } from "~/components/home/ServicesSection";
import { CapabilitiesSection } from "~/components/home/CapabilitiesSection";
import { ProcessSection } from "~/components/home/ProcessSection";
import { WhySection } from "~/components/home/WhySection";
import { ClientsSection } from "~/components/home/ClientsSection";
import { FaqSection } from "~/components/home/FaqSection";
import { ContactCTASection } from "~/components/home/ContactCTASection";
import { ScrollProgress } from "~/components/ui/scroll-progress";

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
        <ServicesSection />
        <CapabilitiesSection />
        <ProcessSection />
        <WhySection />
        <ClientsSection />
        <FaqSection whatsAppHref={whatsAppHref} hasWhatsApp={hasWhatsApp} />
        <ContactCTASection whatsAppHref={whatsAppHref} hasWhatsApp={hasWhatsApp} />
      </main>
      <Footer siteName={siteName} logo={logo} />
    </>
  );
}