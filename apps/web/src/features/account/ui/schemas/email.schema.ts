import { z } from 'zod';
import { translate } from '@/features/account/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createEmailSettingsSchemas(locale: Locale) {
  const email = translate(locale, 'emailssection.emailInvalid');
  const token = translate(locale, 'emailssection.tokenRequired');
  return {
    changeEmail: z.object({ email: z.email(email) }),
    token: z.object({ token: z.string().trim().min(1, token) }),
  };
}

type EmailSettingsSchemas = ReturnType<typeof createEmailSettingsSchemas>;
export type ChangeEmailFormInput = z.input<EmailSettingsSchemas['changeEmail']>;
export type EmailVerificationFormInput = z.input<EmailSettingsSchemas['token']>;
