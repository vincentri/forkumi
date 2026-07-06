import { redirect } from "next/navigation";

export default function AboutRedirect(): never {
  redirect("/id/about");
}
