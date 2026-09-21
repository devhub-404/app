import { describe, expect, it } from 'vitest';
import { TagFollow } from '@/modules/follow/domain';

describe('Follow domain', () => {
  it('FOL-RN-001 models exactly accountId + tagId and preserves explicit creation time', () => {
    const at = new Date('2026-01-01T00:00:00.000Z');
    const follow = TagFollow.create('account-1', 'tag-1', at);
    expect(follow.value).toEqual({ accountId: 'account-1', tagId: 'tag-1', createdAt: at.toISOString() });
  });
});
