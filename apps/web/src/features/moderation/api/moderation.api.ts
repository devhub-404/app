import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';
export class ModerationApi {
  static listHidden(): Promise<ApiResult<unknown>> {
    return privateClient.GET('/api/v1/moderation/hidden') as Promise<ApiResult<unknown>>;
  }
  static unhideResource(resourceId: string): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/moderation/resources/{resourceId}/unhide', {
      params: { path: { resourceId } },
    }) as Promise<ApiResult<unknown>>;
  }
  static unhideComment(commentId: string): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/moderation/comments/{commentId}/unhide', {
      params: { path: { commentId } },
    }) as Promise<ApiResult<unknown>>;
  }
}
