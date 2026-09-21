import { z } from 'zod';
import { translate } from '@/features/panel/i18n';
import type { Locale } from '@/shared/i18n/core';

export const ACCOUNT_RESTRICTION_CAPABILITIES = ['CONTRIBUTION', 'COMMENT', 'VOTE', 'JOB_PUBLISH'] as const;

export function createUserAdminSchemas(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return {
    suspension: z.object({
      lockedUntil: z.string().trim().min(1, message('useradmindetail.enterDataSuspension')),
    }),
    restriction: z.object({
      capability: z.enum(ACCOUNT_RESTRICTION_CAPABILITIES),
      reason: z.string().trim().min(1, message('useradmindetail.restrictionReasonRequired')),
    }),
  };
}

type UserAdminSchemas = ReturnType<typeof createUserAdminSchemas>;
export type SuspensionFormInput = z.input<UserAdminSchemas['suspension']>;
export type RestrictionFormInput = z.input<UserAdminSchemas['restriction']>;
export type AccountRestrictionCapability = (typeof ACCOUNT_RESTRICTION_CAPABILITIES)[number];
