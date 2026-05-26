import type { EmailAddress, EmailMessage, EmailProvider } from "../types";

const RESEND_EMAILS_URL = "https://api.resend.com/emails";

export interface ResendProviderOptions {
  apiKey: string;
  defaultFrom: string | EmailAddress;
  defaultReplyTo?: string | string[];
}

function formatAddress(address: string | EmailAddress): string {
  if (typeof address === "string") return address;
  return address.name ? `${address.name} <${address.email}>` : address.email;
}

function formatRecipient(value: EmailMessage["to"]): string | string[] {
  const formatOne = (address: string | EmailAddress) => formatAddress(address);
  return Array.isArray(value) ? value.map(formatOne) : formatOne(value);
}

export function createResendProvider(options: ResendProviderOptions): EmailProvider {
  return {
    async send(message) {
      const response = await fetch(RESEND_EMAILS_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: formatAddress(message.from ?? options.defaultFrom),
          to: formatRecipient(message.to),
          reply_to: message.replyTo ?? options.defaultReplyTo,
          subject: message.subject,
          html: message.html,
          text: message.text,
        }),
      });

      const payload = await response.json().catch(() => null) as { id?: string; message?: string; name?: string } | null;

      if (!response.ok) {
        const message = payload?.message ?? payload?.name ?? "Resend email request failed.";
        throw new Error(message);
      }

      if (!payload?.id) {
        throw new Error("Resend did not return an email id.");
      }

      return { id: payload.id };
    },
  };
}
