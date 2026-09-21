import { z } from 'zod';
import { translate } from '@/features/account/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createAccountLifecycleSchemas(locale: Locale) {
  const required = translate(locale, 'lifecycle.codeRequired');
  return {
    totp: z.object({ code: z.string().trim().min(1, required) }),
    recovery: z.object({ code: z.string().trim().min(1, required) }),
  };
}

export type ReactivationCodeFormInput = z.input<ReturnType<typeof createAccountLifecycleSchemas>['totp']>;
