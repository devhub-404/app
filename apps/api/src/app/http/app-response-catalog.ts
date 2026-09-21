import { HttpStatus } from '@nestjs/common';
import type { ResponseMetadata } from '@/shared/http/response-metadata';
import { COMMON_RESPONSES } from '@/app/http/responses/common';
import {
  ACCOUNT_COMMON_RESPONSES,
  AUTH_RESPONSES,
  SESSION_RESPONSES,
  USER_RESPONSES,
} from '@/modules/account/public/responses';
import { UPLOAD_RESPONSES } from '@/modules/media/public/responses';
import { PLATFORM_RESPONSES } from '@/app/runtime/platform/public/responses';
import { CONTACT_COMMON_RESPONSES, CONTACT_RESPONSES } from '@/modules/contact/public/responses';
import { FEEDBACK_RESPONSES } from '@/modules/feedback/public';
import { NOTIFICATION_RESPONSES } from '@/modules/notification/public/responses';
import { CONTENT_RESPONSES } from '@/app/http/content-responses';
import { DISCOVERY_RESPONSES } from '@/modules/discovery/public/responses';
import { VOTE_RESPONSES } from '@/modules/vote/public';
import { VIEW_RESPONSES } from '@/modules/view/public';
import { COMMENT_RESPONSES } from '@/modules/comment/public';
import { ARTICLE_RESPONSES } from '@/modules/article/public/responses';
import { NEWS_RESPONSES } from '@/modules/news/public/responses';
import { RESOURCE_RESPONSES } from '@/modules/external-resource/public/responses';
import { TAG_RESPONSES } from '@/modules/taxonomy/public/responses';
import { BOOKMARK_RESPONSES } from '@/modules/bookmark/public';
import { MODERATION_RESPONSES } from '@/modules/moderation/public/responses';

export const AppResponses = {
  ...COMMON_RESPONSES,
  ...ACCOUNT_COMMON_RESPONSES,
  ...AUTH_RESPONSES,
  ...USER_RESPONSES,
  ...SESSION_RESPONSES,
  ...UPLOAD_RESPONSES,
  ...RESOURCE_RESPONSES,
  ...TAG_RESPONSES,
  ...ARTICLE_RESPONSES,
  ...CONTENT_RESPONSES,
  ...NEWS_RESPONSES,
  ...PLATFORM_RESPONSES,
  ...CONTACT_RESPONSES,
  ...FEEDBACK_RESPONSES,
  ...CONTACT_COMMON_RESPONSES,
  ...NOTIFICATION_RESPONSES,
  ...BOOKMARK_RESPONSES,
  ...DISCOVERY_RESPONSES,
  ...VOTE_RESPONSES,
  ...VIEW_RESPONSES,
  ...COMMENT_RESPONSES,
  ...MODERATION_RESPONSES,
} as const satisfies ResponseMetadata;

export type AppCode = keyof typeof AppResponses;

export const FALLBACK_ERROR_CODE: AppCode = 'INTERNAL_SERVER_ERROR';

export function isAppCode(code: unknown): code is AppCode {
  return typeof code === 'string' && code in AppResponses;
}

export function getResponseByCode(code: unknown): {
  code: AppCode;
  status: (typeof HttpStatus)[keyof typeof HttpStatus];
  message: string;
} {
  if (isAppCode(code)) {
    return { code, ...AppResponses[code] };
  }

  return {
    code: FALLBACK_ERROR_CODE,
    ...AppResponses[FALLBACK_ERROR_CODE],
  };
}
