import { Inject, Injectable } from '@nestjs/common';
import { and, asc, countDistinct, desc, eq, gte, gt, ilike, inArray, isNull, ne, or, sql } from 'drizzle-orm';
import { alias, unionAll } from 'drizzle-orm/pg-core';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { articlesSchema } from '@/shared/infrastructure/database/drizzle/schema/article/articles.schema';
import { eventsSchema } from '@/shared/infrastructure/database/drizzle/schema/event/events.schema';
import { externalResourcesSchema } from '@/shared/infrastructure/database/drizzle/schema/external-resource/external-resources.schema';
import { tagFollowsSchema } from '@/shared/infrastructure/database/drizzle/schema/follow/tag-follows.schema';
import { resourceVotesSchema } from '@/shared/infrastructure/database/drizzle/schema/vote/resource-votes.schema';
import { resourceViewsSchema } from '@/shared/infrastructure/database/drizzle/schema/view/resource-views.schema';
import { jobsSchema } from '@/shared/infrastructure/database/drizzle/schema/job/job.schema';
import { newsSchema } from '@/shared/infrastructure/database/drizzle/schema/news/news.schema';
import { projectsSchema } from '@/shared/infrastructure/database/drizzle/schema/project/project.schema';
import { questionsSchema } from '@/shared/infrastructure/database/drizzle/schema/q-and-a/q-and-a.schema';
import { resourceTagAssignmentsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/resource-tags.schema';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
import type { DiscoveryPageDTO } from '@/modules/discovery/application/dtos/out';
import { DiscoveryReadPort, type DiscoveryListInput } from '@/modules/discovery/application/ports';
import { DISCOVERY_TYPES, type DiscoveryType } from '@/modules/discovery/application/types';

const TRENDING_DECAY_SECONDS = 7 * 24 * 60 * 60;
const TRENDING_SIGNAL_WEIGHTS = {
  views: 2,
  votes: 1,
} as const;

@Injectable()
export class DrizzleDiscoveryReadService implements DiscoveryReadPort {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async list(
    input: DiscoveryListInput,
    mode: 'relevance' | 'trending' | 'popular' | 'recent' = 'relevance',
    tagMatch: 'all' | 'any' = 'all',
  ): Promise<DiscoveryPageDTO> {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
    const types = parseTypes(input.types);
    const search = input.search?.trim() ?? '';
    const tagSlugs = parseCsv(input.tags);
    if (!types.length) return emptyPage(page, pageSize);

    const candidates = this.candidatesCte();
    const textScore = sql<number>`case
      when ${search} = '' then 0
      when ${ilike(candidates.title, `%${search}%`)} then 2
      when ${ilike(candidates.summary, `%${search}%`)} then 1
      else 0
    end`;
    const totalVotes = countDistinct(resourceVotesSchema.accountId);
    const trendingViews = sql<number>`coalesce((
      select sum(exp(
        -extract(epoch from (now() - ${resourceViewsSchema.createdAt})) / ${TRENDING_DECAY_SECONDS}
      ))
      from ${resourceViewsSchema}
      where ${resourceViewsSchema.resourceId} = ${candidates.id}
        and ${resourceViewsSchema.createdAt} >= now() - interval '7 days'
    ), 0)`;
    const trendingVotes = sql<number>`coalesce((
      select sum(exp(
        -extract(epoch from (now() - ${resourceVotesSchema.updatedAt})) / ${TRENDING_DECAY_SECONDS}
      ))
      from ${resourceVotesSchema}
      where ${resourceVotesSchema.resourceId} = ${candidates.id}
        and ${resourceVotesSchema.active} = true
        and ${resourceVotesSchema.updatedAt} >= now() - interval '7 days'
    ), 0)`;
    const score =
      mode === 'trending'
        ? sql<number>`(${TRENDING_SIGNAL_WEIGHTS.views} * ${trendingViews}) + (${TRENDING_SIGNAL_WEIGHTS.votes} * ${trendingVotes})`
        : mode === 'popular'
          ? totalVotes
          : mode === 'recent'
            ? sql<number>`0`
            : textScore;

    let query = this.db
      .with(candidates)
      .select({
        type: candidates.type,
        id: candidates.id,
        slug: candidates.slug,
        title: candidates.title,
        summary: candidates.summary,
        publishedAt: candidates.publishedAt,
        score,
        total: sql<number>`count(*) over()`,
      })
      .from(candidates)
      .leftJoin(
        resourceVotesSchema,
        and(eq(resourceVotesSchema.resourceId, candidates.id), eq(resourceVotesSchema.active, true)),
      )
      .$dynamic();

    if (tagSlugs.length) {
      query = query
        .innerJoin(resourceTagAssignmentsSchema, eq(resourceTagAssignmentsSchema.resourceId, candidates.id))
        .innerJoin(
          tagsSchema,
          and(
            eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId),
            eq(tagsSchema.status, 'active'),
            inArray(tagsSchema.slug, tagSlugs),
          ),
        );
    }

    const filters = [inArray(candidates.type, types)];
    if (search) filters.push(or(ilike(candidates.title, `%${search}%`), ilike(candidates.summary, `%${search}%`))!);

    query = query
      .where(and(...filters))
      .groupBy(
        candidates.type,
        candidates.id,
        candidates.slug,
        candidates.title,
        candidates.summary,
        candidates.publishedAt,
      );

    if (tagSlugs.length) {
      const requiredTagCount = tagMatch === 'any' ? 1 : tagSlugs.length;
      query = query.having(gte(countDistinct(tagsSchema.slug), requiredTagCount));
    }

    const rows = await query
      .orderBy(
        ...(mode === 'recent'
          ? [desc(candidates.publishedAt), asc(candidates.id)]
          : [desc(score), desc(candidates.publishedAt), asc(candidates.id)]),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return mapPage(rows, page, pageSize);
  }

  async feed(input: DiscoveryListInput, accountId?: string | null): Promise<DiscoveryPageDTO> {
    if (!accountId) return this.list(input, 'recent');

    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, input.pageSize ?? 20));
    const types = parseTypes(input.types);
    if (!types.length) return emptyPage(page, pageSize);

    const candidates = this.candidatesCte();
    const followedTagMatches = countDistinct(tagFollowsSchema.tagId);
    const rows = await this.db
      .with(candidates)
      .select({
        type: candidates.type,
        id: candidates.id,
        slug: candidates.slug,
        title: candidates.title,
        summary: candidates.summary,
        publishedAt: candidates.publishedAt,
        score: followedTagMatches,
        total: sql<number>`count(*) over()`,
      })
      .from(candidates)
      .leftJoin(resourceTagAssignmentsSchema, eq(resourceTagAssignmentsSchema.resourceId, candidates.id))
      .leftJoin(
        tagFollowsSchema,
        and(eq(tagFollowsSchema.tagId, resourceTagAssignmentsSchema.tagId), eq(tagFollowsSchema.accountId, accountId)),
      )
      .where(inArray(candidates.type, types))
      .groupBy(
        candidates.type,
        candidates.id,
        candidates.slug,
        candidates.title,
        candidates.summary,
        candidates.publishedAt,
      )
      .orderBy(
        desc(gt(followedTagMatches, 0)),
        desc(followedTagMatches),
        desc(candidates.publishedAt),
        asc(candidates.id),
      )
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return mapPage(rows, page, pageSize);
  }

  async related(id: string, requestedLimit?: number): Promise<DiscoveryPageDTO> {
    const limit = Math.min(20, Math.max(1, requestedLimit ?? 6));
    const candidates = this.candidatesCte();
    const candidateTags = alias(resourceTagAssignmentsSchema, 'candidate_tags');
    const sourceTags = alias(resourceTagAssignmentsSchema, 'source_tags');
    const sharedTagCount = countDistinct(candidateTags.tagId);

    const rows = await this.db
      .with(candidates)
      .select({
        type: candidates.type,
        id: candidates.id,
        slug: candidates.slug,
        title: candidates.title,
        summary: candidates.summary,
        publishedAt: candidates.publishedAt,
        score: sharedTagCount,
        total: sql<number>`count(*) over()`,
      })
      .from(candidates)
      .innerJoin(candidateTags, eq(candidateTags.resourceId, candidates.id))
      .innerJoin(sourceTags, and(eq(sourceTags.tagId, candidateTags.tagId), eq(sourceTags.resourceId, id)))
      .where(ne(candidates.id, id))
      .groupBy(
        candidates.type,
        candidates.id,
        candidates.slug,
        candidates.title,
        candidates.summary,
        candidates.publishedAt,
      )
      .orderBy(desc(sharedTagCount), desc(candidates.publishedAt), asc(candidates.id))
      .limit(limit);

    const items = rows.map(mapRow);

    return { items, page: 1, pageSize: limit, total: rows.length };
  }

  private candidatesCte() {
    const candidates = unionAll(
      this.db
        .select({
          type: sql<DiscoveryType>`'article'`.as('type'),
          id: articlesSchema.id,
          slug: articlesSchema.slug,
          title: articlesSchema.title,
          summary: articlesSchema.description,
          publishedAt: articlesSchema.publishedAt,
        })
        .from(articlesSchema)
        .where(
          and(
            eq(articlesSchema.status, 'published'),
            isNull(articlesSchema.deletedAt),
            isNull(articlesSchema.hiddenAt),
          ),
        ),
      this.db
        .select({
          type: sql<DiscoveryType>`'news'`.as('type'),
          id: newsSchema.id,
          slug: newsSchema.slug,
          title: newsSchema.title,
          summary: newsSchema.description,
          publishedAt: newsSchema.publishedAt,
        })
        .from(newsSchema)
        .where(and(eq(newsSchema.status, 'published'), isNull(newsSchema.deletedAt))),
      this.db
        .select({
          type: sql<DiscoveryType>`'external_resource'`.as('type'),
          id: externalResourcesSchema.id,
          slug: externalResourcesSchema.url,
          title: externalResourcesSchema.title,
          summary: externalResourcesSchema.description,
          publishedAt: externalResourcesSchema.createdAt,
        })
        .from(externalResourcesSchema)
        .where(and(eq(externalResourcesSchema.status, 'active'), isNull(externalResourcesSchema.deletedAt))),
      this.db
        .select({
          type: sql<DiscoveryType>`'question'`.as('type'),
          id: questionsSchema.id,
          slug: sql<string>`${questionsSchema.id}::text`.as('slug'),
          title: questionsSchema.title,
          summary: sql<string>`left(${questionsSchema.content}, 256)`.as('summary'),
          publishedAt: questionsSchema.createdAt,
        })
        .from(questionsSchema)
        .where(and(isNull(questionsSchema.hiddenAt), isNull(questionsSchema.deletedAt))),
      this.db
        .select({
          type: sql<DiscoveryType>`'project'`.as('type'),
          id: projectsSchema.id,
          slug: projectsSchema.slug,
          title: projectsSchema.title,
          summary: projectsSchema.summary,
          publishedAt: projectsSchema.publishedAt,
        })
        .from(projectsSchema)
        .where(
          and(
            eq(projectsSchema.status, 'published'),
            isNull(projectsSchema.deletedAt),
            isNull(projectsSchema.hiddenAt),
          ),
        ),
      this.db
        .select({
          type: sql<DiscoveryType>`'job'`.as('type'),
          id: jobsSchema.id,
          slug: sql<string>`${jobsSchema.id}::text`.as('slug'),
          title: jobsSchema.title,
          summary: sql<string>`left(${jobsSchema.description}, 256)`.as('summary'),
          publishedAt: jobsSchema.publishedAt,
        })
        .from(jobsSchema)
        .where(
          and(
            eq(jobsSchema.status, 'published'),
            isNull(jobsSchema.hiddenAt),
            isNull(jobsSchema.deletedAt),
            gt(jobsSchema.expiresAt, new Date().toISOString()),
          ),
        ),
      this.db
        .select({
          type: sql<DiscoveryType>`'event'`.as('type'),
          id: eventsSchema.id,
          slug: eventsSchema.slug,
          title: eventsSchema.title,
          summary: eventsSchema.description,
          publishedAt: eventsSchema.publishedAt,
        })
        .from(eventsSchema)
        .where(and(eq(eventsSchema.status, 'published'), isNull(eventsSchema.deletedAt))),
    );

    return this.db.$with('discovery_candidates').as(candidates);
  }
}

function parseTypes(raw?: string): DiscoveryType[] {
  return (
    raw
      ?.split(',')
      .map((value) => value.trim())
      .filter((value): value is DiscoveryType => (DISCOVERY_TYPES as readonly string[]).includes(value)) ?? [
      ...DISCOVERY_TYPES,
    ]
  );
}

function parseCsv(raw?: string): string[] {
  return (
    raw
      ?.split(',')
      .map((value) => value.trim())
      .filter(Boolean) ?? []
  );
}

function mapPage(
  rows: Array<{
    type: DiscoveryType;
    id: string;
    slug: string;
    title: string;
    summary: string;
    publishedAt: string | null;
    score: number | string;
    total: number | string;
  }>,
  page: number,
  pageSize: number,
): DiscoveryPageDTO {
  return {
    items: rows.map(mapRow),
    page,
    pageSize,
    total: Number(rows[0]?.total ?? 0),
  };
}

function mapRow(row: {
  type: DiscoveryType;
  id: string;
  slug: string;
  title: string;
  summary: string;
  publishedAt: string | null;
  score: number | string;
}) {
  return {
    type: row.type,
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    publishedAt: row.publishedAt,
    relevanceScore: Number(row.score ?? 0),
  };
}

function emptyPage(page: number, pageSize: number): DiscoveryPageDTO {
  return { items: [], page, pageSize, total: 0 };
}
