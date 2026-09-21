import { and, eq, ne } from 'drizzle-orm';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';
import { News, NewsStatus } from '@/modules/news/domain/news';
import { newsSchema } from '@/shared/infrastructure/database/drizzle/schema/news/news.schema';
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
export class DrizzleNewsRepository implements NewsRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly resources: ResourceIdentityStore,
  ) {}

  transaction<T>(work: (context: unknown) => Promise<T>): Promise<T> {
    return this.db.transaction((tx) => work(tx));
  }

  async slugExists(slug: string, excludeId?: string, context?: unknown): Promise<boolean> {
    const conditions = [eq(newsSchema.slug, slug)];
    if (excludeId) conditions.push(ne(newsSchema.id, excludeId));
    const rows = await ((context as Executor | undefined) ?? this.db)
      .select({ id: newsSchema.id })
      .from(newsSchema)
      .where(and(...conditions))
      .limit(1);

    return rows.length > 0;
  }

  async findById(id: string, context?: unknown): Promise<News | null> {
    const newsRow = await ((context as Executor | undefined) ?? this.db)
      .select({ news: newsSchema })
      .from(newsSchema)
      .where(eq(newsSchema.id, id))
      .then((rows) => rows[0] ?? null);

    if (!newsRow) return null;
    const { news } = newsRow;

    return News.rehydrate({
      id: news.id,
      title: news.title,
      description: news.description,
      slug: news.slug,
      coverImageUrl: null,
      coverMediaId: news.coverMediaId ?? null,
      content: news.content,
      contentVersion: news.contentVersion,
      commentsEnabled: news.commentsEnabled,
      status: news.status as NewsStatus,
      occurredAt: news.occurredAt,
      publishedAt: news.publishedAt,
      updatedAt: news.updatedAt,
      deletedAt: news.deletedAt,
      tagSlugs: [],
    });
  }

  async create(
    news: News,
    classification: ResourceClassification = { tagSlugs: [] },
    context?: unknown,
  ): Promise<string> {
    const persist = async (tx: Executor) => {
      await this.resources.assertKind(news.id, 'news', tx);
      const [row] = await tx
        .insert(newsSchema)
        .values({
          id: news.id,
          title: news.title,
          description: news.description,
          slug: news.slug,

          coverMediaId: news.coverMediaId,
          content: news.content,
          contentVersion: news.contentVersion,
          commentsEnabled: news.commentsEnabled,
          status: news.status,
          occurredAt: news.occurredAt,
          publishedAt: news.publishedAt,
          createdAt: news.updatedAt,
          updatedAt: news.updatedAt,
          deletedAt: news.deletedAt,
        })
        .returning({ id: newsSchema.id });

      if (!row) throw new Error('News nao encontrado apos criacao.');

      await this.taxonomyService.setResourceClassification(row.id, classification, tx);

      return row.id;
    };

    return context ? persist(context as Executor) : this.db.transaction((tx) => persist(tx));
  }

  async save(news: News, classification?: ResourceClassification, expectedContentVersion?: number): Promise<boolean> {
    return await this.db.transaction(async (tx) => {
      const conditions = [eq(newsSchema.id, news.id)];
      if (expectedContentVersion !== undefined) conditions.push(eq(newsSchema.contentVersion, expectedContentVersion));
      const [row] = await tx
        .update(newsSchema)
        .set({
          title: news.title,
          description: news.description,
          slug: news.slug,

          coverMediaId: news.coverMediaId,
          content: news.content,
          contentVersion: news.contentVersion,
          commentsEnabled: news.commentsEnabled,
          status: news.status,
          occurredAt: news.occurredAt,
          publishedAt: news.publishedAt,
          updatedAt: news.updatedAt,
          deletedAt: news.deletedAt,
        })
        .where(and(...conditions))
        .returning({ id: newsSchema.id });

      if (!row) return false;

      if (classification) await this.taxonomyService.setResourceClassification(news.id, classification, tx);

      return true;
    });
  }

  async delete(id: string): Promise<void> {
    await this.db
      .update(newsSchema)
      .set({ deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      .where(eq(newsSchema.id, id));
  }
}
