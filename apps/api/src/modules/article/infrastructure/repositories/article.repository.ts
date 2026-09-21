import { and, eq, ne } from 'drizzle-orm';
import { ArticleRepository } from '@/modules/article/application/ports/repositories/article.repository';
import { Article, ArticleStatus } from '@/modules/article/domain/article';
import { articlesSchema } from '@/shared/infrastructure/database/drizzle/schema/article/articles.schema';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import {
  TaxonomyPublicServicePort,
  type ResourceClassification,
} from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { ResourceIdentityStore } from '@/shared/infrastructure/database/drizzle/resource-identity.store';

type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;

@Injectable()
export class DrizzleArticleRepository implements ArticleRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly resources: ResourceIdentityStore,
  ) {}

  transaction<T>(work: (context: unknown) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => work(tx));
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(articlesSchema.slug, slug)];
    if (excludeId) conditions.push(ne(articlesSchema.id, excludeId));
    const rows = await this.db
      .select({ id: articlesSchema.id })
      .from(articlesSchema)
      .where(and(...conditions))
      .limit(1);

    return rows.length > 0;
  }

  async findById(id: string): Promise<Article | null> {
    const articleRow = await this.db
      .select({ article: articlesSchema })
      .from(articlesSchema)
      .where(eq(articlesSchema.id, id))
      .then((rows) => rows[0] ?? null);

    if (!articleRow) return null;
    const { article } = articleRow;

    return Article.rehydrate({
      id: article.id,
      authorId: article.authorId,
      title: article.title,
      description: article.description,
      slug: article.slug,
      coverImageUrl: null,
      coverMediaId: article.coverMediaId ?? null,
      content: article.content,
      contentVersion: article.contentVersion,
      readingTimeMinutes: article.readingTimeMinutes,
      commentsEnabled: article.commentsEnabled,
      status: article.status as ArticleStatus,
      publishedAt: article.publishedAt,
      hiddenAt: article.hiddenAt,
      hideReason: article.hideReason,
      updatedAt: article.updatedAt,
      deletedAt: article.deletedAt,
      tagSlugs: [],
    });
  }

  async create(
    article: Article,
    classification: ResourceClassification = { tagSlugs: [] },
    context?: unknown,
  ): Promise<string> {
    const persist = async (tx: Executor) => {
      await this.resources.assertKind(article.id, 'article', tx);
      const [row] = await tx
        .insert(articlesSchema)
        .values({
          id: article.id,
          authorId: article.authorId,
          title: article.title,
          description: article.description,
          slug: article.slug,
          coverMediaId: article.coverMediaId,
          content: article.content,
          contentVersion: article.contentVersion,
          readingTimeMinutes: article.readingTimeMinutes,
          commentsEnabled: article.commentsEnabled,
          status: article.status,
          publishedAt: article.publishedAt,
          hiddenAt: article.hiddenAt,
          hideReason: article.hideReason,
          createdAt: article.updatedAt,
          updatedAt: article.updatedAt,
          deletedAt: article.deletedAt,
        })
        .returning({ id: articlesSchema.id });
      if (!row) throw new Error('ARTICLE_NOT_PERSISTED');
      await this.taxonomyService.setResourceClassification(article.id, classification, tx);

      return article.id;
    };

    return context ? persist(context as Executor) : this.db.transaction((tx) => persist(tx));
  }

  async save(
    article: Article,
    classification?: ResourceClassification,
    expectedContentVersion?: number,
  ): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      const conditions = [eq(articlesSchema.id, article.id)];
      if (expectedContentVersion !== undefined)
        conditions.push(eq(articlesSchema.contentVersion, expectedContentVersion));
      const [row] = await tx
        .update(articlesSchema)
        .set({
          title: article.title,
          description: article.description,
          slug: article.slug,

          coverMediaId: article.coverMediaId,
          content: article.content,
          contentVersion: article.contentVersion,
          readingTimeMinutes: article.readingTimeMinutes,
          commentsEnabled: article.commentsEnabled,
          status: article.status,
          publishedAt: article.publishedAt,
          hiddenAt: article.hiddenAt,
          hideReason: article.hideReason,
          updatedAt: article.updatedAt,
          deletedAt: article.deletedAt,
        })
        .where(and(...conditions))
        .returning({ id: articlesSchema.id });

      if (!row) return false;

      if (classification) await this.taxonomyService.setResourceClassification(article.id, classification, tx);

      return true;
    });
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(articlesSchema)
      .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(eq(articlesSchema.id, id));
  }
}
