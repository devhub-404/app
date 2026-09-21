import { describe, expect, it, vi } from 'vitest';
import { SetVoteCommand } from '@/modules/vote/application/use-cases/command/set-vote.command';
import { RemoveVoteCommand } from '@/modules/vote/application/use-cases/command/remove-vote.command';
import { VoteStatisticsProjection } from '@/modules/vote/application/votes/vote-statistics.projection';

describe('Vote use cases', () => {
  it('sets a vote on a voteable Resource', async () => {
    const setVote = vi.fn(async () => undefined);
    const command = new SetVoteCommand({ setVote } as never, { isVoteable: async () => true } as never, {
      assertAccountCapability: async () => undefined,
    });
    await expect(command.execute('account-1', 'article-1')).resolves.toEqual({ resourceId: 'article-1', active: true });
    expect(setVote).toHaveBeenCalledWith('account-1', 'article-1');
  });

  it('removes a vote by Resource identity', async () => {
    const removeVote = vi.fn(async () => undefined);
    const result = await new RemoveVoteCommand({ removeVote } as never).execute('account-1', 'article-1');
    expect(result).toEqual({ resourceId: 'article-1', active: false });
  });

  it('statistics projection is keyed only by Resource identity', async () => {
    const getCounts = vi.fn(async () => ({ 'article-1': 7 }));
    const setCount = vi.fn(async () => undefined);
    const projection = new VoteStatisticsProjection({ getCounts, setCount });
    await expect(projection.getCounts(['article-1'])).resolves.toEqual({ 'article-1': 7 });
    await projection.setCount('article-1', 8);
    expect(getCounts).toHaveBeenCalledWith(['article-1']);
    expect(setCount).toHaveBeenCalledWith('article-1', 8);
  });

  it('removes an existing vote even when the target is no longer voteable', async () => {
    const removeVote = vi.fn(async () => undefined);
    await expect(new RemoveVoteCommand({ removeVote } as never).execute('account-1', 'job-1')).resolves.toEqual({
      resourceId: 'job-1',
      active: false,
    });
    expect(removeVote).toHaveBeenCalledWith('account-1', 'job-1');
  });
});
