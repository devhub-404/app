import type { ExternalResource, ExternalResourceStatus } from '@/modules/external-resource/domain/external-resource';
import type { ResourceClassification } from '@/modules/taxonomy/public';

export abstract class ExternalResourceRepository {
  abstract findById(id: string, options?: { includeDeleted?: boolean }): Promise<ExternalResource | null>;
  abstract listPublishedBySubmitter(accountId: string, limit?: number): Promise<ExternalResource[]>;
  abstract create(
    resource: ExternalResource,
    classification?: ResourceClassification,
    context?: unknown,
  ): Promise<string>;
  abstract transaction<T>(work: (context: unknown) => Promise<T>): Promise<T>;
  abstract save(
    resource: ExternalResource,
    classification?: ResourceClassification,
    expected?: { status: ExternalResourceStatus; deletedAt: string | null },
  ): Promise<boolean>;
}
