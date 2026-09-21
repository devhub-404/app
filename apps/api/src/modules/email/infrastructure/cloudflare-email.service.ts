import { Inject, Injectable, Logger } from '@nestjs/common';
import { EMAIL_CONFIG, type EmailConfig } from '@/modules/email/public/email-config.port';
import { EmailServicePort, type SendEmailOptions } from '@/modules/email/public/email.service.port';

type CloudflareEmailAddress = string | { address: string; name?: string };

@Injectable()
export class CloudflareEmailService extends EmailServicePort {
  private readonly logger = new Logger(CloudflareEmailService.name);

  constructor(@Inject(EMAIL_CONFIG) private readonly config: EmailConfig) {
    super();
  }

  async send(options: SendEmailOptions): Promise<void> {
    const apiToken = this.config.apiToken;
    if (!apiToken) throw new Error('Cloudflare Email Service is not configured');

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.config.accountId}/email/sending/send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: options.to,
          from: this.toAddress(options.from),
          subject: options.subject,
          html: options.html,
          text: this.toText(options.html),
        }),
      },
    );

    if (!response.ok) {
      // Provider bodies are not trusted for logging: they can echo message data
      // or credentials. Status is enough for the operational failure signal.
      throw new Error(`Cloudflare Email Service rejected message: status=${response.status}`);
    }

    this.logger.log('Email submitted');
  }

  private toAddress(from: string): CloudflareEmailAddress {
    if (from.includes('@')) return from;

    return { address: this.config.fromAddress, name: from };
  }

  private toText(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
