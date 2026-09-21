import { z } from 'zod';
import { translate } from '@/features/account/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createPasswordCredentialSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return z
    .object({
      newPassword: z.string().min(1, message('passwordsection.passwordRequired')),
      confirmPassword: z.string().min(1, message('passwordsection.passwordRequired')),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      path: ['confirmPassword'],
      message: message('passwordsection.passwordsNotMatch'),
    });
}

export type PasswordCredentialFormInput = z.input<ReturnType<typeof createPasswordCredentialSchema>>;

export function createChangePasswordSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return z
    .object({
      email: z.email(message('passwordsection.emailInvalid')),
      currentPassword: z.string().min(1, message('passwordsection.passwordRequired')),
      newPassword: z.string().min(1, message('passwordsection.passwordRequired')),
      confirmPassword: z.string().min(1, message('passwordsection.passwordRequired')),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      path: ['confirmPassword'],
      message: message('passwordsection.passwordsNotMatch'),
    });
}

export type ChangePasswordFormInput = z.input<ReturnType<typeof createChangePasswordSchema>>;

export function createDeleteAccountConfirmationSchema(locale: Locale) {
  return z.object({
    confirmation: z
      .string()
      .trim()
      .refine((value) => value.toUpperCase() === 'DELETE', translate(locale, 'dangersection.typeDeleteToConfirm')),
  });
}

export type DeleteAccountConfirmationFormInput = z.input<ReturnType<typeof createDeleteAccountConfirmationSchema>>;
