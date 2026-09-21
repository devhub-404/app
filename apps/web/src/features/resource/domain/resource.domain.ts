import type { ResourceItem } from '@/features/resource/types/resource.type.ts';

export function isResourceArchivable(resource: Pick<ResourceItem, 'status'>): boolean {
  return resource.status === 'active';
}

export function isResourceUnarchivable(resource: Pick<ResourceItem, 'status'>): boolean {
  return resource.status === 'archived';
}
