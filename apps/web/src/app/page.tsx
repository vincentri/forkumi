import { permanentRedirect } from "next/navigation";

export default function HomeRedirect(): never {
  permanentRedirect("/id/");
}
