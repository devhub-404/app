import { z } from 'zod';
import type { ResourceSubmitData } from '@/features/resource/ui/types/resource-submit.type.ts';
import { createResourceFields } from '@/features/resource/ui/schemas/fields.schema.ts';
import type { Locale } from '@/shared/i18n/core';

export function createResourceSchema(locale: Locale) {
  const fields = createResourceFields(locale);
  return z.object({
    title: fields.requiredTitleField,
    description: fields.requiredDescriptionField,
    tags: fields.tagsField,
    url: fields.requiredUrlField,
  }) satisfies z.ZodType<ResourceSubmitData>;
}

export function createResourceApiSchema(locale: Locale) {
  const fields = createResourceFields(locale);
  return z.object({
    title: fields.requiredTitleField,
    description: fields.requiredDescriptionField,
    tags: fields.tagsField,
    url: fields.requiredUrlField,
    pricingModel: z.enum(['free', 'freemium', 'trial', 'paid']).default('free'),
    docsUrl: fields.optionalUrlField,
  }) satisfies z.ZodType<ResourceSubmitData>;
}

export const resourceSchema = createResourceSchema('pt');
export const resourceApiSchema = createResourceApiSchema('pt');
