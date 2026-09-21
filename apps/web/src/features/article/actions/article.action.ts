import { ArticleApi } from '@/features/article/api/article.api.ts';
import { ArticleCache } from '@/features/article/cache/article.cache';
import { toArticleDetails, toArticleItem } from '@/features/article/types/article.mapper.type.ts';
import type { ApiClient } from '@/shared/api';
import type { ArticleItem } from '@/features/article/types/article.type.ts';
import { routes } from '@/shared/navigation/routes';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canModerateArticles, canSaveArticleDraft } from '@/features/article/access/article.access.ts';
import { uploadImage } from '@/shared/media/media.service';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';

async function listArticlesData(
  query: Parameters<typeof ArticleApi.list>[0] = {},
  client?: ApiClient,
  options?: { signal?: AbortSignal },
) {
  const { data, error } = await ArticleApi.list(query, client, options);
  if (error) return { items: [], total: 0, page: 1, pageSize: 20, error };
  const items = data?.data?.items ?? data?.data ?? [];
  const mapped = (Array.isArray(items) ? items : []).map(toArticleItem);
  return {
    items: mapped,
    total: data?.data?.total ?? mapped.length,
    page: data?.data?.page ?? 1,
    pageSize: data?.data?.pageSize ?? mapped.length,
    error: undefined,
  };
}

async function listMyArticlesData(query: Parameters<typeof ArticleApi.listMine>[0] = {}, accountId?: string) {
  try {
    const { data, error } = await ArticleApi.listMine(query);
    if (!error) {
      const items = data?.data?.items ?? data?.data ?? [];
      const mapped = (Array.isArray(items) ? items : []).map(toArticleItem);
      if (accountId) void ArticleCache.saveMany(accountId, mapped);
      return { items: mapped, error: undefined };
    }

    const cached = accountId ? await ArticleCache.list(accountId) : [];
    return { items: cached, error };
  } catch {
    const cached = accountId ? await ArticleCache.list(accountId) : [];
    return { items: cached, error: { code: 'NETWORK_REQUEST_FAILED' } };
  }
}

async function listArticlesForModerationData(query: Parameters<typeof ArticleApi.listForModeration>[0] = {}) {
  if (!isClientAccessAllowed(canModerateArticles)) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const { data, error } = await ArticleApi.listForModeration(query);
  if (error) return { items: [], error };
  const items = data?.data?.items ?? data?.data ?? [];
  return { items: (Array.isArray(items) ? items : []).map(toArticleItem), error: undefined };
}

async function getArticleBySlugData(slug: string, client?: ApiClient) {
  const [{ data, error }, contentResult] = await Promise.all([
    ArticleApi.getBySlug(slug, client),
    ArticleApi.getContentBySlug(slug, client),
  ]);
  const content = contentResult.data?.data;
  const item = data?.data && content ? toArticleDetails(data.data, content) : null;
  return { item, error: error ?? contentResult.error };
}

async function getArticleByIdData(id: string, client?: ApiClient) {
  const [{ data, error }, contentResult] = await Promise.all([
    ArticleApi.getById(id, client),
    ArticleApi.getContentById(id, client),
  ]);
  const content = contentResult.data?.data;
  const item = data?.data && content ? toArticleDetails(data.data, content) : null;
  return { item, error: error ?? contentResult.error };
}

export type ArticleMutationResult = { kind: 'success'; code?: string } | { kind: 'failure'; code?: string };

export type UpdateArticleResult =
  | { kind: 'success'; code?: string }
  | { kind: 'failure'; code?: string; conflict?: { content: string; version: number } };

export type SaveArticleDraftCommand = Parameters<typeof ArticleApi.saveDraft>[0] & {
  coverFile?: File;
};

async function mutationResult(
  request: () => Promise<{ data?: { code?: string }; error?: { code?: string } }>,
): Promise<ArticleMutationResult> {
  try {
    const { data, error } = await request();
    if (error) return { kind: 'failure', code: error.code };
    return { kind: 'success', code: data?.code };
  } catch {
    return { kind: 'failure', code: 'NETWORK_REQUEST_FAILED' };
  }
}

export async function loadMyArticles(query?: Parameters<typeof listMyArticlesData>[0], accountId?: string) {
  const { items } = await listMyArticlesData(query ?? {}, accountId);
  return items;
}

export async function loadArticleById(id: string, client?: ApiClient) {
  return (await getArticleByIdData(id, client)).item;
}

export async function saveArticleDraft(payload: SaveArticleDraftCommand): Promise<ArticleItem | null> {
  if (!isClientAccessAllowed(canSaveArticleDraft)) {
    notifyError('AUTHORIZATION_REQUIRED');
    return null;
  }

  try {
    let coverMediaId: string | undefined;

    if (payload.coverFile) {
      const uploaded = await uploadImage(payload.coverFile, 'content');
      if (uploaded.error || !uploaded.data?.data?.mediaId) {
        notifyError(uploaded.error?.code);
        return null;
      }
      coverMediaId = uploaded.data.data.mediaId;
    }

    const { data, error } = await ArticleApi.saveDraft({
      title: payload.title,
      description: payload.description,
      content: payload.content,
      tagSlugs: payload.tagSlugs,
      ...(coverMediaId ? { coverMediaId } : {}),
    });

    if (error || !data?.data) {
      notifyError(error?.code ?? 'NETWORK_REQUEST_FAILED');
      return null;
    }

    notifySuccess(data.code ?? 'ARTICLE_DRAFT_SAVED');
    return toArticleItem(data.data);
  } catch {
    notifyError('NETWORK_REQUEST_FAILED');
    return null;
  }
}

export async function updateArticle(
  id: string,
  payload: Parameters<typeof ArticleApi.update>[1],
): Promise<UpdateArticleResult> {
  try {
    const { data, error } = await ArticleApi.update(id, payload);
    if (!error) return { kind: 'success', code: data?.code };

    if (error.code !== 'ARTICLE_CONTENT_CONFLICT') {
      return { kind: 'failure', code: error.code };
    }

    const latest = await getArticleByIdData(id);
    return {
      kind: 'failure',
      code: error.code,
      ...(latest.item ? { conflict: { content: latest.item.content, version: latest.item.contentVersion ?? 1 } } : {}),
    };
  } catch {
    return { kind: 'failure', code: 'NETWORK_REQUEST_FAILED' };
  }
}

export function deleteArticle(id: string): Promise<ArticleMutationResult> {
  return mutationResult(() => ArticleApi.delete(id));
}

export function publishArticle(id: string, publishedAt?: string): Promise<ArticleMutationResult> {
  return mutationResult(() => ArticleApi.publish(id, publishedAt));
}

export function archiveArticle(id: string): Promise<ArticleMutationResult> {
  return mutationResult(() => ArticleApi.archive(id));
}

export function unarchiveArticle(id: string): Promise<ArticleMutationResult> {
  return mutationResult(() => ArticleApi.unarchive(id));
}

export type ListArticlesQuery = Parameters<typeof listArticlesData>[0];
export type ListMyArticlesQuery = Parameters<typeof listMyArticlesData>[0];

export interface EditorialArticlesQuery {
  featured?: ArticleItem;
  mostViewed: ArticleItem[];
}

export async function listArticlesQuery(
  query: ListArticlesQuery = {},
  client?: import('@/shared/api/openapi.api.ts').ApiClient,
  options?: { signal?: AbortSignal },
) {
  return listArticlesData(query, client, options);
}

export async function editorialArticlesQuery(
  client?: import('@/shared/api/openapi.api.ts').ApiClient,
  period: 'week' | 'all' = 'week',
): Promise<EditorialArticlesQuery> {
  const [votes, views] = await Promise.allSettled([
    listArticlesQuery({ period, sort: 'votes', page: 1, pageSize: 1 }, client),
    listArticlesQuery({ period, sort: 'views', page: 1, pageSize: 4 }, client),
  ]);

  const voteItems = votes.status === 'fulfilled' ? votes.value.items : [];
  const viewItems = views.status === 'fulfilled' ? views.value.items : [];
  return {
    featured: voteItems[0],
    mostViewed: viewItems,
  };
}

export const getArticleBySlugQuery = (slug: string, client?: ApiClient) => getArticleBySlugData(slug, client);
export async function resolveArticleHrefById(id: string): Promise<string | null> {
  const { data, error } = await ArticleApi.getById(id);
  if (error || !data?.data) return null;
  return routes.article(data.data.slug);
}
export const listArticlesForModeration = (query?: Parameters<typeof listArticlesForModerationData>[0]) =>
  listArticlesForModerationData(query);

export function setArticleCommentsEnabled(id: string, enabled: boolean): Promise<ArticleMutationResult> {
  return mutationResult(() => ArticleApi.setCommentsEnabled(id, enabled));
}

export async function listPopularArticleTagsQuery(client?: ApiClient) {
  const { data, error } = await ArticleApi.listPopularTags(client);
  return { items: data?.data ?? [], error };
}
