import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

const VIEWABLE_RESOURCE_KINDS = new Set<ResourceKind>(['article', 'news']);

/** VIEW-RN-002: authenticated unique views are tracked only for Article and News. */
export class ViewTargetPolicy {
  static supports(kind: ResourceKind): boolean {
    return VIEWABLE_RESOURCE_KINDS.has(kind);
  }
}
