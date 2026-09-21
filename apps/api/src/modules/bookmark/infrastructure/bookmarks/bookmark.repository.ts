import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { Inject, Injectable } from '@nestjs/common';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { BookmarkRepository } from '@/modules/bookmark/application/bookmarks/bookmark.repository';
import type { BookmarkRecord } from '@/modules/bookmark/application/bookmarks/bookmark.types';
import { resourceBookmarksSchema } from '@/shared/infrastructure/database/drizzle/schema/bookmark/resource-bookmarks.schema';

@Injectable()
export class DrizzleBookmarkRepository implements BookmarkRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async set(accountId: string, resourceId: string, active: boolean): Promise<BookmarkRecord> {
    const now = new Date().toISOString();
    const [row] = await this.db
      .insert(resourceBookmarksSchema)
      .values({ accountId, resourceId, active, updatedAt: now })
      .onConflictDoUpdate({
        target: [resourceBookmarksSchema.accountId, resourceBookmarksSchema.resourceId],
        set: { active, updatedAt: now },
      })
      .returning();
    if (!row) throw new Error('BOOKMARK_NOT_PERSISTED');

    return row;
  }

  list(accountId: string) {
    return this.db
      .select()
      .from(resourceBookmarksSchema)
      .where(and(eq(resourceBookmarksSchema.accountId, accountId), eq(resourceBookmarksSchema.active, true)))
      .orderBy(desc(resourceBookmarksSchema.updatedAt));
  }

  sync(accountId: string, syncedThrough: string, updatedAfter?: string) {
    const filters = [
      eq(resourceBookmarksSchema.accountId, accountId),
      lte(resourceBookmarksSchema.updatedAt, syncedThrough),
    ];
    if (updatedAfter) filters.push(gte(resourceBookmarksSchema.updatedAt, updatedAfter));

    return this.db
      .select()
      .from(resourceBookmarksSchema)
      .where(and(...filters))
      .orderBy(desc(resourceBookmarksSchema.updatedAt));
  }

  async deleteByAccountId(accountId: string): Promise<number> {
    const rows = await this.db
      .delete(resourceBookmarksSchema)
      .where(eq(resourceBookmarksSchema.accountId, accountId))
      .returning({ accountId: resourceBookmarksSchema.accountId });

    return rows.length;
  }

  async deleteByResourceId(resourceId: string): Promise<number> {
    const rows = await this.db
      .delete(resourceBookmarksSchema)
      .where(eq(resourceBookmarksSchema.resourceId, resourceId))
      .returning({ accountId: resourceBookmarksSchema.accountId });

    return rows.length;
  }
}
