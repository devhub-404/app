import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';

export class FollowApi {
  static list(): Promise<ApiResult<unknown>> {
    return privateClient.GET('/api/v1/tags/following') as Promise<ApiResult<unknown>>;
  }

  static follow(slug: string): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/tags/{slug}/follow', {
      params: { path: { slug } },
    }) as Promise<ApiResult<unknown>>;
  }

  static unfollow(slug: string): Promise<ApiResult<unknown>> {
    return privateClient.DELETE('/api/v1/tags/{slug}/follow', {
      params: { path: { slug } },
    }) as Promise<ApiResult<unknown>>;
  }
}
