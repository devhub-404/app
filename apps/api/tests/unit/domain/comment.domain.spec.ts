import { describe, expect, it } from 'vitest';
import { Comment, CommentTargetPolicy } from '@/modules/comment/domain';
import { DomainError } from '@/shared/errors/domain-error';

function comment(overrides: Partial<Parameters<typeof Comment.create>[1]> = {}) {
  return Comment.create('comment-1', {
    resourceId: 'article-1',
    authorAccountId: 'user-1',
    parentId: null,
    content: 'Comment',
    ...overrides,
  });
}

describe('Comment domain', () => {
  it('creates a comment anchored to immutable Resource identity', () => {
    const value = comment({ parentId: 'parent-1' });
    expect(value.resourceId).toBe('article-1');
    expect(value.authorAccountId).toBe('user-1');
    expect(value.parentId).toBe('parent-1');
  });
  it('supports visibility and content edits independently', () => {
    const value = comment();
    value.hide();
    expect(value.hiddenAt).toEqual(expect.any(String));
    value.update({ content: 'Updated' });
    expect(value.content).toBe('Updated');
    value.unhide();
    expect(value.hiddenAt).toBeNull();
  });

  it.each([
    ['article', true],
    ['news', true],
    ['external_resource', false],
    ['project', false],
    ['event', false],
    ['job', false],
    ['question', false],
    ['answer', false],
  ] as const)('CMT-RN-002: capability for %s is %s', (kind, supported) => {
    expect(CommentTargetPolicy.supports(kind)).toBe(supported);
  });

  it('rejects invalid content', () => {
    expect(() => comment({ content: '' })).toThrowError(new DomainError('CONTENT_COMMENT_INVALID_CONTENT'));
  });
  it('CMT-RN-006 — rehydrates an active anonymized comment after Account purge', () => {
    const value = Comment.rehydrate({
      id: 'comment-1',
      resourceId: 'article-1',
      authorAccountId: null,
      parentId: null,
      content: 'Preserved',
      createdAt: '2026-08-29T00:00:00.000Z',
      updatedAt: '2026-08-29T00:00:00.000Z',
    });
    expect(value.isDeleted).toBe(false);
    expect(value.authorAccountId).toBeNull();
    expect(value.content).toBe('Preserved');
  });
  it('deletes into a structural tombstone', () => {
    const value = comment();
    value.delete();
    expect(value.isDeleted).toBe(true);
    expect(value.authorAccountId).toBeNull();
    expect(value.content).toBeNull();
  });
});
