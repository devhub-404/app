import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';
import type { ViewResult } from '@/shared/interactions/view/types/view.type.ts';

export class ViewApi {
  static record(resourceId: string, options?: { signal?: AbortSignal }): Promise<ApiResult<ViewResult>> {
    return privateClient.POST('/api/v1/views/{resourceId}', {
      params: { path: { resourceId } },
      signal: options?.signal,
    });
  }
}
