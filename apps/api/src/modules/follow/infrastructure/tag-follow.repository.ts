import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { tagFollowsSchema } from '@/shared/infrastructure/database/drizzle/schema/follow/tag-follows.schema';
import { tagsSchema } from '@/shared/infrastructure/database/drizzle/schema/taxonomy/tags.schema';
import type { TagFollow } from '@/modules/follow/domain/tag-follow';
import { TagFollowRepository, type FollowedTagRecord } from '@/modules/follow/application/ports/tag-follow.repository';

@Injectable()
export class DrizzleTagFollowRepository implements TagFollowRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async follow(follow: TagFollow): Promise<void> {
    await this.db.insert(tagFollowsSchema).values(follow.value).onConflictDoNothing();
  }

  async unfollow(accountId: string, tagId: string): Promise<boolean> {
    const rows = await this.db
      .delete(tagFollowsSchema)
      .where(and(eq(tagFollowsSchema.accountId, accountId), eq(tagFollowsSchema.tagId, tagId)))
      .returning({ tagId: tagFollowsSchema.tagId });

    return rows.length > 0;
  }

  async isFollowing(accountId: string, tagId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ tagId: tagFollowsSchema.tagId })
      .from(tagFollowsSchema)
      .where(and(eq(tagFollowsSchema.accountId, accountId), eq(tagFollowsSchema.tagId, tagId)))
      .limit(1);

    return Boolean(row);
  }

  async listByAccount(accountId: string): Promise<FollowedTagRecord[]> {
    return this.db
      .select({
        id: tagsSchema.id,
        name: tagsSchema.name,
        slug: tagsSchema.slug,
        createdAt: tagFollowsSchema.createdAt,
      })
      .from(tagFollowsSchema)
      .innerJoin(tagsSchema, eq(tagsSchema.id, tagFollowsSchema.tagId))
      .where(eq(tagFollowsSchema.accountId, accountId))
      .orderBy(desc(tagFollowsSchema.createdAt));
  }
}
