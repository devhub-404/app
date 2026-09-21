import { z } from 'zod';
import type { SuggestResourceDTO } from '@/features/resource/types/resource.type.ts';
import { translate } from '@/features/resource/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createResourceSuggestionSchema(locale: Locale) {
  return z.object({
    url: z
      .string()
      .trim()
      .pipe(z.url(translate(locale, 'fields.urlInvalid'))),
  }) satisfies z.ZodType<SuggestResourceDTO>;
}

export type ResourceSuggestionFormInput = z.input<ReturnType<typeof createResourceSuggestionSchema>>;
