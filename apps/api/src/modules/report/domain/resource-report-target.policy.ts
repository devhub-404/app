import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';

const REPORTABLE_RESOURCE_KINDS = new Set<ResourceKind>([
  'article',
  'news',
  'external_resource',
  'project',
  'event',
  'job',
  'question',
  'answer',
]);

/** RPT-RN-003: ResourceIdentity existence alone does not grant reportability. */
export class ResourceReportTargetPolicy {
  static supports(kind: ResourceKind): boolean {
    return REPORTABLE_RESOURCE_KINDS.has(kind);
  }
}
