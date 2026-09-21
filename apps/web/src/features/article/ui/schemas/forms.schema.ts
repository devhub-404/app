import { z } from 'zod';
import { translate } from '@/features/article/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createArticleFormSchema(locale: Locale) {
  const tagSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return z.object({
    title: z.string().trim().min(1, translate(locale, 'forms.titleRequired')),
    description: z
      .string()
      .trim()
      .min(1, translate(locale, 'forms.descriptionRequired'))
      .max(280, translate(locale, 'forms.descriptionTooLong')),
    content: z.string().trim().min(1, translate(locale, 'forms.contentRequired')),
    tags: z
      .array(z.string().trim().regex(tagSlug, translate(locale, 'forms.invalidTag')))
      .max(5, translate(locale, 'forms.useMaximumFiveTags')),
  });
}

export type ArticleFormInput = {
  title: string;
  description: string;
  content: string;
  tags: string[];
};

// Compatibility export for non-UI consumers. Interactive UI should build the schema for its active locale.
export const articleFormSchema = createArticleFormSchema('pt');
