import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult, Paginated } from '@/shared/api';
import type { Job, ListJobsQuery, SaveJob, UpdateJob, SubmitCommunityJob } from '@/features/job/types/job.type.ts';
const pub = publicClient,
  priv = privateClient;
export class JobsApi {
  static list(
    query?: ListJobsQuery,
    options?: { signal?: AbortSignal; client?: ApiClient },
  ): Promise<ApiResult<Paginated<Job>>> {
    return (options?.client ?? pub).GET('/api/v1/jobs', { params: { query }, signal: options?.signal });
  }
  static mine(query?: ListJobsQuery): Promise<ApiResult<Paginated<Job>>> {
    return priv.GET('/api/v1/jobs/me', { params: { query } });
  }
  static listForManagement(query?: ListJobsQuery): Promise<ApiResult<Paginated<Job>>> {
    return priv.GET('/api/v1/jobs/administration', { params: { query } });
  }
  static get(id: string, client: ApiClient = pub): Promise<ApiResult<Job>> {
    return client.GET('/api/v1/jobs/{id}', { params: { path: { id } } });
  }
  static create(body: SaveJob): Promise<ApiResult<Job>> {
    return priv.POST('/api/v1/jobs', { body });
  }
  static submit(body: SubmitCommunityJob) {
    return priv.POST('/api/v1/jobs/suggestions', { body });
  }
  static delete(id: string) {
    return priv.DELETE('/api/v1/jobs/{id}', { params: { path: { id } } });
  }
  static listMySuggestions() {
    return priv.GET('/api/v1/jobs/suggestions/me');
  }
  static listPendingSuggestions() {
    return priv.GET('/api/v1/jobs/suggestions/pending');
  }
  static acceptSuggestion(id: string) {
    return priv.POST('/api/v1/jobs/suggestions/{id}/accept', { params: { path: { id } } }) as Promise<
      ApiResult<unknown>
    >;
  }
  static rejectSuggestion(id: string) {
    return priv.POST('/api/v1/jobs/suggestions/{id}/reject', { params: { path: { id } } }) as Promise<
      ApiResult<unknown>
    >;
  }
  static update(id: string, body: UpdateJob): Promise<ApiResult<Job>> {
    return priv.PATCH('/api/v1/jobs/{id}', { params: { path: { id } }, body });
  }
  static close(id: string): Promise<ApiResult<Job>> {
    return priv.POST('/api/v1/jobs/{id}/close', { params: { path: { id } } });
  }
  static withdraw(id: string) {
    return priv.POST('/api/v1/jobs/{id}/withdraw', { params: { path: { id } } });
  }
  static renew(id: string): Promise<ApiResult<Job>> {
    return priv.POST('/api/v1/jobs/{id}/renew', { params: { path: { id } } });
  }
}
