import { FaFacebook, FaInstagram, FaXTwitter, FaTiktok, FaLinkedin, FaYoutube, FaWhatsapp } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { getContent, getLocations } from "~/lib/trpc/server";
import LocationSearch from "./LocationSearch";

const SOCIAL_MAP: { key: string; icon: IconType; label: string }[] = [
  { key: "social_facebook",  icon: FaFacebook,  label: "Facebook"  },
  { key: "social_instagram", icon: FaInstagram, label: "Instagram" },
  { key: "social_twitter",   icon: FaXTwitter,  label: "Twitter / X" },
  { key: "social_tiktok",    icon: FaTiktok,    label: "TikTok"    },
  { key: "social_linkedin",  icon: FaLinkedin,  label: "LinkedIn"  },
  { key: "social_youtube",   icon: FaYoutube,   label: "YouTube"   },
  { key: "social_whatsapp",  icon: FaWhatsapp,  label: "WhatsApp"  },
];

export default async function LokasiSection() {
  const [location, social, rows] = await Promise.all([getContent("location"), getContent("social"), getLocations()]);
  const { location_legend: legend, location_title: title } = location;
  const locations = rows.map((r) => ({ name: r.name, sub: r.location, map: r.location_url }));
  const socials = SOCIAL_MAP.filter(({ key }) => social[key]);

  return (
    <section id="lokasi" className="bg-[#111110] px-6 py-24 md:px-16 lg:px-24">
      <div className="mx-auto max-w-xl text-center">
        {legend && <div className="text-xs tracking-[0.3em] text-white/30" dangerouslySetInnerHTML={{ __html: legend }} />}
        {title && <h2 className="mt-4 font-serif text-4xl text-white md:text-5xl" dangerouslySetInnerHTML={{ __html: title }} />}
        <div className="mx-auto mt-4 h-px w-8 bg-white/20" />
        <LocationSearch locations={locations} />
        {socials.length > 0 && (
          <div className="mt-12 flex items-center justify-center gap-4">
            {socials.map(({ key, icon: Icon, label }) => (
              <a key={key} href={social[key]} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white/40 transition hover:border-white/50 hover:text-white/70">
                <Icon size={18} />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
