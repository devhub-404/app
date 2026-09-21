import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';
import type { BookmarkDTO, SyncMyBookmarksDTO } from '@/shared/interactions/bookmark/types/bookmark.type.ts';

const api = privateClient;

export class InteractionBookmarksApi {
  static list(options?: { signal?: AbortSignal }): Promise<ApiResult<BookmarkDTO[]>> {
    return api.GET('/api/v1/me/bookmarks', { signal: options?.signal });
  }

  static sync(updatedAfter?: string, options?: { signal?: AbortSignal }): Promise<ApiResult<SyncMyBookmarksDTO>> {
    return api.GET('/api/v1/me/bookmarks/sync', {
      params: { query: { updatedAfter } },
      signal: options?.signal,
    });
  }

  static save(resourceId: string, options?: { signal?: AbortSignal }): Promise<ApiResult<BookmarkDTO>> {
    return api.PUT('/api/v1/bookmarks/{resourceId}', {
      params: { path: { resourceId } },
      signal: options?.signal,
    });
  }

  static remove(resourceId: string, options?: { signal?: AbortSignal }): Promise<ApiResult<BookmarkDTO>> {
    return api.DELETE('/api/v1/bookmarks/{resourceId}', {
      params: { path: { resourceId } },
      signal: options?.signal,
    });
  }
}
