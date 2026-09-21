import { z } from 'zod';
import type { CreateAnswerDTO, CreateQuestionDTO } from '@/features/q-and-a/types/q-and-a.type.ts';
import { translate } from '@/features/q-and-a/i18n';
import type { Locale } from '@/shared/i18n/core';

const TAG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createQuestionFormSchema(locale: Locale) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(8, translate(locale, 'forms.titleTooShort'))
      .max(180, translate(locale, 'forms.titleTooLong')),
    content: z
      .string()
      .min(16, translate(locale, 'forms.contentTooShort'))
      .max(15000, translate(locale, 'forms.contentTooLong')),
    tagSlugs: z
      .array(z.string().trim().regex(TAG_SLUG, translate(locale, 'forms.tagInvalid')))
      .min(1, translate(locale, 'newquestion.tagRequired'))
      .max(5, translate(locale, 'forms.tooManyTags')),
  }) satisfies z.ZodType<CreateQuestionDTO>;
}

export function createAnswerFormSchema(locale: Locale) {
  return z.object({
    content: z
      .string()
      .min(4, translate(locale, 'forms.answerTooShort'))
      .max(15000, translate(locale, 'forms.contentTooLong')),
  }) satisfies z.ZodType<CreateAnswerDTO>;
}

export type QuestionFormInput = z.input<ReturnType<typeof createQuestionFormSchema>>;
export type AnswerFormInput = z.input<ReturnType<typeof createAnswerFormSchema>>;
