import type {
  TagAliasDTO,
  CreateTagAliasDTO,
  TagIdentityTermDTO,
  SetTagIdentityTermDTO,
} from '@/shared/taxonomy/types/taxonomy.type.ts';
import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult } from '@/shared/api';
import type {
  CreateTagDTO,
  ListTagsQuery,
  ListTagsPageQuery,
  PaginatedTagsDTO,
  MergeTagsDTO,
  TagDTO,
  UpdateTagDTO,
} from '@/shared/taxonomy/types/taxonomy.type.ts';

const privateApi = privateClient;

export class TaxonomyApi {
  static async listTags(
    query?: ListTagsQuery,
    client: ApiClient = publicClient,
    options?: { signal?: AbortSignal },
  ): Promise<ApiResult<TagDTO[]>> {
    return client.GET('/api/v1/taxonomy/tags', { params: { query }, signal: options?.signal });
  }

  static async listTagsPage(query?: ListTagsPageQuery): Promise<ApiResult<PaginatedTagsDTO>> {
    return privateApi.GET('/api/v1/taxonomy/tags/page', { params: { query } });
  }

  static async createTag(payload: CreateTagDTO): Promise<ApiResult<unknown>> {
    return privateApi.POST('/api/v1/taxonomy/tags', { body: payload });
  }

  static async updateTag(id: string, payload: UpdateTagDTO): Promise<ApiResult<unknown>> {
    return privateApi.PATCH('/api/v1/taxonomy/tags/{id}', {
      params: { path: { id } },
      body: payload,
    });
  }

  static async deleteTag(id: string): Promise<ApiResult<unknown>> {
    return privateApi.DELETE('/api/v1/taxonomy/tags/{id}', {
      params: { path: { id } },
    });
  }
  static async archiveTag(id: string): Promise<ApiResult<unknown>> {
    return privateApi.POST('/api/v1/taxonomy/tags/{id}/archive', {
      params: { path: { id } },
    });
  }
  static async unarchiveTag(id: string): Promise<ApiResult<unknown>> {
    return privateApi.POST('/api/v1/taxonomy/tags/{id}/unarchive', {
      params: { path: { id } },
    });
  }

  static async resolveTag(value: string): Promise<ApiResult<TagDTO | null>> {
    return publicClient.GET('/api/v1/taxonomy/tags/resolve', {
      params: { query: { value } },
    });
  }

  static async listAliases(tagId?: string): Promise<ApiResult<TagAliasDTO[]>> {
    return privateApi.GET('/api/v1/taxonomy/tags/aliases', {
      params: { query: { tagId } },
    });
  }

  static async createAlias(payload: CreateTagAliasDTO): Promise<ApiResult<TagAliasDTO>> {
    return privateApi.POST('/api/v1/taxonomy/tags/aliases', { body: payload });
  }

  static async deleteAlias(id: string): Promise<ApiResult<unknown>> {
    return privateApi.DELETE('/api/v1/taxonomy/tags/aliases/{id}', {
      params: { path: { id } },
    });
  }

  static async listIdentityTerms(kind?: 'reserved' | 'blocked'): Promise<ApiResult<TagIdentityTermDTO[]>> {
    return privateApi.GET('/api/v1/taxonomy/tags/identity-terms', {
      params: { query: { kind } },
    });
  }

  static async setIdentityTerm(payload: SetTagIdentityTermDTO): Promise<ApiResult<TagIdentityTermDTO>> {
    return privateApi.PUT('/api/v1/taxonomy/tags/identity-terms', {
      body: payload,
    });
  }

  static async deleteIdentityTerm(id: string): Promise<ApiResult<unknown>> {
    return privateApi.DELETE('/api/v1/taxonomy/tags/identity-terms/{id}', {
      params: { path: { id } },
    });
  }

  static async mergeTags(payload: MergeTagsDTO): Promise<ApiResult<unknown>> {
    return privateApi.POST('/api/v1/taxonomy/tags/merges', { body: payload });
  }
}
