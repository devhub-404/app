import { z } from 'zod';
import type { ContactBody } from '@/features/contact/types/contact.type.ts';
import { translate } from '@/features/contact/i18n';
import type { Locale } from '@/shared/i18n/core';

const CONTACT_MESSAGE_TYPES = ['institutional', 'legal', 'support'] as const;

function optionalContextUrl(locale: Locale) {
  return z
    .string()
    .max(2048, translate(locale, 'contact.validation.contextUrlTooLong'))
    .refine(
      (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      translate(locale, 'contact.validation.contextUrlInvalid'),
    )
    .optional();
}

export function createContactFormSchema(locale: Locale) {
  return z.object({
    type: z.enum(CONTACT_MESSAGE_TYPES),
    name: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z.string().trim().max(80, translate(locale, 'contact.validation.nameTooLong')).optional(),
    ),
    email: z.email(translate(locale, 'contact.validation.emailInvalid')).trim(),
    subject: z
      .string()
      .trim()
      .min(3, translate(locale, 'contact.validation.subjectTooShort'))
      .max(160, translate(locale, 'contact.validation.subjectTooLong')),
    message: z
      .string()
      .trim()
      .min(10, translate(locale, 'contact.validation.messageTooShort'))
      .max(4000, translate(locale, 'contact.validation.messageTooLong')),
    contextUrl: optionalContextUrl(locale),
  }) satisfies z.ZodType<ContactBody>;
}

export type ContactFormInput = Omit<ContactBody, 'name'> & {
  name?: ContactBody['name'];
};
