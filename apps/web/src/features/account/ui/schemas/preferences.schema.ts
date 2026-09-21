import { z } from 'zod';
import type { UpdatePreferencesDTO } from '@/features/account/types/account.type.ts';
import { translate } from '@/features/account/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createAccountPreferencesSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);

  return z.object({
    locale: z
      .enum(['pt', 'en', 'es'], { error: message('preferences.invalidLocale') })
      .nullable()
      .optional(),
    profileVisibility: z.enum(['public', 'private'], { error: message('preferences.invalidVisibility') }).optional(),
  }) satisfies z.ZodType<UpdatePreferencesDTO>;
}

export type AccountPreferencesInput = z.input<ReturnType<typeof createAccountPreferencesSchema>>;
