import { z } from 'zod';
import type { CreateEventDTO, SubmitEventSuggestionDTO } from '@/features/event/types/event.type.ts';
import { translate } from '@/features/event/i18n';
import type { Locale } from '@/shared/i18n/core';

const EVENT_FORMATS = ['online', 'in_person', 'hybrid'] as const;

export function createEventFormSchema(locale: Locale, direct: boolean) {
  const message = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  const fields = {
    url: z
      .string()
      .trim()
      .min(1, message('newevent.invalidUrl'))
      .pipe(z.url(message('newevent.invalidUrl')))
      .refine((value) => value.startsWith('https://'), message('newevent.httpsRequired')),
  };

  if (!direct) return z.object(fields);

  return z
    .object({
      ...fields,
      title: z.string().trim().min(4, message('newevent.titleTooShort')).max(180, message('newevent.titleTooLong')),
      description: z
        .string()
        .trim()
        .min(20, message('newevent.descriptionTooShort'))
        .max(30000, message('newevent.descriptionTooLong')),
      startsAt: z.string().min(1, message('newevent.startRequired')),
      endsAt: z.string().min(1, message('newevent.endRequired')),
      format: z.enum(EVENT_FORMATS, { error: message('newevent.formatInvalid') }),
    })
    .superRefine((value, ctx) => {
      const start = new Date(value.startsAt);
      const end = new Date(value.endsAt);
      if (Number.isNaN(start.getTime()))
        ctx.addIssue({ code: 'custom', path: ['startsAt'], message: message('newevent.invalidDate') });
      if (Number.isNaN(end.getTime()))
        ctx.addIssue({ code: 'custom', path: ['endsAt'], message: message('newevent.invalidDate') });
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end <= start) {
        ctx.addIssue({ code: 'custom', path: ['endsAt'], message: message('newevent.endAfterStart') });
      }
    });
}

export type EventFormInput = Pick<CreateEventDTO, 'url' | 'title' | 'description' | 'startsAt' | 'endsAt' | 'format'>;
export type EventSuggestionFormInput = SubmitEventSuggestionDTO;
