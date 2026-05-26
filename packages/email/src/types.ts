export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailMessage {
  to: string | string[] | EmailAddress | EmailAddress[];
  from?: string | EmailAddress;
  replyTo?: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

export interface EmailSendResult {
  id: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
}
