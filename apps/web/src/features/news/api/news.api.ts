import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult } from '@/shared/api';
import type {
  NewsDTO,
  NewsItemDTO,
  NewsSourceDTO,
  NewsSuggestionDTO,
  SaveNewsDraftInputDTO,
  SaveNewsDraftOutputDTO,
  UpdateNewsDTO,
} from '@/features/news/types/news.dto.type.ts';

export class NewsApi {
  static async list(
    query: {
      query?: string;
      tags?: string[];
      page?: number;
      pageSize?: number;
      source?: string;
      sort?: 'recent' | 'oldest' | 'views';
      period?: 'day' | 'week' | 'month' | 'year' | 'all';
    } = {},
    client: ApiClient = publicClient,
  ): Promise<
    ApiResult<{
      items: NewsItemDTO[];
      page: number;
      pageSize: number;
      total: number;
    }>
  > {
    const result = await client.GET('/api/v1/news', {
      params: {
        query: {
          search: query.query,
          tags: query.tags?.length ? query.tags.join(',') : undefined,
          source: query.source,
          sort: query.sort,
          page: query.page,
          pageSize: query.pageSize,
          period: query.period,
        },
      },
    });
    return result;
  }

  static async listPopularSources(): Promise<ApiResult<NewsSourceDTO[]>> {
    const result = await publicClient.GET('/api/v1/news/sources/popular');
    return result;
  }

  static async submitSuggestion(url: string): Promise<ApiResult<NewsSuggestionDTO>> {
    return privateClient.POST('/api/v1/news/suggestions', { body: { url } });
  }

  static async listPendingSuggestions(): Promise<ApiResult<NewsSuggestionDTO[]>> {
    return privateClient.GET('/api/v1/news/suggestions/pending');
  }
  static async listMySuggestions(): Promise<ApiResult<NewsSuggestionDTO[]>> {
    return privateClient.GET('/api/v1/news/suggestions/me');
  }
  static async acceptSuggestion(id: string, body: { newsId?: string; title?: string; content?: string }) {
    return privateClient.POST('/api/v1/news/suggestions/{id}/accept', {
      params: { path: { id } },
      body,
    });
  }
  static async rejectSuggestion(id: string) {
    return privateClient.POST('/api/v1/news/suggestions/{id}/reject', {
      params: { path: { id } },
    });
  }

  static async listForManagement(
    query: {
      query?: string;
      tags?: string[];
      page?: number;
      pageSize?: number;

      period?: 'day' | 'week' | 'month' | 'year' | 'all';
    } = {},
  ): Promise<
    ApiResult<{
      items: NewsItemDTO[];
      page: number;
      pageSize: number;
      total: number;
    }>
  > {
    const result = await privateClient.GET('/api/v1/news/administration', {
      params: {
        query: {
          search: query.query,
          tags: query.tags?.length ? query.tags.join(',') : undefined,
          page: query.page,
          pageSize: query.pageSize,

          period: query.period,
        },
      },
    });
    return result;
  }

  static async getById(id: string, client: ApiClient = privateClient): Promise<ApiResult<NewsDTO>> {
    const result = await client.GET('/api/v1/news/id/{id}', {
      params: { path: { id } },
    });
    return result;
  }

  static async getBySlug(slug: string, client: ApiClient = publicClient): Promise<ApiResult<NewsDTO>> {
    const result = await client.GET('/api/v1/news/{slug}', {
      params: { path: { slug } },
    });
    return result;
  }

  static async saveDraft(payload: SaveNewsDraftInputDTO): Promise<ApiResult<SaveNewsDraftOutputDTO>> {
    const result = await privateClient.POST('/api/v1/news/drafts', {
      body: payload,
    });
    return result;
  }

  static async update(id: string, payload: UpdateNewsDTO) {
    const result = await privateClient.PATCH('/api/v1/news/{id}', {
      params: { path: { id } },
      body: payload,
    });
    return result;
  }

  static async delete(id: string) {
    const result = await privateClient.DELETE('/api/v1/news/{id}', {
      params: { path: { id } },
    });
    return result;
  }

  static async publish(id: string) {
    const result = await privateClient.POST('/api/v1/news/{id}/publish', {
      params: { path: { id } },
    });
    return result;
  }

  static async setCommentsEnabled(id: string, enabled: boolean) {
    return privateClient.PATCH('/api/v1/news/{id}/comments/settings', { params: { path: { id } }, body: { enabled } });
  }

  static async archive(id: string) {
    const result = await privateClient.POST('/api/v1/news/{id}/archive', {
      params: { path: { id } },
    });
    return result;
  }

  static async unarchive(id: string) {
    const result = await privateClient.POST('/api/v1/news/{id}/unarchive', {
      params: { path: { id } },
    });
    return result;
  }
}
