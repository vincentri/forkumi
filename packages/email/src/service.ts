import type { EmailMessage, EmailProvider, EmailSendResult } from "./types";

export function createEmailService(provider: EmailProvider) {
  return {
    send(message: EmailMessage): Promise<EmailSendResult> {
      return provider.send(message);
    },
  };
}
