import { privateClient } from '@/shared/api';
import type { ApiResult } from '@/shared/api';
import type { SubmitFeedbackPayload } from '@/features/feedback/types/feedback.type.ts';
import type { components, paths } from '@devhub-404/api-contract';

export class FeedbackApi {
  static submit(payload: SubmitFeedbackPayload): Promise<ApiResult<unknown>> {
    return privateClient.POST('/api/v1/feedback', { body: payload });
  }
  static listForManagement(
    query?: NonNullable<paths['/api/v1/feedback/administration']['get']['parameters']['query']>,
  ): Promise<
    ApiResult<{ items: components['schemas']['FeedbackDTO'][]; page: number; pageSize: number; total: number }>
  > {
    return privateClient.GET('/api/v1/feedback/administration', { params: { query } }) as Promise<
      ApiResult<{ items: components['schemas']['FeedbackDTO'][]; page: number; pageSize: number; total: number }>
    >;
  }
  static updateStatus(id: string, body: components['schemas']['UpdateFeedbackStatusDTO']) {
    return privateClient.PATCH('/api/v1/feedback/{id}/status', { params: { path: { id } }, body });
  }
}
