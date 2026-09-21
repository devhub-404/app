import { z } from 'zod';
import { translate } from '@/features/auth/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createMagicLinkSchema(locale: Locale) {
  return z.object({
    email: z.email(translate(locale, 'validation.emailInvalid')).trim(),
    redirect: z.string().trim().optional(),
  });
}

export type MagicLinkFormInput = z.input<ReturnType<typeof createMagicLinkSchema>>;
