import { z } from 'zod';
import type { components } from '@devhub-404/api-contract';
import { translate } from '@/features/panel/i18n';
import type { Locale } from '@/shared/i18n/core';

const TAG_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TERM_KINDS = ['reserved', 'blocked'] as const;

export function createTaxonomySchemas(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return {
    createTag: z.object({
      name: z.string().trim().max(32, message('forms.tagNameTooLong')),
      slug: z.string().trim().max(32, message('forms.tagSlugTooLong')).regex(TAG_SLUG, message('forms.tagSlugInvalid')),
    }) satisfies z.ZodType<components['schemas']['CreateTagDTO']>,
    updateTag: z.object({
      name: z.string().trim().max(32, message('forms.tagNameTooLong')).min(1, message('forms.tagNameRequired')),
      slug: z.string().trim().max(32, message('forms.tagSlugTooLong')).regex(TAG_SLUG, message('forms.tagSlugInvalid')),
    }) satisfies z.ZodType<components['schemas']['UpdateTagDTO']>,
    alias: z.object({
      tagId: z.uuid(message('forms.tagIdInvalid')),
      alias: z.string().trim().max(64, message('forms.aliasTooLong')).min(1, message('forms.aliasRequired')),
    }) satisfies z.ZodType<components['schemas']['CreateTagAliasDTO']>,
    protectedTerm: z.object({
      value: z.string().trim().max(64, message('forms.termTooLong')).min(1, message('forms.termRequired')),
      kind: z.enum(TERM_KINDS),
    }) satisfies z.ZodType<components['schemas']['SetTagIdentityTermDTO']>,
    merge: z
      .object({
        sourceTagId: z.uuid(message('forms.tagIdInvalid')),
        targetTagId: z.uuid(message('forms.tagIdInvalid')),
      })
      .refine(
        (value) => value.sourceTagId !== value.targetTagId,
        message('forms.mergeTagsMustDiffer'),
      ) satisfies z.ZodType<components['schemas']['MergeTagsDTO']>,
  };
}

type TaxonomySchemas = ReturnType<typeof createTaxonomySchemas>;
export type CreateTagFormInput = z.input<TaxonomySchemas['createTag']>;
export type UpdateTagFormInput = z.input<TaxonomySchemas['updateTag']>;
export type TagAliasFormInput = z.input<TaxonomySchemas['alias']>;
export type ProtectedTermFormInput = z.input<TaxonomySchemas['protectedTerm']>;
export type MergeTagsFormInput = z.input<TaxonomySchemas['merge']>;

export function createNewsSuggestionReviewSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return z.object({
    title: z.string().trim().min(1, message('forms.newsSuggestionTitleRequired')),
    description: z.string().trim(),
    content: z.string().trim(),
  });
}

export type NewsSuggestionReviewFormInput = z.input<ReturnType<typeof createNewsSuggestionReviewSchema>>;

export function createEventSuggestionReviewSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return z
    .object({
      title: z.string().trim().min(1, message('forms.eventTitleRequired')).max(180, message('forms.eventTitleTooLong')),
      description: z
        .string()
        .trim()
        .min(1, message('forms.eventDescriptionRequired'))
        .max(30000, message('forms.eventDescriptionTooLong')),
      startsAt: z.string().min(1, message('forms.eventStartRequired')),
      endsAt: z.string().min(1, message('forms.eventEndRequired')),
      format: z.enum(['online', 'in_person', 'hybrid'], { error: message('forms.eventFormatInvalid') }),
    })
    .superRefine((value, ctx) => {
      const start = new Date(value.startsAt);
      const end = new Date(value.endsAt);
      if (Number.isNaN(start.getTime()))
        ctx.addIssue({ code: 'custom', path: ['startsAt'], message: message('forms.eventDateInvalid') });
      if (Number.isNaN(end.getTime()))
        ctx.addIssue({ code: 'custom', path: ['endsAt'], message: message('forms.eventDateInvalid') });
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
        ctx.addIssue({ code: 'custom', path: ['endsAt'], message: message('forms.eventEndAfterStart') });
      }
    });
}

export type EventSuggestionReviewFormInput = z.input<ReturnType<typeof createEventSuggestionReviewSchema>>;

export function createEventSuggestionRejectSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return z.object({
    reason: z.string().trim().min(1, message('forms.eventRejectReasonRequired')),
  });
}

export type EventSuggestionRejectFormInput = z.input<ReturnType<typeof createEventSuggestionRejectSchema>>;

export function createResourceSuggestionReviewSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, message('forms.resourceSuggestionTitleRequired'))
      .max(40, message('forms.resourceSuggestionTitleTooLong')),
    description: z
      .string()
      .trim()
      .min(1, message('forms.resourceSuggestionDescriptionRequired'))
      .max(160, message('forms.resourceSuggestionDescriptionTooLong')),
    tags: z.array(z.string()).max(5),
  });
}

export type ResourceSuggestionReviewFormInput = z.input<ReturnType<typeof createResourceSuggestionReviewSchema>>;

export function createResourceSuggestionRejectSchema() {
  return z.object({ decisionNote: z.string().trim() });
}

export type ResourceSuggestionRejectFormInput = z.input<ReturnType<typeof createResourceSuggestionRejectSchema>>;
