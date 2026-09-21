import { QAndAApi } from '@/features/q-and-a/api/q-and-a.api.ts';
import { isClientAccessAllowed } from '@/features/auth/public';
import { canModerateQuestion } from '@/features/q-and-a/access/question.access.ts';
import type { ApiClient } from '@/shared/api';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';

export async function getQuestionQuery(id: string, client?: ApiClient) {
  return QAndAApi.get(id, client);
}

export function listQuestionsForManagement(query?: Parameters<typeof QAndAApi.listForManagement>[0]) {
  if (!isClientAccessAllowed(canModerateQuestion)) {
    return Promise.resolve({ data: { data: { items: [], page: 1, pageSize: 0, total: 0 } } });
  }
  return QAndAApi.listForManagement(query);
}

export function listMyQAndAContributions(limit?: number) {
  return QAndAApi.listMine(limit);
}

export function listMyAnswers(limit?: number) {
  return QAndAApi.listMyAnswers(limit);
}

export function listQuestionsQuery(query?: Parameters<typeof QAndAApi.list>[0], client?: ApiClient) {
  return QAndAApi.list(query, client);
}

export async function createQuestion(payload: Parameters<typeof QAndAApi.create>[0]) {
  try {
    const result = await QAndAApi.create(payload);
    if (result.error) notifyError(result.error.code);
    else notifySuccess(result.data?.code);
    return result;
  } catch {
    notifyError('NETWORK_REQUEST_FAILED');
    throw new Error('NETWORK_REQUEST_FAILED');
  }
}
export function answerQuestion(id: string, content: string) {
  return QAndAApi.answer(id, content);
}
export function acceptQuestionAnswer(id: string, answerId: string) {
  return QAndAApi.accept(id, answerId);
}
export function removeAcceptedQuestionAnswer(id: string) {
  return QAndAApi.removeAccepted(id);
}
export function deleteQuestion(id: string) {
  return QAndAApi.deleteQuestion(id);
}
export function deleteQuestionAnswer(id: string, answerId: string) {
  return QAndAApi.deleteAnswer(id, answerId);
}

export function closeQuestion(id: string) {
  return QAndAApi.close(id);
}
export function reopenQuestion(id: string) {
  return QAndAApi.reopen(id);
}
export function hideQuestion(id: string) {
  return QAndAApi.hide(id);
}
export function unhideQuestion(id: string) {
  return QAndAApi.unhide(id);
}
export function hideQuestionAnswer(answerId: string) {
  return QAndAApi.hide(answerId);
}
export function unhideQuestionAnswer(answerId: string) {
  return QAndAApi.unhide(answerId);
}
