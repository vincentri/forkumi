import { TRPCError } from "@trpc/server";
import { prisma } from "~/lib/db";
import { z } from "@repo/crud";
import { getEmailSettings, sendEmail } from "~/lib/email";
import { encryptSecret } from "~/lib/secret-crypto";
import { permissionProcedure, router } from "../trpc";

const EMAIL_NAMESPACE = "email";

const settingsInput = z.object({
  enabled: z.boolean(),
  fromEmail: z.string().trim(),
  fromName: z.string().trim(),
  replyTo: z.string().trim(),
  notifyTo: z.string().trim().refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Enter a valid notification email or leave blank.",
  ),
});

const resendApiKeyInput = z.object({
  apiKey: z.string().trim().min(1, "Resend API key is required."),
});

const testEmailInput = z.object({
  to: z.string().trim().email("Enter a valid test recipient email."),
});

type SettingValue = string | boolean;

async function upsertEmailSetting(key: string, value: SettingValue) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = prisma as any;
  return db.settings.upsert({
    where: { key },
    update: { namespace: EMAIL_NAMESPACE, value: String(value) },
    create: { key, namespace: EMAIL_NAMESPACE, value: String(value) },
  });
}

export const emailSettingsRouter = router({
  get: permissionProcedure("view", "settings").query(() => getEmailSettings()),

  update: permissionProcedure("update", "settings")
    .input(settingsInput)
    .mutation(async ({ input }) => {
      if (input.enabled && !input.fromEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "From email is required when email delivery is enabled.",
        });
      }

      if (input.fromEmail && !z.string().email().safeParse(input.fromEmail).success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Enter a valid from email address.",
        });
      }

      if (input.replyTo && !z.string().email().safeParse(input.replyTo).success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Enter a valid reply-to email address.",
        });
      }

      await Promise.all([
        upsertEmailSetting("emailEnabled", input.enabled),
        upsertEmailSetting("emailFromEmail", input.fromEmail),
        upsertEmailSetting("emailFromName", input.fromName),
        upsertEmailSetting("emailReplyTo", input.replyTo),
        upsertEmailSetting("emailNotifyTo", input.notifyTo),
      ]);

      return getEmailSettings();
    }),

  updateResendApiKey: permissionProcedure("update", "settings")
    .input(resendApiKeyInput)
    .mutation(async ({ input }) => {
      await upsertEmailSetting("emailResendApiKey", encryptSecret(input.apiKey));
      return getEmailSettings();
    }),

  sendTest: permissionProcedure("update", "settings")
    .input(testEmailInput)
    .mutation(async ({ input }) => {
      const result = await sendEmail({
        to: input.to,
        subject: "Quantyx email test",
        html: "<p>Your email provider is configured correctly.</p>",
        text: "Your email provider is configured correctly.",
      });

      return result;
    }),
});
