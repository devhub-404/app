import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult } from '@/shared/api';
import type {
  ApproveResourceSuggestionDTO,
  CreateResourceDTO,
  ResourceItemDTO,
  ResourceListDataDTO,
  ResourceSuggestionDTO,
  PendingResourceSuggestionsDataDTO,
  MyResourceSuggestionsDataDTO,
  RejectResourceDTO,
  SuggestResourceDTO,
  UpdateResourceDTO,
} from '@/features/resource/types/resource.type.ts';

export class ResourcesApi {
  static async list(
    query: {
      query?: string;
      tags?: string[];
      page?: number;
      pageSize?: number;
      sort?: 'votes';
    } = {},
    client: ApiClient = publicClient,
  ): Promise<ApiResult<ResourceListDataDTO>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 9;
    const result = await client.GET('/api/v1/resources', {
      params: {
        query: {
          search: query.query,
          tags: query.tags?.length ? query.tags.join(',') : undefined,
          page,
          pageSize,
          sort: query.sort,
        },
      },
    });
    return result;
  }

  static async getById(id: string, client: ApiClient = publicClient): Promise<ApiResult<ResourceItemDTO>> {
    const result = await client.GET('/api/v1/resources/{id}', {
      params: { path: { id } },
    });
    return result;
  }

  static async getForManagement(id: string): Promise<ApiResult<ResourceItemDTO>> {
    const result = await privateClient.GET('/api/v1/resources/id/{id}', {
      params: { path: { id } },
    });
    return result;
  }

  static async listForManagement(query: Parameters<typeof ResourcesApi.list>[0] = {}) {
    const result = await privateClient.GET('/api/v1/resources/administration', {
      params: {
        query: {
          search: query.query,
          tags: query.tags?.join(','),
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
          sort: query.sort,
        },
      },
    });
    return result;
  }

  static async create(payload: CreateResourceDTO) {
    const result = await privateClient.POST('/api/v1/resources', {
      body: payload,
    });
    return result;
  }

  static async update(id: string, payload: UpdateResourceDTO) {
    const result = await privateClient.PATCH('/api/v1/resources/{id}', {
      params: { path: { id } },
      body: payload,
    });
    return result;
  }

  static async delete(id: string) {
    const result = await privateClient.DELETE('/api/v1/resources/{id}', {
      params: { path: { id } },
    });
    return result;
  }

  static async listPending(
    query: {
      page?: number;
      pageSize?: number;
      search?: string;
      tags?: string;
      sort?: 'votes';
    } = {},
  ): Promise<ApiResult<PendingResourceSuggestionsDataDTO>> {
    const result = await privateClient.GET('/api/v1/resources/suggestions/pending', {
      params: {
        query: {
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
          ...query,
        },
      },
    });
    return result;
  }

  static async listMine(
    query: { page?: number; pageSize?: number } = {},
  ): Promise<ApiResult<MyResourceSuggestionsDataDTO>> {
    return privateClient.GET('/api/v1/resources/suggestions/me', {
      params: {
        query: { page: query.page ?? 1, pageSize: query.pageSize ?? 20 },
      },
    });
  }

  static async submit(payload: SuggestResourceDTO): Promise<ApiResult<ResourceSuggestionDTO>> {
    const result = await privateClient.POST('/api/v1/resources/suggestions', {
      body: payload,
    });
    return result;
  }

  static async approve(id: string, payload: ApproveResourceSuggestionDTO) {
    const result = await privateClient.POST('/api/v1/resources/suggestions/{id}/accept', {
      params: { path: { id } },
      body: payload,
    });
    return result;
  }

  static async reject(id: string, payload: RejectResourceDTO = {}) {
    const result = await privateClient.POST('/api/v1/resources/suggestions/{id}/reject', {
      params: { path: { id } },
      body: payload,
    });
    return result;
  }

  static async archive(id: string) {
    const result = await privateClient.POST('/api/v1/resources/{id}/archive', {
      params: { path: { id } },
    });
    return result;
  }

  static async unarchive(id: string) {
    const result = await privateClient.POST('/api/v1/resources/{id}/unarchive', { params: { path: { id } } });
    return result;
  }
}
