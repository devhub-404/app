import { and, asc, eq, isNotNull, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { Inject, Injectable } from '@nestjs/common';
import { CommentQueryRepository } from '@/modules/comment/application/comments/ports/repositories/comment.query.repository';
import { CommentDTO } from '@/modules/comment/application/comments/dtos/out';
import { commentsSchema } from '@/shared/infrastructure/database/drizzle/schema/comment/comments.schema';
import type { DrizzleDatabaseService } from '@/shared/infrastructure/database/drizzle/db';
import type { CommentSearchCriteria } from '@/modules/comment/application/comments/ports/repositories/comment-search.criteria';
import type { Paginated } from '@/shared/kernel/pagination';
import { accountProfileSchema, mediaObjectsSchema } from '@/shared/infrastructure/database/drizzle/schema';

type CommentRow = {
  id: string;
  resourceId: string;
  authorAccountId: string | null;
  parentId: string | null;
  content: string | null;
  editedAt: string | null;
  hiddenAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  authorUsername: string | null;
  authorDisplayName: string | null;
  authorAvatarObjectKey: string | null;
};

@Injectable()
export class DrizzleCommentQueryRepository implements CommentQueryRepository {
  constructor(@Inject('DATABASE') private readonly db: DrizzleDatabaseService) {}

  async findById(id: string): Promise<CommentDTO | null> {
    const [row] = await this.baseSelect().where(eq(commentsSchema.id, id)).limit(1);

    return row ? this.toComment(row) : null;
  }

  async findByResourceId(resourceId: string): Promise<CommentDTO[]> {
    const rows = await this.baseSelect()
      .where(and(eq(commentsSchema.resourceId, resourceId), isNull(commentsSchema.hiddenAt)))
      .orderBy(asc(commentsSchema.createdAt));

    return rows.map((row) => this.toComment(row));
  }

  async findHiddenByResourceId(resourceId: string): Promise<CommentDTO[]> {
    const rows = await this.baseSelect()
      .where(
        and(
          eq(commentsSchema.resourceId, resourceId),
          isNotNull(commentsSchema.hiddenAt),
          isNull(commentsSchema.deletedAt),
        ),
      )
      .orderBy(asc(commentsSchema.createdAt));

    return rows.map((row) => this.toComment(row));
  }

  async findByAuthorId(authorAccountId: string, query: CommentSearchCriteria): Promise<Paginated<CommentDTO>> {
    return this.findPaginated(
      and(eq(commentsSchema.authorAccountId, authorAccountId), isNull(commentsSchema.deletedAt)),
      query,
    );
  }

  async findAll(query: CommentSearchCriteria): Promise<Paginated<CommentDTO>> {
    return this.findPaginated(undefined, query);
  }

  private async findPaginated(
    filter: ReturnType<typeof eq> | ReturnType<typeof and> | undefined,
    query: CommentSearchCriteria,
  ): Promise<Paginated<CommentDTO>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 20));
    const avatarMedia = alias(mediaObjectsSchema, 'comment_author_avatar_media');
    const rows = await this.db
      .select({
        id: commentsSchema.id,
        resourceId: commentsSchema.resourceId,
        authorAccountId: commentsSchema.authorAccountId,
        parentId: commentsSchema.parentId,
        content: commentsSchema.body,
        editedAt: commentsSchema.editedAt,
        hiddenAt: commentsSchema.hiddenAt,
        deletedAt: commentsSchema.deletedAt,
        createdAt: commentsSchema.createdAt,
        authorUsername: accountProfileSchema.username,
        authorDisplayName: accountProfileSchema.displayName,
        authorAvatarObjectKey: avatarMedia.objectKey,
        total: sql<number>`count(*) over()`,
      })
      .from(commentsSchema)
      .leftJoin(accountProfileSchema, eq(accountProfileSchema.userId, commentsSchema.authorAccountId))
      .leftJoin(avatarMedia, eq(avatarMedia.id, accountProfileSchema.avatarMediaId))
      .where(
        and(
          filter,
          query.hidden === true ? isNotNull(commentsSchema.hiddenAt) : undefined,
          query.hidden === false ? isNull(commentsSchema.hiddenAt) : undefined,
        ),
      )
      .orderBy(asc(commentsSchema.createdAt), asc(commentsSchema.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return { items: rows.map((row) => this.toComment(row)), page, pageSize, total: Number(rows[0]?.total ?? 0) };
  }

  private baseSelect() {
    const avatarMedia = alias(mediaObjectsSchema, 'comment_author_avatar_media');

    return this.db
      .select({
        id: commentsSchema.id,
        resourceId: commentsSchema.resourceId,
        authorAccountId: commentsSchema.authorAccountId,
        parentId: commentsSchema.parentId,
        content: commentsSchema.body,
        editedAt: commentsSchema.editedAt,
        hiddenAt: commentsSchema.hiddenAt,
        deletedAt: commentsSchema.deletedAt,
        createdAt: commentsSchema.createdAt,
        authorUsername: accountProfileSchema.username,
        authorDisplayName: accountProfileSchema.displayName,
        authorAvatarObjectKey: avatarMedia.objectKey,
      })
      .from(commentsSchema)
      .leftJoin(accountProfileSchema, eq(accountProfileSchema.userId, commentsSchema.authorAccountId))
      .leftJoin(avatarMedia, eq(avatarMedia.id, accountProfileSchema.avatarMediaId));
  }

  private toComment(row: CommentRow): CommentDTO {
    return {
      id: row.id,
      resourceId: row.resourceId,
      parentId: row.parentId,
      content: row.content,
      editedAt: row.editedAt,
      hiddenAt: row.hiddenAt,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      author:
        row.deletedAt || !row.authorAccountId
          ? null
          : {
              username: row.authorUsername ?? '',
              displayName: row.authorDisplayName ?? '',
              avatarUrl: row.authorAvatarObjectKey ?? '',
            },
    };
  }
}
