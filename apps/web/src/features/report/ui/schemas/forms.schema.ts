import { z } from 'zod';
import type { CreateResourceReportInput, ReviewReportInput } from '@/features/report/types/report.type.ts';
import { translate } from '@/features/report/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createReportFormSchema(locale: Locale) {
  return z.object({
    reason: z
      .string()
      .trim()
      .min(1, translate(locale, 'forms.reasonRequired'))
      .max(80, translate(locale, 'forms.reasonTooLong')),
    description: z.string().trim().max(2000, translate(locale, 'forms.descriptionTooLong')).optional(),
  }) satisfies z.ZodType<CreateResourceReportInput>;
}

export function createReportReviewSchema(locale: Locale) {
  return z.object({
    note: z.string().trim().max(2000, translate(locale, 'forms.noteTooLong')).optional(),
  }) satisfies z.ZodType<Pick<ReviewReportInput, 'note'>>;
}

export type ReportFormInput = z.input<ReturnType<typeof createReportFormSchema>>;
export type ReportReviewFormInput = z.input<ReturnType<typeof createReportReviewSchema>>;
