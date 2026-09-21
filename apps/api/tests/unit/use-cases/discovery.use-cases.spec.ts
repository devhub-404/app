import { describe, expect, it } from 'vitest';
import { GetFeedQuery } from '@/modules/discovery/application/use-cases/get-feed.query';
import { GetRelatedContentQuery } from '@/modules/discovery/application/use-cases/get-related-content.query';
import { ListTrendingContentQuery } from '@/modules/discovery/application/use-cases/list-trending-content.query';
import { ListPopularContentQuery } from '@/modules/discovery/application/use-cases/list-popular-content.query';
import { ListRecentContentQuery } from '@/modules/discovery/application/use-cases/list-recent-content.query';
import { SearchExploreQuery } from '@/modules/discovery/application/use-cases/search-explore.query';

describe('DISC-BE-UC-001..006 — Discovery use-case specification', () => {
  const page = { items: [], page: 1, pageSize: 20, total: 0 };

  it('keeps Search on relevance, Feed on recency, and Trending on the trending projection', async () => {
    const calls: Array<{ mode: 'relevance' | 'trending' | 'recent' | undefined }> = [];
    const reader = {
      list: async (_input: unknown, mode?: 'relevance' | 'trending' | 'recent') => {
        calls.push({ mode });

        return page;
      },
    };

    await new SearchExploreQuery(reader as never).execute({ search: 'postgres' });
    await new GetFeedQuery({
      feed: async (_input: unknown) => {
        calls.push({ mode: 'recent' });

        return page;
      },
    } as never).execute({ types: 'article' });
    await new ListRecentContentQuery(reader as never).execute({});
    await new ListPopularContentQuery(reader as never).execute({});
    await new ListTrendingContentQuery(reader as never).execute({});

    expect(calls).toEqual([
      { mode: undefined },
      { mode: 'recent' },
      { mode: 'recent' },
      { mode: 'popular' },
      { mode: 'trending' },
    ]);
  });

  it('derives Related from one explicit target and an optional bounded limit', async () => {
    const calls: Array<{ type: string; id: string; limit: number | undefined }> = [];
    const reader = {
      related: async (id: string, limit?: number) => {
        calls.push({ type: 'resource', id, limit });

        return page;
      },
    };

    await expect(
      new GetRelatedContentQuery(reader as never).execute({ resourceId: 'article-1', limit: 6 }),
    ).resolves.toEqual(page);
    expect(calls).toEqual([{ type: 'resource', id: 'article-1', limit: 6 }]);
  });

  it('passes each discovery input unchanged to its corresponding read projection', async () => {
    const inputs = {
      search: 'postgres',
      types: 'article,resource',
      tags: 'database',
      page: 2,
      pageSize: 10,
    };
    const result = { items: [{ id: 'article-1' }], page: 2, pageSize: 10, total: 1 } as never;
    const list = async (input: unknown, mode?: string) => {
      expect(input).toBe(inputs);
      expect(mode).toBe('recent');

      return result;
    };

    const feed = async (input: unknown, accountId?: string | null) => {
      expect(input).toBe(inputs);
      expect(accountId).toBeUndefined();

      return result;
    };
    await expect(new GetFeedQuery({ feed } as never).execute(inputs)).resolves.toBe(result);
    await expect(new ListRecentContentQuery({ list } as never).execute(inputs)).resolves.toBe(result);
  });

  it('passes the default Related limit as undefined instead of inventing a value', async () => {
    const related = async (id: string, limit?: number) => {
      expect({ id, limit }).toEqual({ id: 'resource-1', limit: undefined });

      return page;
    };

    await expect(new GetRelatedContentQuery({ related } as never).execute({ resourceId: 'resource-1' })).resolves.toBe(
      page,
    );
  });
});
