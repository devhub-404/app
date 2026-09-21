import { describe, expect, it } from 'vitest';
import { ListCommentsQuery } from '@/modules/comment/application/use-cases/query/list-comments.query';
import type { CommentDTO } from '@/modules/comment/application/comments/dtos/out';

const comment = (
  id: string,
  parentId: string | null,
  createdAt: string,
  overrides: Partial<CommentDTO> = {},
): CommentDTO => ({
  id,
  resourceId: 'content-1',
  parentId,
  content: id,
  createdAt,
  editedAt: null,
  hiddenAt: null,
  deletedAt: null,
  author: { username: id, displayName: id, avatarUrl: '' },
  ...overrides,
});

function subject(items: CommentDTO[]) {
  return new ListCommentsQuery(
    { findByResourceId: async () => items } as never,
    { resolve: async () => ({ isReadable: true, isCommentable: true, kind: 'article' }) } as never,
  );
}

describe('Comments query contract', () => {
  it('returns the public comments as a parent-child tree', async () => {
    const query = subject([
      comment('child', 'root', '2026-01-01T00:00:02.000Z'),
      comment('root', null, '2026-01-01T00:00:01.000Z'),
      comment('grandchild', 'child', '2026-01-01T00:00:03.000Z'),
    ]);

    await expect(query.execute('content-1')).resolves.toEqual([
      {
        ...comment('root', null, '2026-01-01T00:00:01.000Z'),
        children: [
          {
            ...comment('child', 'root', '2026-01-01T00:00:02.000Z'),
            children: [{ ...comment('grandchild', 'child', '2026-01-01T00:00:03.000Z'), children: [] }],
          },
        ],
      },
    ]);
  });

  // CMT-RN-004: deletion keeps the structural node, but strips content and identifiable authorship.
  it('keeps a deleted parent as an anonymized tombstone so its visible replies retain the thread', async () => {
    const tombstone = comment('root', null, '2026-01-01T00:00:01.000Z', {
      author: null,
      content: null,
      deletedAt: '2026-01-02T00:00:00.000Z',
    });
    const child = comment('child', 'root', '2026-01-01T00:00:02.000Z');

    await expect(subject([tombstone, child]).execute('content-1')).resolves.toEqual([
      { ...tombstone, children: [{ ...child, children: [] }] },
    ]);
  });

  // A hidden parent itself is not public, but hiding it does not implicitly hide its replies.
  it('promotes a visible reply to a presentation root when its hidden parent is absent from the public result', async () => {
    const child = comment('child', 'hidden-parent', '2026-01-01T00:00:02.000Z');

    await expect(subject([child]).execute('content-1')).resolves.toEqual([{ ...child, children: [] }]);
  });
});
