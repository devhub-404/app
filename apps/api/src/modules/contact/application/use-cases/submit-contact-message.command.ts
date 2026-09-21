import { Inject, Injectable } from '@nestjs/common';
import { CONTACT_CONFIG, type ContactConfig } from '@/modules/contact/public/contact-config.port';
import { SubmitContactMessageInputDTO } from '@/modules/contact/application/dtos/in';
import { SubmitContactMessageOutputDTO } from '@/modules/contact/application/dtos/out';
import { contactMessageTemplate } from '@/modules/email/public';
import { EmailServicePort } from '@/modules/email/public';
import { ContactSubmissionPolicy } from '@/modules/contact/domain';

@Injectable()
export class SubmitContactMessageCommand {
  constructor(
    private readonly emailService: EmailServicePort,
    @Inject(CONTACT_CONFIG) private readonly config: ContactConfig,
  ) {}

  async execute(input: SubmitContactMessageInputDTO): Promise<SubmitContactMessageOutputDTO> {
    ContactSubmissionPolicy.assertReplyEmail(input.email);
    ContactSubmissionPolicy.assertType(input.type);
    const contextUrl = input.contextUrl
      ? ContactSubmissionPolicy.normalizeContextUrl(input.contextUrl, this.config.siteUrl)
      : undefined;
    const template = contactMessageTemplate({ ...input, ...(contextUrl ? { contextUrl } : {}) });

    await this.emailService.send({
      from: 'DevHub 404',
      to: this.config.recipientAddress,
      subject: template.subject,
      html: template.html,
    });

    return { accepted: true };
  }
}
