import './support/comment/queries.cases';
import { describe, expect, it, vi } from 'vitest';
import { CreateCommentCommand } from '@/modules/comment/application/use-cases/command/create-comment.command';
import { DeleteCommentCommand } from '@/modules/comment/application/use-cases/command/delete-comment.command';
import { HideCommentCommand } from '@/modules/comment/application/use-cases/command/hide-comment.command';
import { UnhideCommentCommand } from '@/modules/comment/application/use-cases/command/unhide-comment.command';
import { UpdateCommentCommand } from '@/modules/comment/application/use-cases/command/update-comment.command';
import type { Comment } from '@/modules/comment/domain/comment';
import { Comment as CommentEntity } from '@/modules/comment/domain/comment';
import { GetCommentQuery } from '@/modules/comment/application/use-cases/query/get-comment.query';
import { ListHiddenCommentsQuery } from '@/modules/comment/application/use-cases/query/list-hidden-comments.query';
import { CommentsPolicy } from '@/modules/comment/application/comments/comments.policy';
import { ListCommentsForModerationQuery } from '@/modules/comment/application/use-cases/query/list-comments-for-moderation.query';
import { ListMyCommentsQuery } from '@/modules/comment/application/use-cases/query/list-my-comments.query';
import { CommentTargetAccessService } from '@/modules/comment/application/comments/comment-target-access.service';
import { CommentStatisticsProjection } from '@/modules/comment/application/comments/comment-statistics.projection';

function target(overrides: Record<string, unknown> = {}) {
  return {
    kind: 'article' as const,
    ownerAccountId: 'owner-1',
    isReadable: true,
    isCommentable: true,
    ...overrides,
  };
}

function subject(options: { target?: object | null; parent?: Comment | null; restrictionError?: Error } = {}) {
  const persisted: Comment[] = [];
  const repository = {
    findById: vi.fn(async () => options.parent ?? null),
    create: vi.fn(async (comment: Comment) => {
      persisted.push(comment);

      return 'comment-1';
    }),
  };
  const query = {
    findById: vi.fn(async () => ({
      id: 'comment-1',
      resourceId: 'article-1',
      author: { username: 'actor', displayName: 'Actor', avatarUrl: '' },
      parentId: null,
      content: 'Useful comment',
      createdAt: '2026-08-18T00:00:00.000Z',
      editedAt: null,
      hiddenAt: null,
      deletedAt: null,
    })),
  };
  const access = { resolve: vi.fn(async () => (options.target === undefined ? target() : options.target)) };
  const notifications = { notify: vi.fn(async () => null) };
  const restrictions = {
    assertAccountCapability: vi.fn(async () => {
      if (options.restrictionError) throw options.restrictionError;
    }),
  };

  return {
    command: new CreateCommentCommand(
      repository as never,
      query as never,
      access as never,
      notifications as never,
      restrictions,
    ),
    repository,
    access,
    notifications,
    persisted,
  };
}

describe('Comment target access', () => {
  it.each(['article', 'news'] as const)(
    'CMT-RN-007/CMT-RN-008/NEWS-RN-009 — %s owner controls commentsEnabled without hiding existing reads',
    async (kind) => {
      const owner = {
        resolveAccess: vi.fn(async () => ({ isPublic: true, commentsEnabled: false, ownerAccountId: 'owner-1' })),
      };
      const service = new CommentTargetAccessService(
        { get: vi.fn(async () => ({ id: 'resource-1', kind })) } as never,
        (kind === 'article' ? owner : { resolveAccess: vi.fn() }) as never,
        (kind === 'news' ? owner : { resolveAccess: vi.fn() }) as never,
      );
      await expect(service.resolve('resource-1')).resolves.toMatchObject({
        kind,
        isReadable: true,
        isCommentable: false,
      });
    },
  );
});

describe('Comment creation effects', () => {
  it('creates on a commentable Resource and notifies a different Article owner', async () => {
    const { command, persisted, notifications } = subject();
    await expect(command.execute('actor-1', 'article-1', { content: 'Useful comment' })).resolves.toMatchObject({
      id: 'comment-1',
      resourceId: 'article-1',
      content: 'Useful comment',
    });
    expect(persisted[0]).toMatchObject({
      authorAccountId: 'actor-1',
      resourceId: 'article-1',
      content: 'Useful comment',
    });
    expect(notifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: 'owner-1',
        type: 'article_commented',
        sourceType: 'comment',
        sourceId: 'comment-1',
        targetType: 'article',
        targetId: 'article-1',
      }),
    );
  });

  it('does not create when COMMENT is restricted or target is not commentable', async () => {
    const restricted = subject({ restrictionError: new Error('restricted') });
    await expect(restricted.command.execute('actor-1', 'article-1', { content: 'Blocked' })).rejects.toThrow(
      'restricted',
    );
    expect(restricted.access.resolve).not.toHaveBeenCalled();
    for (const unavailable of [target({ isCommentable: false }), null]) {
      const denied = subject({ target: unavailable });
      await expect(denied.command.execute('actor-1', 'article-1', { content: 'Blocked' })).rejects.toMatchObject({
        code: 'CONTENT_INTERACTION_NOT_ALLOWED',
      });
      expect(denied.repository.create).not.toHaveBeenCalled();
    }
  });

  it('rejects a reply whose parent belongs to another Resource and does not self-notify Article author', async () => {
    const invalidParent = subject({
      parent: CommentEntity.create('parent-1', { resourceId: 'other', authorAccountId: 'actor-2', content: 'Parent' }),
    });
    await expect(
      invalidParent.command.execute('actor-1', 'article-1', { parentId: 'parent-1', content: 'Reply' }),
    ).rejects.toMatchObject({ code: 'CONTENT_COMMENT_INVALID_PARENT' });
    const self = subject({ target: target({ ownerAccountId: 'actor-1' }) });
    await self.command.execute('actor-1', 'article-1', { content: 'Own comment' });
    expect(self.notifications.notify).not.toHaveBeenCalled();
  });

  it('supports News comments without emitting Article-author notification', async () => {
    const news = subject({ target: target({ kind: 'news', ownerAccountId: null }) });
    await news.command.execute('actor-1', 'news-1', { content: 'News discussion' });
    expect(news.persisted[0]).toMatchObject({ resourceId: 'news-1' });
    expect(news.notifications.notify).not.toHaveBeenCalled();
  });
});

describe('Comment read/projection use cases', () => {
  it('delegates moderation inventory filters', async () => {
    const findAll = vi.fn(async () => ({ data: [], total: 0, page: 1, pageSize: 20 }));
    const input = { page: 1, pageSize: 20, hidden: true } as never;
    await expect(new ListCommentsForModerationQuery({ findAll } as never).execute(input)).resolves.toMatchObject({
      total: 0,
    });
    expect(findAll).toHaveBeenCalledWith(input);
  });

  it('scopes my-comments by authenticated author id', async () => {
    const findByAuthorId = vi.fn(async () => ({ data: [], total: 0, page: 1, pageSize: 20 }));
    const input = { page: 1, pageSize: 20 } as never;
    await new ListMyCommentsQuery({ findByAuthorId } as never).execute('account-1', input);
    expect(findByAuthorId).toHaveBeenCalledWith('account-1', input);
  });

  it('keeps public totals as a Resource projection', async () => {
    const getCounts = vi.fn(async () => ({ 'article-1': 3 }));
    const setCount = vi.fn(async () => undefined);
    const projection = new CommentStatisticsProjection({ getCounts, setCount });
    await expect(projection.getCounts(['article-1'])).resolves.toEqual({ 'article-1': 3 });
    await projection.setCount('article-1', 4);
    expect(setCount).toHaveBeenCalledWith('article-1', 4);
  });
});

describe('Comment mutation use cases', () => {
  function entity() {
    return CommentEntity.create('comment-1', {
      resourceId: 'article-1',
      authorAccountId: 'author-1',
      content: 'Original',
    });
  }

  it('updates only the author-owned comment without changing moderation visibility', async () => {
    const value = entity();
    value.hide();
    const updateContent = vi.fn(async () => undefined);
    await new UpdateCommentCommand(
      { findById: async () => value, updateContent } as never,
      new CommentsPolicy(),
    ).execute({ sub: 'author-1', role: 'user' }, value.id, { content: 'Updated' });
    expect(value.content).toBe('Updated');
    expect(value.hiddenAt).not.toBeNull();
  });

  it('rejects update/delete by another author', async () => {
    const value = entity();
    const updateContent = vi.fn(async () => undefined);
    const remove = vi.fn(async () => undefined);
    const intruder = { sub: 'intruder-1', role: 'user' } as const;
    await expect(
      new UpdateCommentCommand({ findById: async () => value, updateContent } as never, new CommentsPolicy()).execute(
        intruder,
        value.id,
        { content: 'Intruder' },
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      new DeleteCommentCommand({ findById: async () => value, delete: remove } as never, new CommentsPolicy()).execute(
        intruder,
        value.id,
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('tombstones an author-deleted comment', async () => {
    const value = entity();
    const remove = vi.fn(async () => undefined);
    await new DeleteCommentCommand(
      { findById: async () => value, delete: remove } as never,
      new CommentsPolicy(),
    ).execute({ sub: 'author-1', role: 'user' }, value.id);
    expect(value.isDeleted).toBe(true);
    expect(value.authorAccountId).toBeNull();
    expect(value.content).toBeNull();
  });

  it('hides/unhides through moderation CAS', async () => {
    const hidden = entity();
    const updateVisibility = vi.fn(async () => true);
    await new HideCommentCommand(
      { findById: async () => hidden, updateVisibility } as never,
      new CommentsPolicy(),
    ).execute({ sub: 'moderator-1', role: 'moderator' }, hidden.id);
    expect(hidden.hiddenAt).not.toBeNull();
    const visible = entity();
    visible.hide();
    const previousHiddenAt = visible.hiddenAt;
    await new UnhideCommentCommand(
      { findById: async () => visible, updateVisibility } as never,
      new CommentsPolicy(),
    ).execute({ sub: 'admin-1', role: 'admin' }, visible.id);
    expect(visible.hiddenAt).toBeNull();
    expect(updateVisibility).toHaveBeenLastCalledWith(visible, previousHiddenAt);
  });

  it('returns a single comment and fails closed when absent', async () => {
    const value = { id: 'comment-1', content: 'Comment' } as never;
    await expect(new GetCommentQuery({ findById: async () => value } as never).execute(value.id)).resolves.toBe(value);
    await expect(new GetCommentQuery({ findById: async () => null } as never).execute('missing')).rejects.toMatchObject(
      { code: 'CONTENT_COMMENT_NOT_FOUND' },
    );
  });

  it('lists hidden comments by Resource', async () => {
    const findHiddenByResourceId = vi.fn(async () => []);
    const query = new ListHiddenCommentsQuery(
      { findHiddenByResourceId } as never,
      {
        resolve: async () => ({ kind: 'article', isReadable: true, isCommentable: false, ownerAccountId: 'owner' }),
      } as never,
    );
    await expect(query.execute('article-1')).resolves.toEqual([]);
    expect(findHiddenByResourceId).toHaveBeenCalledWith('article-1');
  });
});
