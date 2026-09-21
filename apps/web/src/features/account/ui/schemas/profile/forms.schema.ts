import { z } from 'zod';
import type { UpdateProfileDTO } from '@/features/account/types/profile.type.ts';
import { createProfileFields } from '@/features/account/ui/schemas/profile/fields.schema.ts';
import type { Locale } from '@/shared/i18n/core';

export type UpdateProfileFormInput = UpdateProfileDTO;

export function createUpdateProfileSchema(locale: Locale) {
  const fields = createProfileFields(locale);
  return z.object({
    username: fields.profileUsernameField,
    displayName: fields.profileDisplayNameField,
    headline: fields.profileHeadlineField,
    bio: fields.profileBioField,
    location: fields.profileLocationField,
    avatarMediaId: fields.profileAvatarUrlField,
    portfolioUrl: fields.profilePortfolioUrlField,
    githubUrl: fields.profileGithubUrlField,
    linkedinUrl: fields.profileLinkedinUrlField,
    twitterUrl: fields.profileTwitterUrlField,
  }) satisfies z.ZodType<UpdateProfileDTO>;
}

export const updateProfileSchema = createUpdateProfileSchema('pt');
