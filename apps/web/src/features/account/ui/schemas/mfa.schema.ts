import { z } from 'zod';
import { translate } from '@/features/account/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createMfaSchemas(locale: Locale) {
  const required = translate(locale, 'securitysection.codeRequired');
  return {
    totpEnrollment: z.object({ code: z.string().trim().min(1, required) }),
    disable: z.object({
      method: z.enum(['totp', 'recovery_code']),
      code: z.string().trim().min(1, required),
    }),
    possessionProof: z.object({ code: z.string().trim().min(1, required) }),
  };
}

export function createPasskeyDeviceNameSchema(locale: Locale) {
  return z.object({
    deviceName: z.string().trim().max(120, translate(locale, 'securitysection.deviceNameTooLong')).optional(),
  });
}

export type PasskeyDeviceNameFormInput = z.input<ReturnType<typeof createPasskeyDeviceNameSchema>>;

export type TotpEnrollmentFormInput = z.input<ReturnType<typeof createMfaSchemas>['totpEnrollment']>;
export type DisableMfaFormInput = z.input<ReturnType<typeof createMfaSchemas>['disable']>;
