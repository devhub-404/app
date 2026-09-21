import { TaxonomyApi } from '@/shared/taxonomy/api/taxonomy.api.ts';
import type { ApiClient } from '@/shared/api';
import { isAbortError } from '@/shared/runtime/abort-signal';

async function mutationSucceeded(request: () => Promise<{ error?: unknown }>): Promise<boolean> {
  try {
    const result = await request();
    return !result.error;
  } catch (error) {
    if (isAbortError(error)) return false;
    return false;
  }
}

export async function listTags(search?: string, client?: ApiClient, options?: { signal?: AbortSignal }) {
  const { data, error } = await TaxonomyApi.listTags({ search }, client, options);
  if (error) return [];
  return data?.data ?? [];
}

export function listTagsPage(query?: Parameters<typeof TaxonomyApi.listTagsPage>[0]) {
  return TaxonomyApi.listTagsPage(query);
}

export function createTag(payload: Parameters<typeof TaxonomyApi.createTag>[0]) {
  return mutationSucceeded(() => TaxonomyApi.createTag(payload));
}

export function updateTag(id: string, payload: Parameters<typeof TaxonomyApi.updateTag>[1]) {
  return mutationSucceeded(() => TaxonomyApi.updateTag(id, payload));
}

export function deleteTag(id: string) {
  return mutationSucceeded(() => TaxonomyApi.deleteTag(id));
}

export function archiveTag(id: string) {
  return mutationSucceeded(() => TaxonomyApi.archiveTag(id));
}

export function unarchiveTag(id: string) {
  return mutationSucceeded(() => TaxonomyApi.unarchiveTag(id));
}

export function resolveTag(value: string) {
  return TaxonomyApi.resolveTag(value);
}

export function mergeTags(payload: Parameters<typeof TaxonomyApi.mergeTags>[0]) {
  return mutationSucceeded(() => TaxonomyApi.mergeTags(payload));
}

export function listTagAliases(tagId?: string) {
  return TaxonomyApi.listAliases(tagId);
}

export function createTagAlias(payload: Parameters<typeof TaxonomyApi.createAlias>[0]) {
  return mutationSucceeded(() => TaxonomyApi.createAlias(payload));
}

export function deleteTagAlias(id: string) {
  return mutationSucceeded(() => TaxonomyApi.deleteAlias(id));
}

export function listTagIdentityTerms(kind?: 'reserved' | 'blocked') {
  return TaxonomyApi.listIdentityTerms(kind);
}

export function setTagIdentityTerm(payload: Parameters<typeof TaxonomyApi.setIdentityTerm>[0]) {
  return mutationSucceeded(() => TaxonomyApi.setIdentityTerm(payload));
}

export function deleteTagIdentityTerm(id: string) {
  return mutationSucceeded(() => TaxonomyApi.deleteIdentityTerm(id));
}
