import { z } from 'zod';
import type { CreateEventDTO } from '@/features/event/public';
import { translate } from '@/features/panel/i18n';
import type { Locale } from '@/shared/i18n/core';

const EVENT_FORMATS = ['online', 'in_person', 'hybrid'] as const;

export function createEventAdminFormSchema(locale: Locale) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return z
    .object({
      title: z.string().trim().min(1, message('forms.eventTitleRequired')).max(180, message('forms.eventTitleTooLong')),
      description: z
        .string()
        .trim()
        .min(1, message('forms.eventDescriptionRequired'))
        .max(30000, message('forms.eventDescriptionTooLong')),
      url: z
        .string()
        .trim()
        .min(1, message('forms.eventUrlRequired'))
        .pipe(z.url(message('forms.eventUrlInvalid'))),
      startsAt: z.string().min(1, message('forms.eventStartRequired')),
      endsAt: z.string().min(1, message('forms.eventEndRequired')),
      format: z.enum(EVENT_FORMATS, { error: message('forms.eventFormatInvalid') }),
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
    }) satisfies z.ZodType<Omit<CreateEventDTO, 'location' | 'coverMediaId'>>;
}

export type EventAdminFormInput = z.input<ReturnType<typeof createEventAdminFormSchema>>;
