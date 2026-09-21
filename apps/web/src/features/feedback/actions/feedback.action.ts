import { FeedbackApi } from '@/features/feedback/api/feedback.api.ts';
import { isFeedbackDescriptionValid } from '@/features/feedback/types/feedback.rules.type.ts';
import type { SubmitFeedbackPayload } from '@/features/feedback/types/feedback.type.ts';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canManageFeedback } from '@/features/feedback/access/feedback.access.ts';
import type { ApiResult } from '@/shared/api';

type FeedbackManagementQuery = Parameters<typeof FeedbackApi.listForManagement>[0];
type FeedbackManagementResult = Awaited<ReturnType<typeof FeedbackApi.listForManagement>>;

const canUseFeedbackManagement = () => isClientAccessAllowed(canManageFeedback);

export async function submitFeedback(payload: SubmitFeedbackPayload) {
  const description = payload.description.trim();
  if (!isFeedbackDescriptionValid(description)) throw new Error('FEEDBACK_DESCRIPTION_INVALID');

  const result = await FeedbackApi.submit({ ...payload, description });
  if (result.error) throw new Error(result.error.code ?? 'FEEDBACK_FAILED');
  return result.data?.data;
}

export function listFeedbackForManagement(query?: FeedbackManagementQuery): Promise<FeedbackManagementResult> {
  if (!canUseFeedbackManagement()) {
    return Promise.resolve({ data: { data: { items: [], page: 1, pageSize: 0, total: 0 } } });
  }
  return FeedbackApi.listForManagement(query);
}

export function updateFeedbackStatus(
  id: string,
  body: Parameters<typeof FeedbackApi.updateStatus>[1],
): Promise<ApiResult<unknown>> {
  if (!canUseFeedbackManagement()) return Promise.resolve({ error: { code: 'AUTHORIZATION_REQUIRED' } });
  return FeedbackApi.updateStatus(id, body) as Promise<ApiResult<unknown>>;
}
