import { z } from 'zod';
import type { SubmitFeedbackPayload } from '@/features/feedback/types/feedback.type.ts';
import { translate } from '@/features/feedback/i18n';
import type { Locale } from '@/shared/i18n/core';

const FEEDBACK_CATEGORIES = ['bug', 'issue', 'suggestion'] as const;

export function createFeedbackFormSchema(locale: Locale) {
  return z.object({
    category: z.enum(FEEDBACK_CATEGORIES),
    description: z
      .string()
      .trim()
      .min(10, translate(locale, 'feedback.validation.descriptionTooShort'))
      .max(4000, translate(locale, 'feedback.validation.descriptionTooLong')),
    contextUrl: z
      .string()
      .max(2048, translate(locale, 'feedback.validation.contextUrlTooLong'))
      .refine(
        (value) => {
          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        translate(locale, 'feedback.validation.contextUrlInvalid'),
      )
      .optional(),
    screenshotMediaId: z.string().optional(),
  }) satisfies z.ZodType<SubmitFeedbackPayload>;
}

export type FeedbackFormInput = z.input<ReturnType<typeof createFeedbackFormSchema>>;
