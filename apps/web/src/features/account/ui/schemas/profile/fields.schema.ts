import { z } from 'zod';
import { translate } from '@/features/account/i18n';
import type { Locale } from '@/shared/i18n/core';

const emptyToUndefined = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const emptyToNull = (value: unknown) => (typeof value === 'string' && value.trim() === '' ? null : value);

export function createProfileFields(locale: Locale) {
  const urlField = z.preprocess(emptyToNull, z.url(translate(locale, 'fields.urlInvalid')).nullable().optional());
  return {
    profileUsernameField: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .trim()
        .min(3, translate(locale, 'fields.usernameTooShort'))
        .max(50, translate(locale, 'fields.usernameTooLong'))
        .optional(),
    ),
    profileDisplayNameField: z.preprocess(
      emptyToNull,
      z.string().trim().max(100, translate(locale, 'fields.nameTooLong')).nullable().optional(),
    ),
    profileHeadlineField: z.preprocess(
      emptyToNull,
      z.string().trim().max(160, translate(locale, 'fields.headlineTooLong')).nullable().optional(),
    ),
    profileBioField: z.preprocess(
      emptyToNull,
      z.string().trim().max(500, translate(locale, 'fields.bioTooLong')).nullable().optional(),
    ),
    profileLocationField: z.preprocess(
      emptyToNull,
      z.string().trim().max(120, translate(locale, 'fields.locationTooLong')).nullable().optional(),
    ),
    profileAvatarUrlField: z.preprocess(emptyToNull, z.string().nullable().optional()),
    profilePortfolioUrlField: urlField,
    profileGithubUrlField: urlField,
    profileLinkedinUrlField: urlField,
    profileTwitterUrlField: urlField,
  };
}

const pt = createProfileFields('pt');
export const profileUsernameField = pt.profileUsernameField;
export const profileDisplayNameField = pt.profileDisplayNameField;
export const profileHeadlineField = pt.profileHeadlineField;
export const profileBioField = pt.profileBioField;
export const profileLocationField = pt.profileLocationField;
export const profileAvatarUrlField = pt.profileAvatarUrlField;
export const profilePortfolioUrlField = pt.profilePortfolioUrlField;
export const profileGithubUrlField = pt.profileGithubUrlField;
export const profileLinkedinUrlField = pt.profileLinkedinUrlField;
export const profileTwitterUrlField = pt.profileTwitterUrlField;
