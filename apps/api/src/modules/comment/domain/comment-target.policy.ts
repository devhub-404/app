import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

const COMMENTABLE_RESOURCE_KINDS = new Set<ResourceKind>(['article', 'news']);

/** CMT-RN-002: Comment is available only for Article and News. */
export class CommentTargetPolicy {
  static supports(kind: ResourceKind): boolean {
    return COMMENTABLE_RESOURCE_KINDS.has(kind);
  }
}
