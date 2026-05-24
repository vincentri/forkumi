import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";
import { getServerAuthSession } from "~/lib/auth";

export const metadata: Metadata = { title: "Account | Admin" };

export default async function AccountPage() {
  const session = await getServerAuthSession();

  return (
    <AccountClient
      initialEmail={session?.user.email ?? ""}
      initialName={session?.user.name ?? ""}
    />
  );
}
