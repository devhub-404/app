import { eq, sql } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { TagWorkflowRepository } from '@/modules/taxonomy/application/tag/ports/tag-workflow.repository';
import { tagMergesSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tag-workflows.schema';
import { resourceTagAssignmentsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/resource-tags.schema';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';

@Injectable()
export class DrizzleTagWorkflowRepository implements TagWorkflowRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async resolveMergedTag(sourceTagId: string): Promise<string | null> {
    const [row] = await this.db
      .select({ targetTagId: tagMergesSchema.targetTagId })
      .from(tagMergesSchema)
      .where(eq(tagMergesSchema.sourceTagId, sourceTagId));

    return row?.targetTagId ?? null;
  }

  async createMerge(input: { sourceTagId: string; targetTagId: string; mergedById: string }): Promise<void> {
    if (input.sourceTagId === input.targetTagId) throw new AppError('TAG_MERGE_INVALID_TARGET');

    await this.db.transaction(async (tx) => {
      // Sorting the pair prevents
      // A->B racing B->A from acquiring the same two advisory locks in
      // opposite order.
      const [firstTagId, secondTagId] = [input.sourceTagId, input.targetTagId].sort();
      tx.select({ lock: sql`pg_advisory_xact_lock(hashtextextended(${firstTagId}, 1))` });
      tx.select({ lock: sql`pg_advisory_xact_lock(hashtextextended(${secondTagId}, 1))` });

      const [source] = await tx
        .select({ id: tagsSchema.id, status: tagsSchema.status })
        .from(tagsSchema)
        .where(eq(tagsSchema.id, input.sourceTagId));
      const [target] = await tx
        .select({ id: tagsSchema.id, status: tagsSchema.status })
        .from(tagsSchema)
        .where(eq(tagsSchema.id, input.targetTagId));
      if (!source || !target || target.status !== 'active') throw new AppError('TAG_MERGE_INVALID_TARGET');

      const [existing] = await tx
        .select({ targetTagId: tagMergesSchema.targetTagId })
        .from(tagMergesSchema)
        .where(eq(tagMergesSchema.sourceTagId, input.sourceTagId));
      if (existing && existing.targetTagId !== input.targetTagId) throw new AppError('TAG_MERGE_INVALID_TARGET');
      if (!existing && source.status !== 'active') throw new AppError('TAG_MERGE_INVALID_TARGET');

      // Flatten inbound aliases of canonical identity (A->B followed by B->C
      // becomes A->C plus B->C). Resolution therefore remains one-hop and
      // deterministic even after repeated governance operations.
      await tx
        .update(tagMergesSchema)
        .set({ targetTagId: input.targetTagId })
        .where(eq(tagMergesSchema.targetTagId, input.sourceTagId));

      if (!existing) await tx.insert(tagMergesSchema).values(input);

      const resourceAssociations = await tx
        .select({ resourceId: resourceTagAssignmentsSchema.resourceId })
        .from(resourceTagAssignmentsSchema)
        .where(eq(resourceTagAssignmentsSchema.tagId, input.sourceTagId));

      if (resourceAssociations.length) {
        await tx
          .insert(resourceTagAssignmentsSchema)
          .values(resourceAssociations.map(({ resourceId }) => ({ resourceId, tagId: input.targetTagId })))
          .onConflictDoNothing();
      }
      await tx.delete(resourceTagAssignmentsSchema).where(eq(resourceTagAssignmentsSchema.tagId, input.sourceTagId));

      await tx
        .update(tagsSchema)
        .set({ status: 'archived', updatedAt: new Date().toISOString() })
        .where(eq(tagsSchema.id, input.sourceTagId));
    });
  }
}
