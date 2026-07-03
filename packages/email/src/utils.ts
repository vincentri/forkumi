import type { EmailAddress } from "./types";

export function formatAddress(address: string | EmailAddress): string {
  if (typeof address === "string") return address;
  return address.name ? `${address.name} <${address.email}>` : address.email;
}
