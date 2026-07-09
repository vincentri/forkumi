import { prisma } from "~/lib/db";
import { type EmailMessage } from "@repo/email";
import { createResendProvider } from "@repo/email/providers/resend";
import { decryptSecret, isEncryptedSecret } from "./secret-crypto";

export interface EmailSettings {
  enabled: boolean;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  notifyTo: string;
  resendApiKeyConfigured: boolean;
}

const EMAIL_NAMESPACE = "email";

type SettingsRow = { key: string; value: string | null };

async function getEmailSettingsRows(): Promise<SettingsRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  return db.settings.findMany({
    where: { namespace: EMAIL_NAMESPACE },
    select: { key: true, value: true },
  });
}

function rowsToMap(rows: SettingsRow[]): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.key, row.value ?? ""]));
}

export async function getEmailSettings(): Promise<EmailSettings> {
  const values = rowsToMap(await getEmailSettingsRows());
  return {
    enabled: values.emailEnabled === "true",
    fromEmail: values.emailFromEmail ?? "",
    fromName: values.emailFromName ?? "",
    replyTo: values.emailReplyTo ?? "",
    notifyTo: values.emailNotifyTo ?? "",
    resendApiKeyConfigured: isEncryptedSecret(values.emailResendApiKey),
  };
}

export async function sendEmail(message: EmailMessage) {
  const values = rowsToMap(await getEmailSettingsRows());
  if (values.emailEnabled !== "true") throw new Error("Email delivery is disabled.");
  if (!values.emailFromEmail) throw new Error("Email from address is required.");
  const encryptedApiKey = values.emailResendApiKey;
  if (!isEncryptedSecret(encryptedApiKey)) throw new Error("Resend API key is not configured.");

  const provider = createResendProvider({
    apiKey: decryptSecret(encryptedApiKey),
    defaultFrom: {
      email: values.emailFromEmail,
      name: values.emailFromName || undefined,
    },
    defaultReplyTo: values.emailReplyTo || undefined,
  });
  return provider.send(message);
}
