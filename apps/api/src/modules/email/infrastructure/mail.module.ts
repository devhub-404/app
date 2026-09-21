import { Module } from '@nestjs/common';
import { EMAIL_CONFIG, type EmailConfig } from '@/modules/email/public/email-config.port';
import { EMAIL_SERVICE, EmailServicePort } from '@/modules/email/public/email.service.port';
import { CloudflareEmailService } from '@/modules/email/infrastructure/cloudflare-email.service';
import { LocalEmailService } from '@/modules/email/infrastructure/local-email.service';

@Module({
  exports: [EmailServicePort, EMAIL_SERVICE],
  providers: [
    {
      provide: EmailServicePort,
      inject: [EMAIL_CONFIG],
      useFactory: (config: EmailConfig) =>
        config.provider === 'cloudflare' ? new CloudflareEmailService(config) : new LocalEmailService(config),
    },
    {
      provide: EMAIL_SERVICE,
      useExisting: EmailServicePort,
    },
  ],
})
export class EmailInfrastructureModule {}
