import { and, eq, isNull } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { ExternalResourceRepository } from '@/modules/external-resource/application/ports/repositories/resource.repository';
import { ExternalResource, ExternalResourceStatus } from '@/modules/external-resource/domain/external-resource';
import { externalResourcesSchema } from '@/shared/infrastructure/database/drizzle/schema/external-resource/external-resources.schema';
import { ExternalResourcesMapper } from '@/modules/external-resource/infrastructure/repositories/resources.mapper';
import { TaxonomyPublicServicePort, type ResourceClassification } from '@/modules/taxonomy/public';
import { ResourceIdentityStore } from '@/shared/infrastructure/database/drizzle/resource-identity.store';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleExternalResourceRepository implements ExternalResourceRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly resources: ResourceIdentityStore,
  ) {}

  async transaction<T>(work: (context: unknown) => Promise<T>): Promise<T> {
    return await this.db.transaction(async (tx) => work(tx));
  }

  async findById(id: string, options?: { includeDeleted?: boolean }): Promise<ExternalResource | null> {
    const resourceRow = await this.db
      .select({ resource: externalResourcesSchema })
      .from(externalResourcesSchema)
      .where(eq(externalResourcesSchema.id, id))
      .then((rows) => rows[0] ?? null);

    if (!resourceRow) {
      return null;
    }

    if (!options?.includeDeleted && resourceRow.resource.deletedAt) {
      return null;
    }

    return ExternalResourcesMapper.toEntity(
      resourceRow.resource,
      resourceRow.resource.createdAt,
      resourceRow.resource.updatedAt,
      resourceRow.resource.deletedAt,
      [],
    );
  }

  listPublishedBySubmitter(accountId: string, limit = 20): Promise<ExternalResource[]> {
    void accountId;
    void limit;

    return Promise.resolve([]);
  }

  async create(
    resource: ExternalResource,
    classification: ResourceClassification = { tagSlugs: [] },
    context?: unknown,
  ): Promise<string> {
    const persist = async (tx: Executor) => {
      await this.resources.assertKind(resource.id, 'external_resource', tx);
      const { id: _resourceId, ...persisted } = ExternalResourcesMapper.toPersistence(resource);
      const [row] = await tx
        .insert(externalResourcesSchema)
        .values({
          id: resource.id,
          ...persisted,
          createdAt: resource.createdAt,
          updatedAt: resource.updatedAt,
          deletedAt: resource.deletedAt,
        })
        .returning({ id: externalResourcesSchema.id });

      if (!row) throw new Error('Failed to persist Resource');

      await this.taxonomyService.setResourceClassification(row.id, classification, tx);

      return row.id;
    };

    return context ? persist(context as Executor) : this.db.transaction((tx) => persist(tx));
  }

  async save(
    resource: ExternalResource,
    classification?: ResourceClassification,
    expected?: { status: ExternalResourceStatus; deletedAt: string | null },
  ): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      const conditions = [eq(externalResourcesSchema.id, resource.id)];
      if (expected) {
        conditions.push(eq(externalResourcesSchema.status, expected.status));
        conditions.push(
          expected.deletedAt === null
            ? isNull(externalResourcesSchema.deletedAt)
            : eq(externalResourcesSchema.deletedAt, expected.deletedAt),
        );
      }

      const updated = await tx
        .update(externalResourcesSchema)
        .set({
          ...ExternalResourcesMapper.toPersistence(resource),
          updatedAt: new Date().toISOString(),
          deletedAt: resource.deletedAt,
        })
        .where(and(...conditions))
        .returning({ id: externalResourcesSchema.id });

      if (updated.length === 0) return false;
      if (classification) await this.taxonomyService.setResourceClassification(resource.id, classification, tx);

      return true;
    });
  }
}
