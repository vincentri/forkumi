import { prisma } from "@repo/db";
import { createEmailService, type EmailMessage } from "@repo/email";
import { createResendProvider } from "@repo/email/providers/resend";
import { decryptSecret, isEncryptedSecret } from "./secret-crypto";

export type EmailProviderId = "resend";

export interface EmailSettings {
  enabled: boolean;
  provider: EmailProviderId;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  resendApiKeyConfigured: boolean;
}

const EMAIL_NAMESPACE = "email";
const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  enabled: false,
  provider: "resend",
  fromEmail: "",
  fromName: "",
  replyTo: "",
  resendApiKeyConfigured: false,
};

type SettingsRow = {
  key: string;
  value: string | null;
};

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
    provider: "resend",
    fromEmail: values.emailFromEmail ?? "",
    fromName: values.emailFromName ?? "",
    replyTo: values.emailReplyTo ?? "",
    resendApiKeyConfigured: isEncryptedSecret(values.emailResendApiKey),
  };
}

async function getRequiredEmailConfig() {
  const values = rowsToMap(await getEmailSettingsRows());
  const settings = await getEmailSettings();

  if (!settings.enabled) {
    throw new Error("Email delivery is disabled.");
  }

  if (!settings.fromEmail) {
    throw new Error("Email from address is required.");
  }

  const encryptedApiKey = values.emailResendApiKey;
  if (!isEncryptedSecret(encryptedApiKey)) {
    throw new Error("Resend API key is not configured.");
  }

  return {
    ...settings,
    provider: "resend" as const,
    resendApiKey: decryptSecret(encryptedApiKey),
  };
}

export async function createConfiguredEmailService() {
  const config = await getRequiredEmailConfig();

  return createEmailService(
    createResendProvider({
      apiKey: config.resendApiKey,
      defaultFrom: {
        email: config.fromEmail,
        name: config.fromName || undefined,
      },
      defaultReplyTo: config.replyTo || undefined,
    }),
  );
}

export async function sendEmail(message: EmailMessage) {
  const email = await createConfiguredEmailService();
  return email.send(message);
}
