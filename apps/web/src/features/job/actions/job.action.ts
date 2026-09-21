import { JobsApi } from '@/features/job/api/job.api.ts';
import { persistLocalEntities, readLocalEntities } from '@/shared/storage/local-database';
import type { Job } from '@/features/job/types/job.type.ts';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import { canReviewJobSuggestions, canViewJobManagement } from '@/features/job/access/job.access.ts';

const canUseJobManagement = () => isClientAccessAllowed(canViewJobManagement);
const canUseJobSuggestions = () => isClientAccessAllowed(canReviewJobSuggestions);

export type JobMutationResult = { kind: 'success'; code?: string } | { kind: 'failure'; code?: string };

async function mutationResult(
  request: () => Promise<{ data?: unknown; error?: { code?: string } }>,
): Promise<JobMutationResult> {
  try {
    const { data, error } = await request();
    if (error) return { kind: 'failure', code: error.code };
    const code =
      typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string'
        ? data.code
        : undefined;
    return { kind: 'success', code };
  } catch {
    return { kind: 'failure', code: 'NETWORK_REQUEST_FAILED' };
  }
}

export async function listMyJobs(query?: Parameters<typeof JobsApi.mine>[0]) {
  try {
    const result = await JobsApi.mine(query);
    if (!result.error) {
      void persistLocalEntities('jobs', result.data?.data?.items ?? []);
      return result;
    }
    const cached = await readLocalEntities<Job>('jobs');
    if (!cached.length) return result;
    return {
      data: { data: { items: cached, page: 1, pageSize: cached.length, total: cached.length } },
      error: result.error,
    };
  } catch {
    const cached = await readLocalEntities<Job>('jobs');
    return {
      data: { data: { items: cached, page: 1, pageSize: cached.length, total: cached.length } },
      error: { code: 'NETWORK_REQUEST_FAILED' },
    };
  }
}

export const deleteJob = (id: string) => mutationResult(() => JobsApi.delete(id));
export const createJob = (payload: Parameters<typeof JobsApi.create>[0]) => JobsApi.create(payload);
export const submitJob = (payload: Parameters<typeof JobsApi.submit>[0]) => JobsApi.submit(payload);
export const updateJob = (id: string, payload: Parameters<typeof JobsApi.update>[1]) => JobsApi.update(id, payload);
export const closeJob = (id: string) => JobsApi.close(id);
export const renewJob = (id: string) => JobsApi.renew(id);
export const withdrawJob = (id: string) => JobsApi.withdraw(id);

export async function listJobsByOrganization(
  organizationId: string,
  limit = 6,
  options?: { signal?: AbortSignal },
): Promise<Job[]> {
  const { data } = await JobsApi.list(
    { publisherOrganizationId: organizationId, page: 1, pageSize: Math.min(100, Math.max(1, limit)) },
    options,
  );
  return data?.data?.items ?? [];
}

export const listJobsQuery = (
  query?: Parameters<typeof JobsApi.list>[0],
  options?: Parameters<typeof JobsApi.list>[1],
) => JobsApi.list(query, options);

export async function listJobsForManagement(query?: Parameters<typeof JobsApi.listForManagement>[0]) {
  if (!canUseJobManagement()) return { data: { data: { items: [], page: 1, pageSize: 0, total: 0 } } };
  return JobsApi.listForManagement(query);
}

export type JobSuggestionSummary = { id: string; label: string; status: string; createdAt: string; url?: string };
function normalizeJobSuggestions(input: unknown): JobSuggestionSummary[] {
  const payload = input && typeof input === 'object' && 'data' in input ? (input as { data?: unknown }).data : input;
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : [];
  return source.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const value = entry as Record<string, unknown>;
    const id = typeof value['id'] === 'string' ? value['id'] : null;
    if (!id) return [];
    const title = typeof value['title'] === 'string' ? value['title'] : '';
    const url =
      typeof value['applicationUrl'] === 'string'
        ? value['applicationUrl']
        : typeof value['url'] === 'string'
          ? value['url']
          : undefined;
    return [
      {
        id,
        label: title || url || id,
        status: typeof value['status'] === 'string' ? value['status'] : 'pending',
        createdAt: typeof value['createdAt'] === 'string' ? value['createdAt'] : '',
        url,
      },
    ];
  });
}
export async function listMyJobSuggestions() {
  const { data, error } = await JobsApi.listMySuggestions();
  return { items: normalizeJobSuggestions((data as { data?: unknown } | undefined)?.data), error };
}
export async function listPendingJobSuggestions() {
  if (!canUseJobSuggestions()) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const { data, error } = await JobsApi.listPendingSuggestions();
  return { items: normalizeJobSuggestions((data as { data?: unknown } | undefined)?.data), error };
}
export const acceptJobSuggestion = (id: string) =>
  canUseJobSuggestions()
    ? mutationResult(() => JobsApi.acceptSuggestion(id))
    : Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' } as JobMutationResult);
export const rejectJobSuggestion = (id: string) =>
  canUseJobSuggestions()
    ? mutationResult(() => JobsApi.rejectSuggestion(id))
    : Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' } as JobMutationResult);
export function getJobQuery(id: string, client?: import('@/shared/api').ApiClient) {
  return JobsApi.get(id, client);
}
