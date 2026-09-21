import { describe, expect, it, vi } from 'vitest';
import { GetProfileByUsernameQuery } from '@/modules/account/application/profile/use-cases/query/get-profile-by-username.query';

// ACC-RN-008..010 and ACC-RF-007.
// Profile is a public read model composed from owner public contracts; it does not own contribution facts.

describe('Public Profile normative composition', () => {
  it('composes only owner-approved public contributions through owner public ports', async () => {
    const accountId = 'account-1';
    const profile = { userId: accountId, username: 'reiden', displayName: 'Reiden', visibility: 'public' };
    const profileRepository = { findByUsername: vi.fn(async () => profile) };
    const articles = {
      listPublishedByAuthor: vi.fn(async () => [
        { id: 'article-1', type: 'article', title: 'Article', slug: 'article', occurredAt: '2026-08-10T00:00:00.000Z' },
      ]),
    };
    const projects = {
      listPublishedByAuthor: vi.fn(async () => [
        { id: 'project-1', type: 'project', title: 'Project', slug: 'project', occurredAt: '2026-08-09T00:00:00.000Z' },
      ]),
    };
    const qAndA = {
      listPublicByAuthor: vi.fn(async () => [
        {
          id: 'question-1',
          type: 'question',
          title: 'Question',
          parentId: null,
          occurredAt: '2026-08-08T00:00:00.000Z',
        },
      ]),
    };
    const resources = {
      listPublishedBySubmitter: vi.fn(async () => [
        { id: 'resource-1', type: 'resource', title: 'Resource', occurredAt: '2026-08-07T00:00:00.000Z' },
      ]),
    };
    const organizations = { listPublicMembershipsByAccount: vi.fn(async () => []) };

    const query = new GetProfileByUsernameQuery(
      profileRepository as never,
      articles as never,
      projects as never,
      qAndA as never,
      resources as never,
      organizations as never,
    );
    const result = await query.execute('reiden');

    expect(profileRepository.findByUsername).toHaveBeenCalledWith('reiden', { visibility: 'public' });
    for (const owner of [articles, projects, qAndA, resources]) {
      const fn = Object.values(owner)[0] as ReturnType<typeof vi.fn>;
      expect(fn).toHaveBeenCalledWith(accountId, 20);
    }
    expect(result.contributions.map((item) => item.id)).toEqual(['article-1', 'project-1', 'question-1', 'resource-1']);
  });

  it('does not expose a non-public or missing Profile', async () => {
    const query = new GetProfileByUsernameQuery(
      { findByUsername: vi.fn(async () => null) } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
    await expect(query.execute('hidden-user')).rejects.toThrow('PROFILE_NOT_FOUND');
  });
});
