import { getContent, getPages } from "~/lib/trpc/server";
import Navbar from "./Navbar";

export default async function NavbarServer() {
  const [data, pages] = await Promise.all([getContent("general"), getPages()]);
  return <Navbar logo={data.logo || undefined} logoDark={data.logo_dark || data.logo || undefined} siteName={data.site_name || "Quantyx"} pages={pages} />;
}
