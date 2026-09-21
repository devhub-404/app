import { describe, expect, it, vi } from 'vitest';
import { FollowTagCommand } from '@/modules/follow/application/use-cases/follow-tag.command';
import { UnfollowTagCommand } from '@/modules/follow/application/use-cases/unfollow-tag.command';
import { ListFollowedTagsQuery } from '@/modules/follow/application/use-cases/list-followed-tags.query';

describe('Follow use cases', () => {
  it('FOL-RF-001 — resolves canonical/alias slug through Taxonomy and creates one TagFollow for an active Tag', async () => {
    const getTagBySlug = vi.fn(async () => ({ id: 'tag-1', slug: 'typescript', status: 'active' }));
    const isFollowing = vi.fn(async () => false);
    const follow = vi.fn(async () => undefined);
    const command = new FollowTagCommand({ getTagBySlug } as never, { isFollowing, follow } as never);

    await command.execute('account-1', 'ts');

    expect(getTagBySlug).toHaveBeenCalledWith('ts');
    expect(isFollowing).toHaveBeenCalledWith('account-1', 'tag-1');
    expect(follow).toHaveBeenCalledTimes(1);
    expect(follow.mock.calls[0]?.[0].value).toMatchObject({ accountId: 'account-1', tagId: 'tag-1' });
  });

  it('FOL-RF-001/FOL-RN-002 — follow is idempotent and refuses unresolved/inactive Tags', async () => {
    const follow = vi.fn(async () => undefined);
    const active = { id: 'tag-1', slug: 'typescript', status: 'active' };
    await new FollowTagCommand(
      { getTagBySlug: vi.fn(async () => active) } as never,
      { isFollowing: vi.fn(async () => true), follow } as never,
    ).execute('account-1', 'typescript');
    expect(follow).not.toHaveBeenCalled();

    await expect(
      new FollowTagCommand(
        { getTagBySlug: vi.fn(async () => ({ ...active, status: 'archived' })) } as never,
        { isFollowing: vi.fn(async () => false), follow } as never,
      ).execute('account-1', 'typescript'),
    ).rejects.toMatchObject({ code: 'TAG_NOT_FOUND' });
  });

  it('FOL-RF-002/FOL-RN-003 — unfollow resolves the Tag and is idempotent when the slug no longer resolves', async () => {
    const unfollow = vi.fn(async () => undefined);
    const command = new UnfollowTagCommand(
      { getTagBySlug: vi.fn(async () => ({ id: 'tag-1', slug: 'typescript', status: 'active' })) } as never,
      { unfollow } as never,
    );
    await command.execute('account-1', 'typescript');
    expect(unfollow).toHaveBeenCalledWith('account-1', 'tag-1');

    unfollow.mockClear();
    await new UnfollowTagCommand({ getTagBySlug: vi.fn(async () => null) } as never, { unfollow } as never).execute(
      'account-1',
      'missing',
    );
    expect(unfollow).not.toHaveBeenCalled();
  });

  it('FOL-RF-003 — lists followed Tags scoped to the authenticated Account', async () => {
    const listByAccount = vi.fn(async () => [{ tagId: 'tag-1', slug: 'typescript' }]);
    await expect(new ListFollowedTagsQuery({ listByAccount } as never).execute('account-1')).resolves.toEqual([
      { tagId: 'tag-1', slug: 'typescript' },
    ]);
    expect(listByAccount).toHaveBeenCalledWith('account-1');
  });
});
