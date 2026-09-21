import { and, asc, countDistinct, desc, eq, gte, ilike, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import { NewsQueryRepository } from '@/modules/news/application/ports/repositories/news.query.repository';
import { NewsDTO, NewsItemDTO } from '@/modules/news/application/dtos/out';
import type { NewsSearchCriteria } from '@/modules/news/application/ports/repositories/news-search.criteria';
import { Paginated } from '@/shared/kernel/pagination';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  mediaObjectsSchema,
  resourceTagAssignmentsSchema,
  tagsSchema,
} from '@/shared/infrastructure/database/drizzle/schema';
import {
  newsReferencesSchema,
  newsSchema,
  sourcesSchema,
} from '@/shared/infrastructure/database/drizzle/schema/news/news.schema';
import { viewStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/view/view-statistics.schema';

type SearchScope = { kind: 'public' } | { kind: 'management' };

type NewsCardSort = 'recent' | 'oldest' | 'views';

@Injectable()
export class DrizzleNewsQueryRepository implements NewsQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    @Inject(MEDIA_CONFIG) private readonly mediaConfig: MediaConfig,
  ) {}

  async findById(id: string): Promise<NewsDTO | null> {
    return this.findDetail(and(eq(newsSchema.id, id), isNull(newsSchema.deletedAt))!);
  }

  async findBySlug(slug: string): Promise<NewsDTO | null> {
    return this.findDetail(and(eq(newsSchema.slug, slug), this.publicNewsDetailPredicate())!, 180);
  }

  async search(filter: NewsSearchCriteria): Promise<Paginated<NewsItemDTO>> {
    return this.searchInternal(filter, { kind: 'public' });
  }

  async searchForManagement(filter: NewsSearchCriteria): Promise<Paginated<NewsItemDTO>> {
    return this.searchInternal(filter, { kind: 'management' });
  }

  async listPopularSources(limit = 10) {
    const rows = await this.db
      .select({
        id: sourcesSchema.id,
        name: sourcesSchema.name,
        domain: sourcesSchema.domain,
        newsCount: countDistinct(newsSchema.id),
      })
      .from(sourcesSchema)
      .innerJoin(newsReferencesSchema, eq(newsReferencesSchema.sourceId, sourcesSchema.id))
      .innerJoin(
        newsSchema,
        and(
          eq(newsSchema.id, newsReferencesSchema.newsId),
          eq(newsSchema.status, 'published'),
          isNull(newsSchema.deletedAt),
        ),
      )
      .groupBy(sourcesSchema.id)
      .orderBy(desc(countDistinct(newsSchema.id)), sourcesSchema.name)
      .limit(Math.min(50, Math.max(1, limit)))
      .$withCache({ config: { ex: 600 }, autoInvalidate: true });

    return rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      domain: row.domain,
      newsCount: Number(row.newsCount),
    }));
  }

  private async searchInternal(filter: NewsSearchCriteria, scope: SearchScope): Promise<Paginated<NewsItemDTO>> {
    const page = Math.max(1, filter.page ?? 1);
    const pageSize = Math.max(1, filter.pageSize ?? 20);
    const offset = (page - 1) * pageSize;
    const where = this.buildSearchWhere(filter, scope);
    const itemsQuery = this.selectCardRows({ where, limit: pageSize, offset, sort: filter.sort });
    const countQuery = this.countNews(where);
    const [rows, countRows] = await Promise.all([
      scope.kind === 'public' ? itemsQuery.$withCache({ config: { ex: 60 }, autoInvalidate: true }) : itemsQuery,
      scope.kind === 'public' ? countQuery.$withCache({ config: { ex: 300 }, autoInvalidate: true }) : countQuery,
    ]);

    return {
      items: rows.map((row) => this.toItem(row)),
      page,
      pageSize,
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  private buildSearchWhere(filter: NewsSearchCriteria, scope: SearchScope): SQL | undefined {
    return and(
      filter.search
        ? or(ilike(newsSchema.title, `%${filter.search}%`), ilike(newsSchema.description, `%${filter.search}%`))
        : undefined,
      scope.kind === 'public' ? this.publicNewsPredicate() : undefined,
      filter.publishedAfter ? gte(newsSchema.publishedAt, filter.publishedAfter.toISOString()) : undefined,
      filter.tags?.length ? this.buildTagPredicate(filter.tags) : undefined,
      filter.sourceDomain ? this.buildSourcePredicate(filter.sourceDomain) : undefined,
    );
  }

  private publicNewsPredicate(): SQL {
    return and(eq(newsSchema.status, 'published'), isNull(newsSchema.deletedAt))!;
  }

  private publicNewsDetailPredicate(): SQL {
    return and(inArray(newsSchema.status, ['published', 'archived']), isNull(newsSchema.deletedAt))!;
  }

  private buildTagPredicate(tagSlugs: string[]): SQL {
    const matchingNewsIds = this.db
      .select({ newsId: resourceTagAssignmentsSchema.resourceId })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(
        tagsSchema,
        and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')),
      )
      .where(inArray(tagsSchema.slug, tagSlugs))
      .groupBy(resourceTagAssignmentsSchema.resourceId)
      .having(eq(countDistinct(tagsSchema.slug), tagSlugs.length));

    return inArray(newsSchema.id, matchingNewsIds);
  }

  private buildSourcePredicate(domain: string): SQL {
    const matchingNewsIds = this.db
      .select({ newsId: newsReferencesSchema.newsId })
      .from(newsReferencesSchema)
      .innerJoin(sourcesSchema, eq(sourcesSchema.id, newsReferencesSchema.sourceId))
      .where(eq(sourcesSchema.domain, domain));

    return inArray(newsSchema.id, matchingNewsIds);
  }

  private countNews(where: SQL | undefined) {
    return this.db
      .select({ total: sql<number>`count(*)` })
      .from(newsSchema)
      .where(where);
  }

  private async findDetail(where: SQL, cacheSeconds?: number): Promise<NewsDTO | null> {
    const query = this.db
      .select({
        id: newsSchema.id,
        title: newsSchema.title,
        description: newsSchema.description,
        slug: newsSchema.slug,
        coverObjectKey: mediaObjectsSchema.objectKey,
        content: newsSchema.content,
        contentVersion: newsSchema.contentVersion,
        tags: sql<
          Array<{ name: string; slug: string }>
        >`coalesce(jsonb_agg(distinct jsonb_build_object('name', ${tagsSchema.name}, 'slug', ${tagsSchema.slug})) filter (where ${tagsSchema.id} is not null), '[]'::jsonb)`,
        views: sql<number>`coalesce(${viewStatisticsSchema.viewCount}, 0)`,
        status: newsSchema.status,
        occurredAt: newsSchema.occurredAt,
        publishedAt: newsSchema.publishedAt,
        deletedAt: newsSchema.deletedAt,
        updatedAt: newsSchema.updatedAt,
      })
      .from(newsSchema)
      .leftJoin(mediaObjectsSchema, eq(mediaObjectsSchema.id, newsSchema.coverMediaId))
      .leftJoin(viewStatisticsSchema, eq(viewStatisticsSchema.resourceId, newsSchema.id))
      .leftJoin(resourceTagAssignmentsSchema, eq(resourceTagAssignmentsSchema.resourceId, newsSchema.id))
      .leftJoin(tagsSchema, and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')))
      .where(where)
      .groupBy(newsSchema.id, mediaObjectsSchema.objectKey, viewStatisticsSchema.viewCount)
      .limit(1);
    const [row] = await (cacheSeconds
      ? query.$withCache({ config: { ex: cacheSeconds }, autoInvalidate: true })
      : query);

    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      slug: row.slug,
      coverImageUrl: resolvePublicUrl(row.coverObjectKey, this.mediaConfig),
      content: row.content,
      contentVersion: row.contentVersion,
      tags: Array.isArray(row.tags) ? row.tags : [],
      views: Number(row.views),
      status: row.status,
      occurredAt: row.occurredAt,
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }

  private selectCardRows({
    where,
    limit,
    offset,
    sort,
  }: {
    where: SQL | undefined;
    limit: number;
    offset: number;
    sort: NewsCardSort | undefined;
  }) {
    const candidates = this.db.$with('news_candidates').as(
      this.db
        .select({
          id: newsSchema.id,
          occurredAt: newsSchema.occurredAt,
          publishedAt: newsSchema.publishedAt,
          updatedAt: newsSchema.updatedAt,
          views: sql<number>`coalesce(${viewStatisticsSchema.viewCount}, 0)`.as('views'),
        })
        .from(newsSchema)
        .leftJoin(viewStatisticsSchema, eq(viewStatisticsSchema.resourceId, newsSchema.id))
        .where(where)
        .orderBy(...resolveNewsOrderBy(sort))
        .limit(limit)
        .offset(offset),
    );

    const newsTags = this.db.$with('news_card_tags').as(
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
      .with(candidates, newsTags)
      .select({
        id: newsSchema.id,
        title: newsSchema.title,
        description: newsSchema.description,
        slug: newsSchema.slug,
        status: newsSchema.status,
        occurredAt: newsSchema.occurredAt,
        publishedAt: newsSchema.publishedAt,
        deletedAt: newsSchema.deletedAt,
        updatedAt: newsSchema.updatedAt,
        coverObjectKey: mediaObjectsSchema.objectKey,
        views: candidates.views,
        tags: sql<Array<{ name: string; slug: string }>>`coalesce(${newsTags.tags}, '[]'::jsonb)`,
      })
      .from(candidates)
      .innerJoin(newsSchema, eq(newsSchema.id, candidates.id))
      .leftJoin(mediaObjectsSchema, eq(mediaObjectsSchema.id, newsSchema.coverMediaId))
      .leftJoin(newsTags, eq(newsTags.resourceId, candidates.id))
      .orderBy(...resolveNewsOrderByForCandidates(candidates, sort));
  }

  private toItem(row: Awaited<ReturnType<DrizzleNewsQueryRepository['selectCardRows']>>[number]): NewsItemDTO {
    return {
      id: String(row.id),
      title: String(row.title),
      description: String(row.description),
      slug: String(row.slug),
      coverImageUrl: resolvePublicUrl(row.coverObjectKey ? String(row.coverObjectKey) : null, this.mediaConfig),
      tags: Array.isArray(row.tags) ? row.tags : [],
      views: Number(row.views),
      status: row.status,
      occurredAt: row.occurredAt ? String(row.occurredAt) : null,
      publishedAt: row.publishedAt ? String(row.publishedAt) : null,
      updatedAt: String(row.updatedAt),
      deletedAt: row.deletedAt ? String(row.deletedAt) : null,
    };
  }
}

function resolveNewsOrderBy(sort: NewsCardSort | undefined) {
  if (sort === 'views') {
    return [
      desc(sql<number>`coalesce(${viewStatisticsSchema.viewCount}, 0)`),
      desc(newsSchema.publishedAt),
      newsSchema.id,
    ];
  }

  return sort === 'oldest' ? [asc(newsSchema.publishedAt)] : [desc(newsSchema.publishedAt)];
}

function resolveNewsOrderByForCandidates(
  candidates: { views: unknown; publishedAt: unknown; id: unknown },
  sort: NewsCardSort | undefined,
) {
  if (sort === 'views') {
    return [desc(candidates.views as never), desc(candidates.publishedAt as never), candidates.id as never];
  }

  if (sort === 'oldest') {
    return [asc(candidates.publishedAt as never), candidates.id as never];
  }

  return [desc(candidates.publishedAt as never), candidates.id as never];
}

function resolvePublicUrl(objectKey: string | null, config: MediaConfig): string | null {
  if (!objectKey) return null;
  const publicBaseUrl = config.storage.publicBaseUrl;

  return publicBaseUrl ? new URL(objectKey, publicBaseUrl).toString() : null;
}
