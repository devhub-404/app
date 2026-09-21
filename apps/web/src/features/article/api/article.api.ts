import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult } from '@/shared/api';
import type {
  ArticleContentDTO,
  ArticleDTO,
  ArticleListDataDTO,
  ArticlePopularTagDTO,
  SaveArticleDraftInputDTO,
  SaveArticleDraftOutputDTO,
  UpdateArticleDTO,
} from '@/features/article/types/article.type.ts';

type RequestOptions = { signal?: AbortSignal };

export class ArticleApi {
  static async listPopularTags(client: ApiClient = publicClient): Promise<ApiResult<ArticlePopularTagDTO[]>> {
    return client.GET('/api/v1/articles/tags/popular');
  }

  static async list(
    query: {
      query?: string;
      tags?: string[];
      page?: number;
      pageSize?: number;
      sort?: 'votes' | 'views' | 'comments';
      period?: 'day' | 'week' | 'month' | 'year' | 'all';
    } = {},
    client: ApiClient = publicClient,
    options?: RequestOptions,
  ): Promise<ApiResult<ArticleListDataDTO>> {
    const result = await client.GET('/api/v1/articles', {
      params: {
        query: {
          search: query.query,
          tags: query.tags?.length ? query.tags.join(',') : undefined,
          page: query.page,
          pageSize: query.pageSize,
          sort: query.sort,
          period: query.period,
        },
      },
      signal: options?.signal,
    });
    return result;
  }

  static async listMine(
    query: {
      query?: string;
      tags?: string[];
      page?: number;
      pageSize?: number;
      sort?: 'votes' | 'views' | 'comments';
      period?: 'day' | 'week' | 'month' | 'year' | 'all';
    } = {},
  ): Promise<ApiResult<ArticleListDataDTO>> {
    const result = await privateClient.GET('/api/v1/articles/me', {
      params: {
        query: {
          search: query.query,
          tags: query.tags?.length ? query.tags.join(',') : undefined,
          page: query.page,
          pageSize: query.pageSize,
          sort: query.sort,
          period: query.period,
        },
      },
    });
    return result;
  }

  static async listForModeration(
    query: {
      query?: string;
      tags?: string[];
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<ApiResult<ArticleListDataDTO>> {
    return privateClient.GET('/api/v1/articles/administration', {
      params: {
        query: {
          search: query.query,
          tags: query.tags?.length ? query.tags.join(',') : undefined,
          page: query.page,
          pageSize: query.pageSize,
        },
      },
    });
  }

  static async getById(id: string, client: ApiClient = privateClient): Promise<ApiResult<ArticleDTO>> {
    const result = await client.GET('/api/v1/articles/id/{id}', {
      params: { path: { id } },
    });
    return result;
  }

  static async getBySlug(slug: string, client: ApiClient = publicClient): Promise<ApiResult<ArticleDTO>> {
    const result = await client.GET('/api/v1/articles/{slug}', {
      params: { path: { slug } },
    });
    return result;
  }

  static async getContentById(id: string, client: ApiClient = privateClient): Promise<ApiResult<ArticleContentDTO>> {
    return client.GET('/api/v1/articles/id/{id}/content', {
      params: { path: { id } },
    });
  }

  static async getContentBySlug(slug: string, client: ApiClient = publicClient): Promise<ApiResult<ArticleContentDTO>> {
    return client.GET('/api/v1/articles/{slug}/content', {
      params: { path: { slug } },
    });
  }

  static async saveDraft(payload: SaveArticleDraftInputDTO): Promise<ApiResult<SaveArticleDraftOutputDTO>> {
    const result = await privateClient.POST('/api/v1/articles/drafts', {
      body: payload,
    });
    return result;
  }

  static async update(id: string, payload: UpdateArticleDTO): Promise<ApiResult<unknown>> {
    const result = await privateClient.PATCH('/api/v1/articles/{id}', {
      params: { path: { id } },
      body: payload,
    });
    return result;
  }

  static async delete(id: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.DELETE('/api/v1/articles/{id}', {
      params: { path: { id } },
    });
    return result;
  }

  static async publish(id: string, publishedAt?: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.POST('/api/v1/articles/{id}/publish', {
      params: { path: { id } },
      body: publishedAt ? { publishedAt } : {},
    });
    return result;
  }

  static async setCommentsEnabled(id: string, enabled: boolean): Promise<ApiResult<unknown>> {
    return privateClient.PATCH('/api/v1/articles/{id}/comments/settings', {
      params: { path: { id } },
      body: { enabled },
    });
  }

  static async archive(id: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.POST('/api/v1/articles/{id}/archive', {
      params: { path: { id } },
    });
    return result;
  }

  static async unarchive(id: string): Promise<ApiResult<unknown>> {
    const result = await privateClient.POST('/api/v1/articles/{id}/unarchive', {
      params: { path: { id } },
    });
    return result;
  }
}
