export const EMAIL_CONFIG = Symbol('EMAIL_CONFIG');

export type EmailConfig = {
  provider: 'local' | 'cloudflare';
  fromAddress: string;
  accountId: string;
  apiToken?: string;
  local: { outboxDir: string };
};
