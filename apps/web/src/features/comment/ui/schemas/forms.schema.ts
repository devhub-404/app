import { z } from 'zod';
import type { CreateCommentDTO } from '@/features/comment/types/comment.type.ts';
import { translate } from '@/features/comment/i18n';
import type { Locale } from '@/shared/i18n/core';

export function createCommentFormSchema(locale: Locale) {
  return z.object({
    parentId: z.uuid(translate(locale, 'forms.parentInvalid')).optional(),
    content: z.string().trim().min(1, translate(locale, 'forms.contentRequired')),
  }) satisfies z.ZodType<CreateCommentDTO>;
}

export type CommentFormInput = z.input<ReturnType<typeof createCommentFormSchema>>;
