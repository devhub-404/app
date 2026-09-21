export type SendEmailOptions = {
  to: string | string[];
  from: string;
  subject: string;
  html: string;
};

export abstract class EmailServicePort {
  abstract send(options: SendEmailOptions): Promise<void>;
}

export abstract class OutboundEmailPort extends EmailServicePort {}

export const EMAIL_SERVICE = 'EMAIL_SERVICE';
