import { NewsApi } from '@/features/news/api/news.api.ts';
import { toNewsDetails, toNewsItem } from '@/features/news/types/news.type.ts';
import type { NewsDTO, NewsItem } from '@/features/news/types/news.dto.type.ts';
import type { ApiClient } from '@/shared/api';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import {
  canDeleteNews,
  canEditNews,
  canManageNews,
  canReviewNewsSuggestions,
} from '@/features/news/access/news.access.ts';
import type { Actor } from '@/features/auth/public/access';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';

type ListQuery = Parameters<typeof NewsApi.list>[0];
type ManagementQuery = Parameters<typeof NewsApi.listForManagement>[0];
type DraftInput = Parameters<typeof NewsApi.saveDraft>[0];
type UpdateInput = Parameters<typeof NewsApi.update>[1];

export type ListNewsQuery = ListQuery;

const canUse = (predicate: (actor: Actor) => boolean) => isClientAccessAllowed(predicate);
const canUseNews = () => canUse(canEditNews);
const canUseNewsManagement = () => canUse(canManageNews);
const canUseNewsSuggestions = () => canUse(canReviewNewsSuggestions);

function mapItems(data: { data?: { items: unknown[] } | unknown[] } | undefined) {
  const items = data?.data && 'items' in data.data ? data.data.items : data?.data;
  return (Array.isArray(items) ? items : []).map((item) => toNewsItem(item as NewsItem));
}

async function listNewsData(query: ListQuery = {}, client?: ApiClient) {
  const { data, error } = await NewsApi.list(query, client);
  const page = data?.data && !Array.isArray(data.data) ? data.data : undefined;
  return { items: error ? [] : mapItems(data), total: page?.total ?? 0, error };
}

async function listManagementData(query: ManagementQuery = {}) {
  if (!canUseNewsManagement()) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const { data, error } = await NewsApi.listForManagement(query);
  return { items: error ? [] : mapItems(data), error };
}

async function getNewsData(
  request: typeof NewsApi.getById | typeof NewsApi.getBySlug,
  value: string,
  client?: ApiClient,
) {
  const { data, error, response } = await request(value, client);
  return { item: error || !data?.data ? null : toNewsDetails(data.data as NewsDTO), error, response };
}

async function saveDraftData(payload: DraftInput) {
  const { data } = await NewsApi.saveDraft(payload);
  return { code: data?.code, item: data?.data ? toNewsItem(data.data) : null, failed: !data };
}

async function mutationData(request: () => ReturnType<typeof NewsApi.update>) {
  const { response } = await request();
  return { failed: !response.ok };
}

async function submitSuggestionData(url: string) {
  const { data } = await NewsApi.submitSuggestion(url);
  return { code: data?.code, failed: !data };
}

export async function listNews(query: ListNewsQuery = {}, client?: ApiClient) {
  return listNewsData(query, client);
}

export async function listNewsForManagement(query?: ManagementQuery) {
  return listManagementData(query ?? {});
}

export async function loadNewsBySlug(slug: string, client?: ApiClient) {
  return getNewsData(NewsApi.getBySlug, slug, client);
}

export async function loadNewsById(id: string, client?: ApiClient) {
  if (!canUseNewsManagement()) return null;
  const { item } = await getNewsData(NewsApi.getById, id, client);
  return item;
}

export async function loadMyNewsSuggestions() {
  const { data, error } = await NewsApi.listMySuggestions();
  return { items: data?.data ?? [], error };
}

export async function loadPopularNewsSources() {
  const { data, error } = await NewsApi.listPopularSources();
  return { items: data?.data ?? [], error };
}

export async function loadPendingNewsSuggestions() {
  if (!canUseNewsSuggestions()) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const { data, error } = await NewsApi.listPendingSuggestions();
  return { items: data?.data ?? [], error };
}

export type NewsMutationResult = { kind: 'success'; code?: string } | { kind: 'failure'; code?: string };

async function mutationResult(
  request: () => Promise<{ code?: string; failed?: boolean }>,
): Promise<NewsMutationResult> {
  try {
    const result = await request();
    return result.failed ? { kind: 'failure', code: result.code } : { kind: 'success', code: result.code };
  } catch {
    return { kind: 'failure', code: 'NETWORK_REQUEST_FAILED' };
  }
}

export async function saveNewsDraft(payload: DraftInput) {
  if (!canUseNews()) {
    notifyError('AUTHORIZATION_REQUIRED');
    return { ok: false, item: undefined, code: 'AUTHORIZATION_REQUIRED' };
  }
  try {
    const result = await saveDraftData(payload);
    if (result.failed) {
      notifyError('REQUEST_FAILED');
      return { ok: false, item: undefined, code: 'REQUEST_FAILED' };
    }
    notifySuccess(result.code);
    return { ok: true, item: result.item ?? undefined, code: result.code };
  } catch {
    notifyError('NETWORK_REQUEST_FAILED');
    return { ok: false, item: undefined, code: 'NETWORK_REQUEST_FAILED' };
  }
}

export async function updateNews(id: string, payload: UpdateInput): Promise<NewsMutationResult> {
  if (!canUseNews()) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => mutationData(() => NewsApi.update(id, payload)));
}

export async function deleteNews(id: string): Promise<NewsMutationResult> {
  if (!canUse(canDeleteNews)) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => mutationData(() => NewsApi.delete(id)));
}

export async function publishNews(id: string): Promise<NewsMutationResult> {
  if (!canUseNews()) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => mutationData(() => NewsApi.publish(id)));
}

export async function archiveNews(id: string): Promise<NewsMutationResult> {
  if (!canUseNews()) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => mutationData(() => NewsApi.archive(id)));
}

export async function unarchiveNews(id: string): Promise<NewsMutationResult> {
  if (!canUseNews()) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => mutationData(() => NewsApi.unarchive(id)));
}

export async function submitNewsSuggestion(url: string): Promise<NewsMutationResult> {
  return mutationResult(() => submitSuggestionData(url));
}

export async function acceptNewsSuggestion(
  id: string,
  payload: { newsId?: string; title?: string; description?: string; content?: string },
): Promise<NewsMutationResult> {
  if (!canUseNewsSuggestions()) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(async () => {
    const { response } = await NewsApi.acceptSuggestion(id, payload);
    return { failed: !response.ok };
  });
}

export async function rejectNewsSuggestion(id: string): Promise<NewsMutationResult> {
  if (!canUseNewsSuggestions()) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(async () => {
    const { response } = await NewsApi.rejectSuggestion(id);
    return { failed: !response.ok };
  });
}

export function setNewsCommentsEnabled(id: string, enabled: boolean): Promise<NewsMutationResult> {
  if (!canUseNews()) return Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' });
  return mutationResult(async () => {
    const { response } = await NewsApi.setCommentsEnabled(id, enabled);
    return { failed: !response.ok };
  });
}
