import { and, countDistinct, desc, eq, gte, ilike, inArray, isNotNull, isNull, or, sql, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { Inject, Injectable } from '@nestjs/common';
import {
  ArticleQueryRepository,
  type ArticleContentReadModel,
  type ArticleDetailReadModel,
  type ArticleOperationalStateReadModel,
  type ArticlePublishingDataReadModel,
  type ArticlePopularTag,
} from '@/modules/article/application/ports/repositories/article.query.repository';
import { ArticleItemDTO } from '@/modules/article/application/dtos/out';
import type { ArticleSearchCriteria } from '@/modules/article/application/ports/repositories/article-search.criteria';
import { Paginated } from '@/shared/kernel/pagination';
import { MEDIA_CONFIG, type MediaConfig } from '@/modules/media/public/media-config.port';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  accountProfileSchema,
  mediaObjectsSchema,
  resourceTagAssignmentsSchema,
  tagsSchema,
} from '@/shared/infrastructure/database/drizzle/schema';
import { articlesSchema } from '@/shared/infrastructure/database/drizzle/schema/article/articles.schema';
import { commentStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/comment/comment-statistics.schema';
import { viewStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/view/view-statistics.schema';
import { voteStatisticsSchema } from '@/shared/infrastructure/database/drizzle/schema/vote/vote-statistics.schema';

type SearchOptions = {
  authorId?: string;
  visibility: 'public' | 'all';
};

type CardSort = 'votes' | 'views' | 'comments';

type DefaultCardSort = 'publishedAt' | 'updatedAt';

@Injectable()
export class DrizzleArticleQueryRepository implements ArticleQueryRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    @Inject(MEDIA_CONFIG) private readonly mediaConfig: MediaConfig,
  ) {}

  async findById(id: string): Promise<ArticleDetailReadModel | null> {
    const [row] = await this.detailQuery(eq(articlesSchema.id, id));

    return row ?? null;
  }

  async findBySlug(slug: string): Promise<ArticleDetailReadModel | null> {
    const [row] = await this.detailQuery(and(eq(articlesSchema.slug, slug), this.publicArticlePredicate())).$withCache({
      config: { ex: 180 },
      autoInvalidate: true,
    });

    return row ?? null;
  }

  async findContentById(id: string): Promise<ArticleContentReadModel | null> {
    const [row] = await this.contentQuery(eq(articlesSchema.id, id));

    return row ?? null;
  }

  async findContentBySlug(slug: string): Promise<ArticleContentReadModel | null> {
    const [row] = await this.contentQuery(and(eq(articlesSchema.slug, slug), this.publicArticlePredicate())!);

    return row ?? null;
  }

  async findOperationalStateById(id: string): Promise<ArticleOperationalStateReadModel | null> {
    const [row] = await this.db
      .select({
        id: articlesSchema.id,
        authorId: articlesSchema.authorId,
        status: articlesSchema.status,
        commentsEnabled: articlesSchema.commentsEnabled,
        hiddenAt: articlesSchema.hiddenAt,
        deletedAt: articlesSchema.deletedAt,
        updatedAt: articlesSchema.updatedAt,
      })
      .from(articlesSchema)
      .where(eq(articlesSchema.id, id))
      .limit(1);

    return row ?? null;
  }

  async findPublishingDataById(id: string): Promise<ArticlePublishingDataReadModel | null> {
    const [row] = await this.db
      .select({
        id: articlesSchema.id,
        authorId: articlesSchema.authorId,
        title: articlesSchema.title,
        slug: articlesSchema.slug,
        coverObjectKey: mediaObjectsSchema.objectKey,
        status: articlesSchema.status,
        publishedAt: articlesSchema.publishedAt,
        deletedAt: articlesSchema.deletedAt,
        updatedAt: articlesSchema.updatedAt,
      })
      .from(articlesSchema)
      .leftJoin(mediaObjectsSchema, eq(mediaObjectsSchema.id, articlesSchema.coverMediaId))
      .where(eq(articlesSchema.id, id))
      .limit(1);

    return row ?? null;
  }

  async listPopularTags(limit = 10): Promise<ArticlePopularTag[]> {
    const articleCount = countDistinct(articlesSchema.id);
    const cachedRows = await this.db
      .select({
        slug: tagsSchema.slug,
        name: tagsSchema.name,
        articleCount,
      })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(
        tagsSchema,
        and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')),
      )
      .innerJoin(
        articlesSchema,
        and(eq(articlesSchema.id, resourceTagAssignmentsSchema.resourceId), this.publicArticlePredicate()),
      )
      .groupBy(tagsSchema.id, tagsSchema.slug, tagsSchema.name)
      .orderBy(desc(articleCount), tagsSchema.name)
      .limit(Math.max(1, limit))
      .$withCache({ config: { ex: 600 }, autoInvalidate: true });

    return cachedRows.map((row) => ({ ...row, articleCount: Number(row.articleCount) }));
  }

  async search(filter: ArticleSearchCriteria): Promise<Paginated<ArticleItemDTO>> {
    return this.searchInternal(filter, { visibility: 'public' });
  }

  async searchByAuthor(authorId: string, filter: ArticleSearchCriteria): Promise<Paginated<ArticleItemDTO>> {
    return this.searchInternal(filter, { authorId, visibility: 'all' });
  }

  async searchForModeration(filter: ArticleSearchCriteria): Promise<Paginated<ArticleItemDTO>> {
    return this.searchInternal(filter, { visibility: 'all' });
  }

  private async searchInternal(
    filter: ArticleSearchCriteria,
    options: SearchOptions,
  ): Promise<Paginated<ArticleItemDTO>> {
    const page = Math.max(1, filter.page ?? 1);
    const pageSize = Math.max(1, filter.pageSize ?? 20);
    const offset = (page - 1) * pageSize;

    const where = this.buildSearchWhere(filter, options);
    const itemsQuery = this.selectCardRows({
      where,
      limit: pageSize,
      offset,
      sort: filter.sort,
      defaultSort: options.authorId ? 'updatedAt' : 'publishedAt',
    });
    const countQuery = this.countArticles(where);
    const [rows, countRows] = await Promise.all([
      options.visibility === 'public'
        ? itemsQuery.$withCache({ config: { ex: 60 }, autoInvalidate: true })
        : itemsQuery,
      options.visibility === 'public'
        ? countQuery.$withCache({ config: { ex: 300 }, autoInvalidate: true })
        : countQuery,
    ]);

    return {
      items: rows.map((row) => this.toArticleItem(row)),
      page,
      pageSize,
      total: Number(countRows[0]?.total ?? 0),
    };
  }

  private buildSearchWhere(filter: ArticleSearchCriteria, options: SearchOptions): SQL | undefined {
    return and(
      filter.search
        ? or(ilike(articlesSchema.title, `%${filter.search}%`), ilike(articlesSchema.description, `%${filter.search}%`))
        : undefined,
      options.authorId ? eq(articlesSchema.authorId, options.authorId) : undefined,
      options.visibility === 'public' ? this.publicArticlePredicate() : undefined,
      filter.publishedAfter ? gte(articlesSchema.publishedAt, filter.publishedAfter.toISOString()) : undefined,
      filter.tags?.length ? this.buildTagPredicate(filter.tags) : undefined,
    );
  }

  private publicArticlePredicate(): SQL {
    return and(
      eq(articlesSchema.status, 'published'),
      isNull(articlesSchema.hiddenAt),
      isNull(articlesSchema.deletedAt),
    )!;
  }

  private buildTagPredicate(tagSlugs: string[]): SQL {
    const matchingArticleIds = this.db
      .select({ resourceId: resourceTagAssignmentsSchema.resourceId })
      .from(resourceTagAssignmentsSchema)
      .innerJoin(
        tagsSchema,
        and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')),
      )
      .where(inArray(tagsSchema.slug, tagSlugs))
      .groupBy(resourceTagAssignmentsSchema.resourceId)
      .having(eq(countDistinct(tagsSchema.slug), tagSlugs.length));

    return inArray(articlesSchema.id, matchingArticleIds);
  }

  private countArticles(where: SQL | undefined) {
    return this.db
      .select({ total: sql<number>`count(*)` })
      .from(articlesSchema)
      .where(where);
  }

  private selectCardRows({
    where,
    limit,
    offset,
    sort,
    defaultSort,
  }: {
    where: SQL | undefined;
    limit: number;
    offset: number;
    sort: CardSort | undefined;
    defaultSort: 'publishedAt' | 'updatedAt';
  }) {
    const avatarMedia = alias(mediaObjectsSchema, 'article_author_avatar_media');
    const candidates = this.db.$with('article_candidates').as(
      this.db
        .select({
          id: articlesSchema.id,
          publishedAt: articlesSchema.publishedAt,
          updatedAt: articlesSchema.updatedAt,
          votes: sql<number>`coalesce(${voteStatisticsSchema.voteCount}, 0)`.as('votes'),
          views: sql<number>`coalesce(${viewStatisticsSchema.viewCount}, 0)`.as('views'),
          commentCount: sql<number>`coalesce(${commentStatisticsSchema.commentCount}, 0)`.as('comment_count'),
        })
        .from(articlesSchema)
        .leftJoin(voteStatisticsSchema, eq(voteStatisticsSchema.resourceId, articlesSchema.id))
        .leftJoin(viewStatisticsSchema, eq(viewStatisticsSchema.resourceId, articlesSchema.id))
        .leftJoin(commentStatisticsSchema, eq(commentStatisticsSchema.resourceId, articlesSchema.id))
        .where(where)
        .orderBy(
          this.buildCandidatePrimaryOrder(sort, defaultSort),
          desc(articlesSchema.publishedAt),
          articlesSchema.id,
        )
        .limit(limit)
        .offset(offset),
    );

    const articleTags = this.db.$with('article_card_tags').as(
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
      .with(candidates, articleTags)
      .select({
        id: articlesSchema.id,
        authorId: articlesSchema.authorId,
        title: articlesSchema.title,
        description: articlesSchema.description,
        slug: articlesSchema.slug,
        readingTimeMinutes: articlesSchema.readingTimeMinutes,
        status: articlesSchema.status,
        publishedAt: articlesSchema.publishedAt,
        hiddenAt: articlesSchema.hiddenAt,
        hideReason: articlesSchema.hideReason,
        deletedAt: articlesSchema.deletedAt,
        updatedAt: articlesSchema.updatedAt,
        coverObjectKey: mediaObjectsSchema.objectKey,
        authorUsername: accountProfileSchema.username,
        authorDisplayName: accountProfileSchema.displayName,
        authorAvatarObjectKey: avatarMedia.objectKey,
        votes: candidates.votes,
        views: candidates.views,
        commentCount: candidates.commentCount,
        tags: sql<Array<{ name: string; slug: string }>>`coalesce(${articleTags.tags}, '[]'::jsonb)`,
      })
      .from(candidates)
      .innerJoin(articlesSchema, eq(articlesSchema.id, candidates.id))
      .leftJoin(mediaObjectsSchema, eq(mediaObjectsSchema.id, articlesSchema.coverMediaId))
      .leftJoin(accountProfileSchema, eq(accountProfileSchema.userId, articlesSchema.authorId))
      .leftJoin(avatarMedia, eq(avatarMedia.id, accountProfileSchema.avatarMediaId))
      .leftJoin(articleTags, eq(articleTags.resourceId, candidates.id))
      .orderBy(
        this.buildResultPrimaryOrder(candidates, sort, defaultSort),
        desc(candidates.publishedAt),
        candidates.id,
      );
  }

  private buildCandidatePrimaryOrder(sort: CardSort | undefined, defaultSort: DefaultCardSort): SQL {
    if (sort === 'votes') return desc(sql`coalesce(${voteStatisticsSchema.voteCount}, 0)`);
    if (sort === 'views') return desc(sql`coalesce(${viewStatisticsSchema.viewCount}, 0)`);
    if (sort === 'comments') return desc(sql`coalesce(${commentStatisticsSchema.commentCount}, 0)`);

    return desc(defaultSort === 'updatedAt' ? articlesSchema.updatedAt : articlesSchema.publishedAt);
  }

  private buildResultPrimaryOrder(
    candidates: {
      votes: unknown;
      views: unknown;
      commentCount: unknown;
      publishedAt: unknown;
      updatedAt: unknown;
      id: unknown;
    },
    sort: CardSort | undefined,
    defaultSort: DefaultCardSort,
  ): SQL {
    if (sort === 'votes') return desc(candidates.votes as never);
    if (sort === 'views') return desc(candidates.views as never);
    if (sort === 'comments') return desc(candidates.commentCount as never);

    return desc((defaultSort === 'updatedAt' ? candidates.updatedAt : candidates.publishedAt) as never);
  }

  private contentQuery(where: SQL) {
    return this.db
      .select({
        id: articlesSchema.id,
        authorId: articlesSchema.authorId,
        content: articlesSchema.content,
        contentVersion: articlesSchema.contentVersion,
        status: articlesSchema.status,
        hiddenAt: articlesSchema.hiddenAt,
        deletedAt: articlesSchema.deletedAt,
      })
      .from(articlesSchema)
      .where(where)
      .limit(1);
  }

  private detailQuery(where: ReturnType<typeof and>) {
    const avatarMedia = alias(mediaObjectsSchema, 'article_detail_author_avatar_media');
    const query = this.db
      .select({
        id: articlesSchema.id,
        authorId: articlesSchema.authorId,
        authorUsername: accountProfileSchema.username,
        authorDisplayName: accountProfileSchema.displayName,
        authorAvatarObjectKey: avatarMedia.objectKey,
        title: articlesSchema.title,
        description: articlesSchema.description,
        slug: articlesSchema.slug,
        coverObjectKey: mediaObjectsSchema.objectKey,
        readingTimeMinutes: articlesSchema.readingTimeMinutes,
        votes: sql<number>`coalesce(${voteStatisticsSchema.voteCount}, 0)`,
        views: sql<number>`coalesce(${viewStatisticsSchema.viewCount}, 0)`,
        commentCount: sql<number>`coalesce(${commentStatisticsSchema.commentCount}, 0)`,
        tags: sql<
          Array<{ name: string; slug: string }>
        >`coalesce(jsonb_agg(distinct jsonb_build_object('name', ${tagsSchema.name}, 'slug', ${tagsSchema.slug})) filter (where ${tagsSchema.id} is not null), '[]'::jsonb)`,
        status: articlesSchema.status,
        publishedAt: articlesSchema.publishedAt,
        hiddenAt: articlesSchema.hiddenAt,
        hideReason: articlesSchema.hideReason,
        deletedAt: articlesSchema.deletedAt,
        updatedAt: articlesSchema.updatedAt,
      })
      .from(articlesSchema)
      .leftJoin(mediaObjectsSchema, eq(mediaObjectsSchema.id, articlesSchema.coverMediaId))
      .leftJoin(accountProfileSchema, eq(accountProfileSchema.userId, articlesSchema.authorId))
      .leftJoin(avatarMedia, eq(avatarMedia.id, accountProfileSchema.avatarMediaId))
      .leftJoin(voteStatisticsSchema, eq(voteStatisticsSchema.resourceId, articlesSchema.id))
      .leftJoin(viewStatisticsSchema, eq(viewStatisticsSchema.resourceId, articlesSchema.id))
      .leftJoin(commentStatisticsSchema, eq(commentStatisticsSchema.resourceId, articlesSchema.id))
      .leftJoin(resourceTagAssignmentsSchema, eq(resourceTagAssignmentsSchema.resourceId, articlesSchema.id))
      .leftJoin(tagsSchema, and(eq(tagsSchema.id, resourceTagAssignmentsSchema.tagId), eq(tagsSchema.status, 'active')))
      .where(where)
      .groupBy(
        articlesSchema.id,
        mediaObjectsSchema.objectKey,
        accountProfileSchema.userId,
        accountProfileSchema.username,
        accountProfileSchema.displayName,
        avatarMedia.objectKey,
        voteStatisticsSchema.voteCount,
        viewStatisticsSchema.viewCount,
        commentStatisticsSchema.commentCount,
      )
      .limit(1);

    return query;
  }

  async listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>> {
    const rows = await this.db
      .select({ id: articlesSchema.id, hiddenAt: articlesSchema.hiddenAt })
      .from(articlesSchema)
      .where(and(isNotNull(articlesSchema.hiddenAt), isNull(articlesSchema.deletedAt)))
      .orderBy(desc(articlesSchema.hiddenAt));

    return rows.flatMap((row) => (row.hiddenAt ? [{ id: row.id, hiddenAt: row.hiddenAt }] : []));
  }

  private toArticleItem(
    row: Awaited<ReturnType<DrizzleArticleQueryRepository['selectCardRows']>>[number],
  ): ArticleItemDTO {
    return {
      id: String(row.id),
      authorAccountId: row.authorId ? String(row.authorId) : null,
      author: row.authorId
        ? {
            username: String(row.authorUsername ?? ''),
            displayName: String(row.authorDisplayName ?? ''),
            avatarUrl:
              resolvePublicUrl(
                row.authorAvatarObjectKey ? String(row.authorAvatarObjectKey) : null,
                this.mediaConfig,
              ) ?? '',
          }
        : null,
      title: String(row.title),
      description: String(row.description),
      slug: String(row.slug),
      coverImageUrl: resolvePublicUrl(row.coverObjectKey ? String(row.coverObjectKey) : null, this.mediaConfig),
      tags: Array.isArray(row.tags) ? row.tags : [],
      readingTimeMinutes: Number(row.readingTimeMinutes),
      votes: Number(row.votes),
      views: Number(row.views),
      commentCount: Number(row.commentCount),
      status: row.status,
      publishedAt: row.publishedAt ? String(row.publishedAt) : null,
      hiddenAt: row.hiddenAt ? String(row.hiddenAt) : null,
      hideReason: row.hideReason ? String(row.hideReason) : null,
      updatedAt: String(row.updatedAt),
      deletedAt: row.deletedAt ? String(row.deletedAt) : null,
    };
  }
}

function resolvePublicUrl(objectKey: string | null, config: MediaConfig): string | null {
  if (!objectKey) return null;
  const publicBaseUrl = config.storage.publicBaseUrl;

  return publicBaseUrl ? new URL(objectKey, publicBaseUrl).toString() : null;
}
