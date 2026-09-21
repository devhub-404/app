import { eq } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { newsReferencesSchema, sourcesSchema } from '@/shared/infrastructure/database/drizzle/schema/news/news.schema';
import { NewsSourceRepository } from '@/modules/news/application/ports/repositories/news-source.repository';
type DrizzleTransaction = Parameters<DrizzleDatabaseService['transaction']>[0] extends (tx: infer T) => unknown
  ? T
  : never;
type Executor = DrizzleDatabaseService | DrizzleTransaction;
@Injectable()
export class DrizzleNewsSourceRepository implements NewsSourceRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}
  async link(newsId: string, url: string, name?: string, context?: unknown) {
    const executor = (context as Executor | undefined) ?? this.db;
    const domain = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    const [source] = await executor
      .insert(sourcesSchema)
      .values({ name: name ?? domain, domain })
      .onConflictDoUpdate({ target: sourcesSchema.domain, set: { updatedAt: new Date().toISOString() } })
      .returning({ id: sourcesSchema.id });
    if (!source) throw new Error('Source not persisted');
    await executor.insert(newsReferencesSchema).values({ newsId, sourceId: source.id, url }).onConflictDoNothing();
  }
  async hasForNews(newsId: string) {
    const [row] = await this.db
      .select({ id: newsReferencesSchema.id })
      .from(newsReferencesSchema)
      .where(eq(newsReferencesSchema.newsId, newsId))
      .limit(1);

    return Boolean(row?.id);
  }
  async findNewsByUrl(url: string) {
    const [row] = await this.db
      .select({ id: newsReferencesSchema.newsId })
      .from(newsReferencesSchema)
      .where(eq(newsReferencesSchema.url, url))
      .limit(1);

    return row?.id ?? null;
  }
}
