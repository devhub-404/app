import { Inject, Injectable, Logger } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { isAbsolute, resolve } from 'node:path';
import { EMAIL_CONFIG, type EmailConfig } from '@/modules/email/public/email-config.port';
import { EmailServicePort, type SendEmailOptions } from '@/modules/email/public/email.service.port';

type LocalMailEnvelope = {
  id: string;
  to: string[];
  from: string;
  subject: string;
  htmlFile: string;
  urls: string[];
  createdAt: string;
};

function extractUrls(html: string): string[] {
  const urls = new Set<string>();
  for (const match of html.matchAll(/https?:\/\/[^"'\s<>]+/g)) {
    urls.add(match[0].replace(/&amp;/g, '&'));
  }

  return [...urls];
}

@Injectable()
export class LocalEmailService extends EmailServicePort {
  private readonly logger = new Logger(LocalEmailService.name);

  constructor(@Inject(EMAIL_CONFIG) private readonly config: EmailConfig) {
    super();
  }

  async send(options: SendEmailOptions): Promise<void> {
    const outbox = isAbsolute(this.config.local.outboxDir)
      ? this.config.local.outboxDir
      : resolve(process.cwd(), this.config.local.outboxDir);

    await mkdir(outbox, { recursive: true });

    const id = `${Date.now()}-${randomUUID()}`;
    const htmlFile = `${id}.html`;
    const envelopeFile = `${id}.json`;
    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const envelope: LocalMailEnvelope = {
      id,
      to: recipients,
      from: options.from,
      subject: options.subject,
      htmlFile,
      urls: extractUrls(options.html),
      createdAt: new Date().toISOString(),
    };

    await Promise.all([
      writeFile(resolve(outbox, htmlFile), options.html, 'utf8'),
      writeFile(resolve(outbox, envelopeFile), `${JSON.stringify(envelope, null, 2)}\n`, 'utf8'),
    ]);

    // The outbox files are the local delivery surface. URLs can contain bearer
    // proofs, so never duplicate message contents, recipients or URLs into logs.
    this.logger.log(`Local email captured: id=${id}`);
  }
}
