import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult, Paginated } from '@/shared/api';
import type {
  ListMyProjectsQuery,
  ListProjectsQuery,
  Project,
  SaveProject,
  UpdateProject,
} from '@/features/project/types/project.type.ts';
const pub = publicClient,
  priv = privateClient;
export class ProjectsApi {
  static listForManagement(query?: ListProjectsQuery): Promise<ApiResult<Paginated<Project>>> {
    return priv.GET('/api/v1/projects/administration', { params: { query } });
  }
  static list(query?: ListProjectsQuery, client: ApiClient = pub): Promise<ApiResult<Paginated<Project>>> {
    return client.GET('/api/v1/projects', { params: { query } });
  }
  static mine(query?: ListMyProjectsQuery): Promise<ApiResult<Paginated<Project>>> {
    return priv.GET('/api/v1/projects/me', { params: { query } });
  }
  static get(slug: string, client: ApiClient = pub): Promise<ApiResult<Project>> {
    return client.GET('/api/v1/projects/{slug}', { params: { path: { slug } } });
  }
  static getById(id: string): Promise<ApiResult<Project>> {
    return priv.GET('/api/v1/projects/id/{id}', { params: { path: { id } } });
  }
  static create(body: SaveProject): Promise<ApiResult<Project>> {
    return priv.POST('/api/v1/projects', { body });
  }
  static update(id: string, body: UpdateProject): Promise<ApiResult<Project>> {
    return priv.PATCH('/api/v1/projects/{id}', {
      params: { path: { id } },
      body,
    });
  }
  static publish(id: string): Promise<ApiResult<Project>> {
    return priv.POST('/api/v1/projects/{id}/publish', {
      params: { path: { id } },
    });
  }
  static archive(id: string): Promise<ApiResult<Project>> {
    return priv.POST('/api/v1/projects/{id}/archive', {
      params: { path: { id } },
    });
  }
  static unarchive(id: string): Promise<ApiResult<Project>> {
    return priv.POST('/api/v1/projects/{id}/unarchive', {
      params: { path: { id } },
    });
  }
  static remove(id: string) {
    return priv.DELETE('/api/v1/projects/{id}', { params: { path: { id } } });
  }
}
