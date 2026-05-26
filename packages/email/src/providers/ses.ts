import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type { EmailAddress, EmailMessage, EmailProvider } from "../types";

export interface SesProviderOptions {
  defaultFrom: string | EmailAddress;
  defaultReplyTo?: string | string[];
}

function formatAddress(address: string | EmailAddress): string {
  if (typeof address === "string") return address;
  return address.name ? `${address.name} <${address.email}>` : address.email;
}

function formatAddresses(value: string | string[] | EmailAddress | EmailAddress[]): string[] {
  const values = Array.isArray(value) ? value : [value];
  return values.map(formatAddress);
}

export function createSesProvider(options: SesProviderOptions): EmailProvider {
  const client = new SESv2Client({});

  return {
    async send(message: EmailMessage) {
      const command = new SendEmailCommand({
        FromEmailAddress: formatAddress(message.from ?? options.defaultFrom),
        Destination: {
          ToAddresses: formatAddresses(message.to),
        },
        ReplyToAddresses: message.replyTo
          ? Array.isArray(message.replyTo)
            ? message.replyTo
            : [message.replyTo]
          : options.defaultReplyTo
            ? Array.isArray(options.defaultReplyTo)
              ? options.defaultReplyTo
              : [options.defaultReplyTo]
            : undefined,
        Content: {
          Simple: {
            Subject: {
              Data: message.subject,
              Charset: "UTF-8",
            },
            Body: {
              Html: message.html
                ? {
                    Data: message.html,
                    Charset: "UTF-8",
                  }
                : undefined,
              Text: message.text
                ? {
                    Data: message.text,
                    Charset: "UTF-8",
                  }
                : undefined,
            },
          },
        },
      });

      const result = await client.send(command);
      if (!result.MessageId) {
        throw new Error("SES did not return an email id.");
      }

      return { id: result.MessageId };
    },
  };
}
