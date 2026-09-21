import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

const VOTEABLE_RESOURCE_KINDS = new Set<ResourceKind>([
  'article',
  'external_resource',
  'project',
  'question',
  'answer',
]);

/** VOTE-RN-003: only these Resource kinds support Vote. */
export class VoteTargetPolicy {
  static supports(kind: ResourceKind): boolean {
    return VOTEABLE_RESOURCE_KINDS.has(kind);
  }
}
