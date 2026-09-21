import { z } from 'zod';
import { translate } from '@/features/news/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createNewsFormSchema(locale: Locale) {
  const tagSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return z.object({
    title: z.string().trim().min(1, translate(locale, 'forms.titleRequired')),
    description: z
      .string()
      .trim()
      .min(1, translate(locale, 'forms.descriptionRequired'))
      .max(280, translate(locale, 'forms.descriptionTooLong')),
    coverImageUrl: z
      .string()
      .trim()
      .pipe(z.url(translate(locale, 'forms.invalidUrl')))
      .optional()
      .or(z.literal('')),
    content: z.string().trim().min(1, translate(locale, 'forms.contentRequired')),
    occurredAt: z.string().nullable().optional(),
    sourceUrl: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z
        .string()
        .trim()
        .pipe(z.url(translate(locale, 'forms.invalidUrl')))
        .optional(),
    ),
    tags: z
      .array(z.string().trim().regex(tagSlug, translate(locale, 'forms.invalidTag')))
      .max(5, translate(locale, 'forms.useMaximumFiveTags')),
  });
}

export type NewsFormInput = z.input<ReturnType<typeof createNewsFormSchema>> & {
  sourceUrl: string;
};

export function createNewsSuggestionSchema(locale: Locale) {
  return z.object({
    url: z
      .string()
      .trim()
      .min(1, translate(locale, 'suggestion.urlRequired'))
      .pipe(z.url(translate(locale, 'suggestion.urlInvalid'))),
  });
}

export type NewsSuggestionFormInput = z.input<ReturnType<typeof createNewsSuggestionSchema>>;

// Compatibility export for non-UI consumers. Interactive UI should build the schema for its active locale.
export const newsFormSchema = createNewsFormSchema('pt');
