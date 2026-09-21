import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

const BOOKMARKABLE_RESOURCE_KINDS = new Set<ResourceKind>([
  'article',
  'news',
  'external_resource',
  'project',
  'question',
]);

/** BKM-RN-003: only these Resource kinds support Bookmark. */
export class BookmarkTargetPolicy {
  static supports(kind: ResourceKind): boolean {
    return BOOKMARKABLE_RESOURCE_KINDS.has(kind);
  }
}
