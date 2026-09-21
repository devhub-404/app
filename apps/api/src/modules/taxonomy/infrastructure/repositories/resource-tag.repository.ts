import { and, eq, inArray } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { resourceTagAssignmentsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/resource-tags.schema';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  ResourceTagRepository,
  type ResourceClassification,
  type ResourceTagItem,
} from '@/modules/taxonomy/application/ports/repositories/resource-tag.repository';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleResourceTagRepository implements ResourceTagRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async removeResourceClassification(resourceId: string): Promise<void> {
    await this.db.delete(resourceTagAssignmentsSchema).where(eq(resourceTagAssignmentsSchema.resourceId, resourceId));
  }

  async removeAllAssociationsByTagId(tagId: string): Promise<void> {
    await this.db.delete(resourceTagAssignmentsSchema).where(eq(resourceTagAssignmentsSchema.tagId, tagId));
  }

  async getResourceIdsByTagSlugs(slugs: string[]): Promise<string[]> {
    if (slugs.length === 0) return [];
    const rows = await this.db
      .select({ resourceId: resourceTagAssignmentsSchema.resourceId })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(tagsSchema, eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId))
      .where(and(inArray(tagsSchema.slug, slugs), eq(tagsSchema.status, 'active')));

    return [...new Set(rows.map((row) => row.resourceId))];
  }

  async getTagsByResourceIds(resourceIds: string[]): Promise<ResourceTagItem[]> {
    if (resourceIds.length === 0) return [];

    return await this.db
      .select({
        resourceId: resourceTagAssignmentsSchema.resourceId,
        name: tagsSchema.name,
        slug: tagsSchema.slug,
      })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(tagsSchema, eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId))
      .where(and(inArray(resourceTagAssignmentsSchema.resourceId, resourceIds), eq(tagsSchema.status, 'active')));
  }

  async getResourceTagSlugs(resourceId: string): Promise<string[]> {
    const rows = await this.db
      .select({ slug: tagsSchema.slug })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(tagsSchema, eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId))
      .where(and(eq(resourceTagAssignmentsSchema.resourceId, resourceId), eq(tagsSchema.status, 'active')));

    return rows.map((row) => row.slug);
  }

  async setResourceClassification(
    resourceId: string,
    classification: ResourceClassification,
    context?: unknown,
  ): Promise<void> {
    const executor = (context as Executor | undefined) ?? this.db;
    const operation = async (tx: Executor): Promise<void> => {
      await tx.delete(resourceTagAssignmentsSchema).where(eq(resourceTagAssignmentsSchema.resourceId, resourceId));

      const requestedSlugs = [...new Set(classification.tagSlugs)];
      const tagRows = requestedSlugs.length
        ? await tx
            .select({ id: tagsSchema.id, slug: tagsSchema.slug })
            .from(tagsSchema)
            .where(and(inArray(tagsSchema.slug, requestedSlugs), eq(tagsSchema.status, 'active')))
        : [];
      if (tagRows.length !== requestedSlugs.length) throw new AppError('TAG_NOT_FOUND');

      if (tagRows.length > 0) {
        await tx
          .insert(resourceTagAssignmentsSchema)
          .values(tagRows.map(({ id }) => ({ resourceId, tagId: id })))
          .onConflictDoNothing();
      }
    };

    if (context) await operation(executor);
    else await this.db.transaction(operation);
  }
}
