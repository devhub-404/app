import { z } from 'zod';
import type { SubmitCommunityJob } from '@/features/job/types/job.type.ts';
import { translate } from '@/features/job/i18n';
import type { Locale } from '@/shared/i18n/core';

const JOB_TYPES = ['full_time', 'part_time', 'contract', 'internship', 'temporary'] as const;
const WORKPLACE_TYPES = ['remote', 'hybrid', 'onsite'] as const;
const COMPENSATION_UNITS = ['hourly', 'daily', 'monthly', 'yearly', 'fixed_project'] as const;
const TAG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const optionalNumber = (message: string) =>
  z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number(message).min(0.01, message).nullable().optional(),
  );

export function createJobFormSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return z
    .object({
      title: z.string().trim().min(4, message('forms.titleTooShort')).max(180, message('forms.titleTooLong')),
      description: z
        .string()
        .trim()
        .min(20, message('forms.descriptionTooShort'))
        .max(20000, message('forms.descriptionTooLong')),
      employmentType: z.enum(JOB_TYPES),
      workplaceType: z.enum(WORKPLACE_TYPES),
      location: z.string().trim().max(180, message('forms.locationTooLong')).nullable().optional(),
      compensationMin: optionalNumber(message('forms.compensationInvalid')),
      compensationMax: optionalNumber(message('forms.compensationInvalid')),
      compensationCurrency: z.string().trim().length(3, message('forms.currencyInvalid')).nullable().optional(),
      compensationUnit: z.enum(COMPENSATION_UNITS).nullable().optional(),
      applicationUrl: z
        .string()
        .trim()
        .pipe(z.url(message('forms.applicationUrlInvalid'))),
      sourceUrl: z.preprocess(
        (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
        z
          .string()
          .trim()
          .pipe(z.url(message('forms.sourceUrlInvalid')))
          .optional(),
      ),
      publisherOrganizationId: z.string().trim().optional(),
      tagSlugs: z
        .array(z.string().trim().regex(TAG_SLUG, message('forms.tagInvalid')))
        .max(5, message('forms.tooManyTags')),
    })
    .superRefine((value, ctx) => {
      if (value.workplaceType !== 'remote' && !value.location?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['location'], message: message('forms.locationRequired') });
      }
    });
}

export type JobFormInput = Omit<SubmitCommunityJob, 'compensationMin' | 'compensationMax'> & {
  publisherOrganizationId?: string;
  compensationMin?: number | string | null;
  compensationMax?: number | string | null;
};
export type JobFormOutput = z.output<ReturnType<typeof createJobFormSchema>>;
