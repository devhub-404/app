import { Global, Module } from '@nestjs/common';
import { env } from '@/app/config/env';
import { AUTH_CONFIG, type AuthConfig } from '@/modules/auth/public/auth-config.port';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';
import { EMAIL_CONFIG, type EmailConfig } from '@/modules/email/public/email-config.port';
import { CONTACT_CONFIG, type ContactConfig } from '@/modules/contact/public/contact-config.port';

const authConfig: AuthConfig = {
  secureCookies: env.secureCookies,
  siteUrl: env.siteUrl,
  jwtSecret: env.jwtSecret,
  auth: env.auth,
  oauth: env.oauth,
};
const mediaConfig: MediaConfig = {
  storage: {
    bucket: env.cf.r2.bucket,
    endpoint: env.cf.r2.api,
    accessKeyId: env.cf.r2.accessKeyId,
    secretAccessKey: env.cf.r2.secretAccessKey,
    publicBaseUrl: env.cf.r2.publicBaseUrl,
    managedPrefixes: ['avatars/', 'content/'],
  },
  upload: env.media,
};
const emailConfig: EmailConfig = {
  provider: env.emailProvider,
  fromAddress: env.email.fromAddress,
  accountId: env.cf.accountId,
  ...(env.cf.apiToken ? { apiToken: env.cf.apiToken } : {}),
  local: { outboxDir: env.local.emailOutboxDir },
};
const contactConfig: ContactConfig = { siteUrl: env.siteUrl, recipientAddress: env.email.contactRecipientAddress };

@Global()
@Module({
  providers: [
    { provide: AUTH_CONFIG, useValue: authConfig },
    { provide: MEDIA_CONFIG, useValue: mediaConfig },
    { provide: EMAIL_CONFIG, useValue: emailConfig },
    { provide: CONTACT_CONFIG, useValue: contactConfig },
  ],
  exports: [AUTH_CONFIG, MEDIA_CONFIG, EMAIL_CONFIG, CONTACT_CONFIG],
})
export class ConfigurationModule {}
