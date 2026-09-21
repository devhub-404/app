import { and, count, eq, isNotNull, isNull } from 'drizzle-orm';
import { Comment } from '@/modules/comment/domain/comment';
import { commentsSchema } from '@/shared/infrastructure/database/drizzle/schema/comment/comments.schema';
import { Inject, Injectable } from '@nestjs/common';
import { CommentRepository } from '@/modules/comment/application/comments/ports/repositories/comment.repository';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import { CommentStatisticsRepository } from '@/modules/comment/application/comments/ports/repositories/comment-statistics.repository';

@Injectable()
export class DrizzleCommentRepository implements CommentRepository {
  constructor(
    @Inject('DATABASE') private readonly db: DrizzleDatabaseService,
    private readonly statistics: CommentStatisticsRepository,
  ) {}

  async findById(id: string): Promise<Comment | null> {
    const [row] = await this.db.select().from(commentsSchema).where(eq(commentsSchema.id, id));
    if (!row) return null;

    return Comment.rehydrate({
      id: row.id,
      resourceId: row.resourceId,
      authorAccountId: row.authorAccountId,
      parentId: row.parentId ?? null,
      content: row.body,
      editedAt: row.editedAt,
      hiddenAt: row.hiddenAt,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>> {
    const rows = await this.db
      .select({ id: commentsSchema.id, hiddenAt: commentsSchema.hiddenAt })
      .from(commentsSchema)
      .where(and(isNotNull(commentsSchema.hiddenAt), isNull(commentsSchema.deletedAt)));

    return rows.flatMap((row) => (row.hiddenAt ? [{ id: row.id, hiddenAt: row.hiddenAt }] : []));
  }

  async create(comment: Comment): Promise<string> {
    if (comment.isDeleted || !comment.authorAccountId || comment.content === null) {
      throw new Error('COMMENT_INVALID_NEW_STATE');
    }
    const [row] = await this.db
      .insert(commentsSchema)
      .values({
        resourceId: comment.resourceId,
        authorAccountId: comment.authorAccountId,
        parentId: comment.parentId,
        body: comment.content,
        editedAt: comment.editedAt,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        hiddenAt: comment.hiddenAt,
        deletedAt: null,
      })
      .returning({ id: commentsSchema.id });
    if (!row) throw new Error('COMMENT_NOT_PERSISTED');
    await this.rebuildStatistics(comment.resourceId);

    return row.id;
  }

  async updateContent(comment: Comment): Promise<void> {
    if (comment.isDeleted || comment.content === null) throw new Error('COMMENT_DELETED');
    const [row] = await this.db
      .update(commentsSchema)
      .set({ body: comment.content, editedAt: comment.editedAt, updatedAt: comment.updatedAt })
      .where(and(eq(commentsSchema.id, comment.id), isNull(commentsSchema.deletedAt)))
      .returning({ id: commentsSchema.id });
    if (!row) throw new Error('COMMENT_NOT_FOUND');
  }

  async updateVisibility(comment: Comment, expectedHiddenAt: string | null): Promise<boolean> {
    const expectedVisibility =
      expectedHiddenAt === null ? isNull(commentsSchema.hiddenAt) : eq(commentsSchema.hiddenAt, expectedHiddenAt);
    const [row] = await this.db
      .update(commentsSchema)
      .set({ hiddenAt: comment.hiddenAt, updatedAt: comment.updatedAt })
      .where(and(eq(commentsSchema.id, comment.id), expectedVisibility))
      .returning({ id: commentsSchema.id });
    if (!row) return false;
    await this.rebuildStatistics(comment.resourceId);

    return true;
  }

  async delete(comment: Comment): Promise<void> {
    const [deleted] = await this.db
      .update(commentsSchema)
      .set({
        authorAccountId: comment.authorAccountId,
        body: comment.content,
        editedAt: comment.editedAt,
        deletedAt: comment.deletedAt,
        updatedAt: comment.updatedAt,
      })
      .where(and(eq(commentsSchema.id, comment.id), isNull(commentsSchema.deletedAt)))
      .returning({ resourceId: commentsSchema.resourceId });
    if (deleted) await this.rebuildStatistics(deleted.resourceId);
  }

  async purgeByResourceId(resourceId: string): Promise<number> {
    const rows = await this.db
      .delete(commentsSchema)
      .where(eq(commentsSchema.resourceId, resourceId))
      .returning({ id: commentsSchema.id });
    await this.statistics.setCount(resourceId, 0);

    return rows.length;
  }

  async rebuildStatistics(resourceId?: string): Promise<void> {
    const rows = await this.db
      .select({ resourceId: commentsSchema.resourceId, commentCount: count(commentsSchema.id) })
      .from(commentsSchema)
      .where(
        and(
          resourceId ? eq(commentsSchema.resourceId, resourceId) : undefined,
          isNull(commentsSchema.hiddenAt),
          isNull(commentsSchema.deletedAt),
        ),
      )
      .groupBy(commentsSchema.resourceId);

    if (resourceId) {
      const total = rows.find((row) => row.resourceId === resourceId)?.commentCount ?? 0;
      await this.statistics.setCount(resourceId, Number(total));

      return;
    }
    for (const row of rows) await this.statistics.setCount(row.resourceId, Number(row.commentCount));
  }
}
