import { describe, expect, it, vi } from 'vitest';
import { SuggestExternalResourceCommand } from '@/modules/external-resource/application/use-cases/command/suggest-external-resource.command';
import { ApproveExternalResourceSuggestionCommand } from '@/modules/external-resource/application/use-cases/command/approve-external-resource-suggestion.command';
import { CreateResourceCommand } from '@/modules/external-resource/application/use-cases/command/create-resource.command';
import { ExternalResourceSuggestion } from '@/modules/external-resource/domain/external-resource-suggestion';
import { ExternalResourceStatus } from '@/modules/external-resource/domain/external-resource';
import { ExternalResourcePolicy } from '@/modules/external-resource/application/resource.policy';
import { ListMyExternalResourceSuggestionsQuery } from '@/modules/external-resource/application/use-cases/query/list-my-external-resource-suggestions.query';
import { Role } from '@/shared/kernel/auth/role';

describe('ExternalResource use cases', () => {
  it('keeps moderation/editorial authority separate from community suggestion', () => {
    const policy = new ExternalResourcePolicy();
    const curator = { sub: 'curator-1', role: Role.CURATOR };
    const moderator = { sub: 'moderator-1', role: Role.MODERATOR };
    const administrator = { sub: 'administrator-1', role: Role.ADMIN };
    expect(() => policy.canCreate(curator)).not.toThrow();
    expect(() => policy.canUpdate(curator)).not.toThrow();
    expect(() => policy.canReview(curator)).not.toThrow();
    expect(() => policy.canCreate(moderator)).toThrow('FORBIDDEN');
    expect(() => policy.canUpdate(moderator)).toThrow('FORBIDDEN');
    expect(() => policy.canReview(moderator)).toThrow('FORBIDDEN');
    expect(() => policy.canCreate(administrator)).not.toThrow();
    expect(() => policy.canUpdate(administrator)).not.toThrow();
    expect(() => policy.canReview(administrator)).not.toThrow();
  });

  it('stores a canonical URL proposal without creating a Resource', async () => {
    const captured: ExternalResourceSuggestion[] = [];
    const repository = {
      create: vi.fn(async (suggestion: ExternalResourceSuggestion) => {
        captured.push(suggestion);

        return 'suggestion-1';
      }),
    };
    const command = new SuggestExternalResourceCommand(repository as never, {
      assertAccountCapability: async () => undefined,
    });

    const result = await command.execute('account-1', { url: 'https://example.com/docs/#section' });
    expect(result).toMatchObject({
      id: 'suggestion-1',
      acceptedExternalResourceId: null,
      submittedByAccountId: 'account-1',
      status: 'pending',
      url: 'https://example.com/docs',
    });
    expect(captured[0]?.url).toBe('https://example.com/docs');
  });

  it('maps suggestion entities to flat response DTOs', async () => {
    const suggestion = ExternalResourceSuggestion.create('suggestion-1', {
      submittedByAccountId: 'account-1',
      url: 'https://example.com/docs',
    });
    const query = new ListMyExternalResourceSuggestionsQuery({
      listBySubmitter: vi.fn(async () => ({ items: [suggestion], page: 1, pageSize: 20, total: 1 })),
    } as never);

    await expect(query.execute('account-1', { page: 1, pageSize: 20 })).resolves.toEqual({
      items: [
        expect.objectContaining({
          id: 'suggestion-1',
          submittedByAccountId: 'account-1',
          url: 'https://example.com/docs',
          status: 'pending',
        }),
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    });
  });

  it('accepts a suggestion and creates ResourceIdentity + ExternalResource atomically', async () => {
    const context = { transaction: true };
    const suggestion = ExternalResourceSuggestion.create('suggestion-1', {
      submittedByAccountId: 'account-1',
      url: 'https://example.com/docs',
    });
    const suggestions = {
      findById: vi.fn(async () => suggestion),
      save: vi.fn(async () => true),
    };
    const resources = {
      transaction: vi.fn(async (work: (context: unknown) => Promise<unknown>) => work(context)),
      create: vi.fn(async (resource: { id: string }) => resource.id),
    };
    const taxonomy = {
      validateTags: vi.fn(async () => ({ tagSlugs: ['typescript'] })),
    };
    const identities = { create: vi.fn(async () => ({ id: 'resource-1', kind: 'external_resource' })) };

    await new ApproveExternalResourceSuggestionCommand(
      suggestions as never,
      resources as never,
      new ExternalResourcePolicy(),
      taxonomy as never,
      identities as never,
    ).execute({ sub: 'curator-1', role: Role.CURATOR }, 'suggestion-1', {
      title: 'Documentation',
      description: 'Useful documentation',
      tagSlugs: ['typescript'],
    });

    expect(identities.create).toHaveBeenCalledWith('external_resource', context);
    expect(resources.create).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'resource-1' }),
      { tagSlugs: ['typescript'] },
      context,
    );
    expect(suggestions.save).toHaveBeenCalledWith(suggestion, 'pending', context);
    expect(suggestion.status).toBe('accepted');
    expect(suggestion.acceptedExternalResourceId).toBe('resource-1');
  });

  it('creates an editorial ExternalResource as active with one global identity', async () => {
    const context = { transaction: true };
    const repository = {
      transaction: vi.fn(async (work: (context: unknown) => Promise<string>) => work(context)),
      create: vi.fn(async (entity: { id: string; status: ExternalResourceStatus }) => {
        expect(entity.status).toBe(ExternalResourceStatus.Active);

        return entity.id;
      }),
    };
    const query = { findById: vi.fn(async (id: string) => ({ id, status: ExternalResourceStatus.Active })) };
    const taxonomy = { validateTags: vi.fn(async () => ({ tagSlugs: ['typescript'] })) };
    const identities = { create: vi.fn(async () => ({ id: 'resource-1', kind: 'external_resource' })) };

    await expect(
      new CreateResourceCommand(
        repository as never,
        query as never,
        taxonomy as never,
        new ExternalResourcePolicy(),
        identities as never,
      ).execute(
        { sub: 'curator-1', role: Role.CURATOR },
        {
          title: 'Resource',
          description: 'Description',
          url: 'https://example.com/resource',
          tagSlugs: ['typescript'],
        },
      ),
    ).resolves.toMatchObject({ id: 'resource-1', status: ExternalResourceStatus.Active });

    expect(identities.create).toHaveBeenCalledWith('external_resource', context);
  });
});
