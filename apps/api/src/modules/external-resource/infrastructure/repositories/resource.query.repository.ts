import { and, countDistinct, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { ExternalResourceQueryRepository } from '@/modules/external-resource/application/ports/repositories/resource.query.repository';
import { ResourceItemDTO } from '@/modules/external-resource/application/dtos/out';
import type { ResourceSearchCriteria } from '@/modules/external-resource/application/ports/repositories/resource-search.criteria';
import { Paginated } from '@/shared/kernel/pagination';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { externalResourcesSchema } from '@/shared/infrastructure/database/drizzle/schema/external-resource/external-resources.schema';
import { resourceTagAssignmentsSchema, tagsSchema } from '@/shared/infrastructure/database/drizzle/schema';
import { voteStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/vote/vote-statistics.schema';

@Injectable()
export class DrizzleExternalResourceQueryRepository implements ExternalResourceQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findById(id: string): Promise<ResourceItemDTO | null> {
    const rows = await this.selectItems({
      where: and(
        eq(externalResourcesSchema.id, id),
        inArray(externalResourcesSchema.status, ['active', 'archived']),
        isNull(externalResourcesSchema.deletedAt),
      ),
      limit: 1,
      offset: 0,
    });

    return rows[0] ? this.toItem(rows[0]) : null;
  }

  async findByIdForManagement(id: string): Promise<ResourceItemDTO | null> {
    const rows = await this.selectItems({
      where: eq(externalResourcesSchema.id, id),
      limit: 1,
      offset: 0,
    });

    return rows[0] ? this.toItem(rows[0]) : null;
  }

  async search(query: ResourceSearchCriteria): Promise<Paginated<ResourceItemDTO>> {
    return this.searchInternal(query, 'active');
  }

  async searchForManagement(query: ResourceSearchCriteria): Promise<Paginated<ResourceItemDTO>> {
    return this.searchInternal(query);
  }

  private async searchInternal(
    query: ResourceSearchCriteria,
    status?: 'active' | 'archived',
  ): Promise<Paginated<ResourceItemDTO>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? 20);
    const offset = (page - 1) * pageSize;
    const where = and(
      status ? eq(externalResourcesSchema.status, status) : undefined,
      status ? isNull(externalResourcesSchema.deletedAt) : undefined,
      query.search
        ? or(
            ilike(externalResourcesSchema.title, `%${query.search}%`),
            ilike(externalResourcesSchema.description, `%${query.search}%`),
          )
        : undefined,
      query.tags?.length ? this.buildTagPredicate(query.tags) : undefined,
    );

    const itemsQuery = this.selectItems({ where, limit: pageSize, offset });
    const countQuery = this.countResources(where);
    const [rows, countRows] = await Promise.all([
      status === 'active' ? itemsQuery.$withCache({ config: { ex: 60 }, autoInvalidate: true }) : itemsQuery,
      status === 'active' ? countQuery.$withCache({ config: { ex: 300 }, autoInvalidate: true }) : countQuery,
    ]);

    return {
      items: rows.map((row) => this.toItem(row)),
      page,
      pageSize,
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  private buildTagPredicate(tagSlugs: string[]): SQL {
    const matchingResourceIds = this.db
      .select({ resourceId: resourceTagAssignmentsSchema.resourceId })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(
        tagsSchema,
        and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')),
      )
      .where(inArray(tagsSchema.slug, tagSlugs))
      .groupBy(resourceTagAssignmentsSchema.resourceId)
      .having(eq(countDistinct(tagsSchema.slug), tagSlugs.length));

    return inArray(externalResourcesSchema.id, matchingResourceIds);
  }

  private countResources(where: SQL | undefined) {
    return this.db
      .select({ total: sql<number>`count(*)` })
      .from(externalResourcesSchema)
      .where(where);
  }

  private selectItems({ where, limit, offset }: { where: SQL | undefined; limit: number; offset: number }) {
    const candidates = this.db.$with('resource_candidates').as(
      this.db
        .select({
          id: externalResourcesSchema.id,
          createdAt: externalResourcesSchema.createdAt,
          votes: sql<number>`coalesce(${voteStatisticsSchema.voteCount}, 0)`.as('votes'),
        })
        .from(externalResourcesSchema)
        .leftJoin(voteStatisticsSchema, eq(voteStatisticsSchema.resourceId, externalResourcesSchema.id))
        .where(where)
        .orderBy(
          desc(sql`coalesce(${voteStatisticsSchema.voteCount}, 0)`),
          desc(externalResourcesSchema.createdAt),
          externalResourcesSchema.id,
        )
        .limit(limit)
        .offset(offset),
    );

    const resourceTags = this.db.$with('resource_card_tags').as(
      this.db
        .select({
          resourceId: resourceTagAssignmentsSchema.resourceId,
          tags: sql<Array<{ name: string; slug: string }>>`
            jsonb_agg(distinct jsonb_build_object('name', ${tagsSchema.name}, 'slug', ${tagsSchema.slug}))
          `.as('tags'),
        })
        .from(resourceTagAssignmentsSchema)
        .innerJoin(candidates, eq(candidates.id, resourceTagAssignmentsSchema.resourceId))
        .innerJoin(
          tagsSchema,
          and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')),
        )
        .groupBy(resourceTagAssignmentsSchema.resourceId),
    );

    return this.db
      .with(candidates, resourceTags)
      .select({
        id: externalResourcesSchema.id,
        title: externalResourcesSchema.title,
        description: externalResourcesSchema.description,
        url: externalResourcesSchema.url,
        status: externalResourcesSchema.status,
        deletedAt: externalResourcesSchema.deletedAt,
        votes: candidates.votes,
        tags: sql<Array<{ name: string; slug: string }>>`coalesce(${resourceTags.tags}, '[]'::jsonb)`,
      })
      .from(candidates)
      .innerJoin(externalResourcesSchema, eq(externalResourcesSchema.id, candidates.id))
      .leftJoin(resourceTags, eq(resourceTags.resourceId, candidates.id))
      .orderBy(desc(candidates.votes), desc(candidates.createdAt), candidates.id);
  }

  private toItem(
    row: Awaited<ReturnType<DrizzleExternalResourceQueryRepository['selectItems']>>[number],
  ): ResourceItemDTO {
    return {
      id: String(row.id),
      status: row.status,
      deletedAt: row.deletedAt ? String(row.deletedAt) : null,
      title: String(row.title),
      description: String(row.description),
      url: String(row.url),
      tags: Array.isArray(row.tags) ? row.tags : [],
      votes: Number(row.votes),
    };
  }
}
