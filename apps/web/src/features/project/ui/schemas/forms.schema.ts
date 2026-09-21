import { z } from 'zod';
import type { SaveProject } from '@/features/project/types/project.type.ts';
import { translate } from '@/features/project/i18n';
import type { Locale } from '@/shared/i18n/core';

const TAG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createProjectFormSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const optionalUrl = z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.url(message('forms.urlInvalid')).nullable().optional(),
  );
  return z.object({
    title: z.string().trim().min(2, message('forms.titleTooShort')).max(160, message('forms.titleTooLong')),
    summary: z.string().trim().max(320, message('forms.summaryTooLong')),
    description: z.string().trim().max(20000, message('forms.descriptionTooLong')),
    projectUrl: optionalUrl,
    repositoryUrl: optionalUrl,
    tagSlugs: z
      .array(z.string().trim().regex(TAG_SLUG, message('forms.tagInvalid')))
      .max(5, message('forms.tooManyTags')),
  }) satisfies z.ZodType<SaveProject>;
}

export type ProjectFormInput = Omit<SaveProject, 'projectUrl' | 'repositoryUrl'> & {
  projectUrl?: SaveProject['projectUrl'];
  repositoryUrl?: SaveProject['repositoryUrl'];
};
export type ProjectFormOutput = z.output<ReturnType<typeof createProjectFormSchema>>;
