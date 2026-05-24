import { getContent } from "~/lib/trpc/server";
import Navbar from "./Navbar";

export default async function NavbarServer({ solid }: { solid?: boolean } = {}) {
  const data = await getContent("general");
  return <Navbar solid={solid} logo={data.logo || undefined} />;
}
