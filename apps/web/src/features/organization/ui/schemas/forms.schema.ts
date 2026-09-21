import { z } from 'zod';
import type { components } from '@devhub-404/api-contract';
import type { CreateOrganizationInput } from '@/features/organization/types/organization.type.ts';
import { translate } from '@/features/organization/i18n';
import type { Locale } from '@/shared/i18n/core';

const ORGANIZATION_TYPES = [
  'company',
  'community',
  'open_source',
  'foundation',
  'group',
  'institution',
  'other',
] as const;
const ORGANIZATION_ROLES = ['owner', 'admin', 'member'] as const;

export function createOrganizationFormSchema(locale: Locale) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, translate(locale, 'forms.nameTooShort'))
      .max(160, translate(locale, 'forms.nameTooLong')),
    type: z.enum(ORGANIZATION_TYPES),
    description: z
      .string()
      .trim()
      .min(1, translate(locale, 'forms.descriptionRequired'))
      .max(10000, translate(locale, 'forms.descriptionTooLong')),
    websiteUrl: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
      z.url(translate(locale, 'forms.websiteInvalid')).nullable().optional(),
    ),
  }) satisfies z.ZodType<CreateOrganizationInput>;
}

export type OrganizationFormInput = Omit<CreateOrganizationInput, 'websiteUrl' | 'avatarUrl'> & {
  websiteUrl?: CreateOrganizationInput['websiteUrl'];
};

export function createOrganizationMemberSchema(locale: Locale) {
  return z.object({
    accountId: z.uuid(translate(locale, 'forms.accountIdInvalid')),
    role: z.enum(ORGANIZATION_ROLES),
  }) satisfies z.ZodType<components['schemas']['AddOrganizationMemberDTO']>;
}

export type OrganizationMemberFormInput = z.input<ReturnType<typeof createOrganizationMemberSchema>>;
