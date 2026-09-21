import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';
import type { SyncMyVotes, VoteSetResult } from '@/shared/interactions/vote/types/vote.type.ts';

export class VoteApi {
  static set(resourceId: string, options?: { signal?: AbortSignal }): Promise<ApiResult<VoteSetResult>> {
    return privateClient.PUT('/api/v1/votes/{resourceId}', {
      params: { path: { resourceId } },
      signal: options?.signal,
    });
  }

  static remove(resourceId: string, options?: { signal?: AbortSignal }): Promise<ApiResult<VoteSetResult>> {
    return privateClient.DELETE('/api/v1/votes/{resourceId}', {
      params: { path: { resourceId } },
      signal: options?.signal,
    });
  }

  static sync(updatedAfter?: string, options?: { signal?: AbortSignal }): Promise<ApiResult<SyncMyVotes>> {
    return privateClient.GET('/api/v1/me/votes', {
      params: { query: { updatedAfter } },
      signal: options?.signal,
    });
  }
}
