import { ResourcesApi } from '@/features/resource/api/resource.api.ts';
import { loadResourceMetadataFromUrl } from '@/features/resource/api/resource-metadata.api.ts';
import type { ResourceMetadata } from '@/features/resource/api/resource-metadata.api.ts';
import type { ApiClient } from '@/shared/api';
import { toResourceItem } from '@/features/resource/types/resource.mapper.type.ts';
import type {
  ResourceItemDTO,
  ResourceSuggestionDTO,
  SuggestResourceDTO,
} from '@/features/resource/types/resource.type.ts';
import { readApiData } from '@/shared/api';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import {
  canDeleteResource,
  canManageResources,
  canReviewResourceSuggestions,
  canViewResourceManagement,
} from '@/features/resource/access/resource.access.ts';
import type { Actor } from '@/features/auth/public/access';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';

type ResourceQuery = Parameters<typeof ResourcesApi.list>[0];
type ManagementQuery = Parameters<typeof ResourcesApi.listForManagement>[0];

const canUse = (predicate: (actor: Actor) => boolean) => isClientAccessAllowed(predicate);
const canUseResourceManagement = () => canUse(canViewResourceManagement);
const canUseResourceSuggestions = () => canUse(canReviewResourceSuggestions);

function mapList(data: unknown) {
  const items = data as { items?: ResourceItemDTO[] } | ResourceItemDTO[] | undefined;
  return (Array.isArray(items) ? items : (items?.items ?? [])).map(toResourceItem);
}
export type ResourceMutationResult = { kind: 'success'; code?: string } | { kind: 'failure'; code?: string };

function responseCode(data: unknown): string | undefined {
  return typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string'
    ? data.code
    : undefined;
}

async function mutationResult(
  request: () => Promise<{ data?: unknown; error?: { code?: string } }>,
): Promise<ResourceMutationResult> {
  try {
    const { data, error } = await request();
    if (error) return { kind: 'failure', code: error.code };
    return { kind: 'success', code: responseCode(data) };
  } catch {
    return { kind: 'failure', code: 'NETWORK_REQUEST_FAILED' };
  }
}

export type ListResourcesQuery = ResourceQuery;

export async function listResources(query: ResourceQuery = {}, client?: ApiClient) {
  const { data, error } = await ResourcesApi.list(query, client);
  const page = data?.data as { items?: ResourceItemDTO[]; total?: number; page?: number } | undefined;
  return { items: error ? [] : mapList(data?.data), total: page?.total ?? 0, page: page?.page ?? 1, error };
}
export async function listMyResourceSuggestions(query: Parameters<typeof ResourcesApi.listMine>[0] = {}) {
  const { data, error } = await ResourcesApi.listMine(query);
  const items = data?.data?.items ?? data?.data ?? [];
  return { items: Array.isArray(items) ? (items as ResourceSuggestionDTO[]) : [], error };
}

export async function listResourcesForManagement(query?: ManagementQuery) {
  if (!canUseResourceManagement()) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const { data, error } = await ResourcesApi.listForManagement(query ?? {});
  const items = error ? [] : mapList(readApiData<{ items?: ResourceItemDTO[] }>({ data, error }) ?? {});
  return { items, error };
}

async function getResource(request: typeof ResourcesApi.getById | typeof ResourcesApi.getForManagement, id: string) {
  const response = await request(id);
  if (response.error) return { item: null, error: response.error };
  const item = readApiData<ResourceItemDTO>(response);
  return { item: item ? toResourceItem(item) : null, error: undefined };
}
export async function loadResourceById(id: string) {
  const result = await getResource(ResourcesApi.getById, id);
  return result.item;
}
export async function loadResourceForManagement(id: string) {
  if (!canUseResourceManagement()) return null;
  const result = await getResource(ResourcesApi.getForManagement, id);
  return result.item;
}

export async function createResource(
  payload: Parameters<typeof ResourcesApi.create>[0],
): Promise<ResourceMutationResult> {
  if (!canUse(canManageResources)) {
    notifyError('AUTHORIZATION_REQUIRED');
    return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  }
  const result = await mutationResult(() => ResourcesApi.create(payload));
  if (result.kind === 'failure') notifyError(result.code);
  else notifySuccess(result.code);
  return result;
}

export async function updateResource(
  id: string,
  payload: Parameters<typeof ResourcesApi.update>[1],
): Promise<ResourceMutationResult> {
  if (!canUse(canManageResources)) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => ResourcesApi.update(id, payload));
}

export async function deleteResource(id: string): Promise<ResourceMutationResult> {
  if (!canUse(canDeleteResource)) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => ResourcesApi.delete(id));
}

export async function listPendingResourceSuggestions(query?: Parameters<typeof ResourcesApi.listPending>[0]) {
  if (!canUseResourceSuggestions()) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const { data, error } = await ResourcesApi.listPending(query);
  const items = data?.data?.items ?? data?.data ?? [];
  return { items: Array.isArray(items) ? (items as ResourceSuggestionDTO[]) : [], error };
}

export async function suggestResource(payload: SuggestResourceDTO): Promise<ResourceMutationResult> {
  return mutationResult(() => ResourcesApi.submit(payload));
}

export async function approveResourceSuggestion(
  id: string,
  payload: Parameters<typeof ResourcesApi.approve>[1],
): Promise<ResourceMutationResult> {
  if (!canUseResourceSuggestions()) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => ResourcesApi.approve(id, payload));
}

export async function rejectResourceSuggestion(
  id: string,
  payload: Parameters<typeof ResourcesApi.reject>[1] = {},
): Promise<ResourceMutationResult> {
  if (!canUseResourceSuggestions()) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => ResourcesApi.reject(id, payload));
}

export async function archiveResource(id: string): Promise<ResourceMutationResult> {
  if (!canUse(canManageResources)) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => ResourcesApi.archive(id));
}

export async function unarchiveResource(id: string): Promise<ResourceMutationResult> {
  if (!canUse(canManageResources)) return { kind: 'failure', code: 'AUTHORIZATION_REQUIRED' };
  return mutationResult(() => ResourcesApi.unarchive(id));
}

export type { ResourceMetadata };

export async function loadResourceMetadata(url: string): Promise<ResourceMetadata> {
  return loadResourceMetadataFromUrl(url);
}
