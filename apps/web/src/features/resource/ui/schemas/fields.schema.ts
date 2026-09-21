import { z } from 'zod';
import { translate } from '@/features/resource/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createResourceFields(locale: Locale) {
  const invalidUrl = translate(locale, 'fields.urlInvalid');
  return {
    requiredTitleField: z.string().trim().min(1, translate(locale, 'fields.titleRequired')),
    requiredDescriptionField: z.string().trim().min(1, translate(locale, 'fields.descriptionRequired')),
    tagsField: z.array(z.string().trim().min(1)).max(5, translate(locale, 'fields.useMaximumFiveTags')),
    requiredUrlField: z.string().trim().min(1, translate(locale, 'fields.urlRequired')).pipe(z.url(invalidUrl)),
    optionalUrlField: z.union([z.literal(''), z.string().trim().pipe(z.url(invalidUrl))]),
    optionalTextField: z.union([z.literal(''), z.string().trim()]),
    optionalLongTextField: z.union([z.literal(''), z.string().trim()]),
  };
}

const pt = createResourceFields('pt');
export const requiredTitleField = pt.requiredTitleField;
export const requiredDescriptionField = pt.requiredDescriptionField;
export const tagsField = pt.tagsField;
export const requiredUrlField = pt.requiredUrlField;
export const optionalUrlField = pt.optionalUrlField;
export const optionalTextField = pt.optionalTextField;
export const optionalLongTextField = pt.optionalLongTextField;
