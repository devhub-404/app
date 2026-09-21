import { describe, expect, it, vi } from 'vitest';
import { SaveBookmarkCommand } from '@/modules/bookmark/application/use-cases/command/save-bookmark.command';
import { RemoveBookmarkCommand } from '@/modules/bookmark/application/use-cases/command/remove-bookmark.command';
import { ListMyBookmarksQuery } from '@/modules/bookmark/application/use-cases/query/list-my-bookmarks.query';
import { SyncMyBookmarksQuery } from '@/modules/bookmark/application/use-cases/query/sync-my-bookmarks.query';
import type { BookmarkRecord } from '@/modules/bookmark/application/bookmarks/bookmark.types';

function record(resourceId: string): BookmarkRecord {
  return {
    accountId: 'account-1',
    resourceId,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('Bookmark application use cases', () => {
  it('rejects a resource that is not bookmarkable', async () => {
    const bookmarks = { set: vi.fn() };
    const command = new SaveBookmarkCommand(bookmarks as never, { isBookmarkable: vi.fn(async () => false) } as never);
    await expect(command.execute('account-1', 'article-1')).rejects.toMatchObject({
      code: 'BOOKMARK_TARGET_NOT_FOUND',
    });
    expect(bookmarks.set).not.toHaveBeenCalled();
  });

  it('lists authenticated Account bookmark facts', async () => {
    const rows = [record('article-1')];
    const list = vi.fn(async () => rows);
    await expect(new ListMyBookmarksQuery({ list } as never).execute('account-1')).resolves.toEqual(rows);
    expect(list).toHaveBeenCalledWith('account-1');
  });

  it('removes a resource idempotently through active=false', async () => {
    const set = vi.fn(async (_accountId, resourceId, active) => ({ ...record(resourceId), active }));
    const result = await new RemoveBookmarkCommand({ set } as never).execute('account-1', 'article-1');
    expect(result.active).toBe(false);
    expect(set).toHaveBeenCalledWith('account-1', 'article-1', false);
  });

  it('saves a bookmarkable resource', async () => {
    const set = vi.fn(async (_accountId, resourceId, active) => ({ ...record(resourceId), active }));
    const result = await new SaveBookmarkCommand(
      { set } as never,
      { isBookmarkable: async () => true } as never,
    ).execute('account-1', 'article-1');
    expect(result.active).toBe(true);
    expect(set).toHaveBeenCalledWith('account-1', 'article-1', true);
  });

  it('synchronizes removals as active=false', async () => {
    const removed = { ...record('article-1'), active: false, updatedAt: '2026-08-13T12:00:00.000Z' };
    const sync = vi.fn(async (_accountId: string, through: string, after?: string) => {
      expect(Date.parse(through)).not.toBeNaN();
      expect(after).toBe('2026-08-12T00:00:00.000Z');

      return [removed];
    });
    const result = await new SyncMyBookmarksQuery({ sync } as never).execute('account-1', '2026-08-12T00:00:00.000Z');
    expect(result.items).toEqual([removed]);
  });
});
