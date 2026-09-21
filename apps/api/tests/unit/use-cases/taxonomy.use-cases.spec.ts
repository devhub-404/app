import { describe, expect, it, vi } from 'vitest';
import { ResolveTagQuery } from '@/modules/taxonomy/application/tag/use-cases/query/resolve-tag.query';
import { CreateTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/create-tag.command';
import { UpdateTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/update-tag.command';
import { DeleteTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag.command';
import { CreateTagAliasCommand } from '@/modules/taxonomy/application/tag/use-cases/command/create-tag-alias.command';
import { DeleteTagAliasCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag-alias.command';
import { MergeTagsCommand } from '@/modules/taxonomy/application/tag/use-cases/command/merge-tags.command';
import { SetTagIdentityTermCommand } from '@/modules/taxonomy/application/tag/use-cases/command/set-tag-identity-term.command';
import { DeleteTagIdentityTermCommand } from '@/modules/taxonomy/application/tag/use-cases/command/delete-tag-identity-term.command';
import { ArchiveTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/archive-tag.command';
import { UnarchiveTagCommand } from '@/modules/taxonomy/application/tag/use-cases/command/unarchive-tag.command';
import { Tag } from '@/modules/taxonomy/domain/tag';
import { TaxonomyPublicService } from '@/modules/taxonomy/public/taxonomy-public.service';
import { ListTagAliasesQuery } from '@/modules/taxonomy/application/tag/use-cases/query/list-tag-aliases.query';
import { ListTagIdentityTermsQuery } from '@/modules/taxonomy/application/tag/use-cases/query/list-tag-identity-terms.query';
import { SearchTagsQuery } from '@/modules/taxonomy/application/tag/use-cases/query/search-tags.query';
import { ReplaceTargetTagsCommand } from '@/modules/taxonomy/application/tag/use-cases/command/replace-target-tags.command';
import { RemoveResourceTagsCommand } from '@/modules/taxonomy/application/tag/use-cases/command/remove-resource-tags.command';

describe('Taxonomy canonical identity authority', () => {
  it('transitions a Tag only between ACTIVE and ARCHIVED', async () => {
    let current = Tag.create('tag-archive', { name: 'TypeScript', slug: 'typescript' });
    const repository = {
      findById: async () => current,
      save: async (tag: Tag) => {
        current = tag;
      },
    };
    await new ArchiveTagCommand(repository as never).execute(current.id);
    expect(current.status).toBe('archived');
    await new UnarchiveTagCommand(repository as never).execute(current.id);
    expect(current.status).toBe('active');
  });
  it('TAX-RN-009 — allows destructive identity operations when no owner blocks them', async () => {
    const tag = Tag.create('tag-codex', { name: 'Causal inference', slug: 'causal-inference' });
    const repository = {
      findById: async () => tag,
      save: async () => undefined,
      delete: async () => undefined,
    };
    await expect(new ArchiveTagCommand(repository as never).execute(tag.id)).resolves.toBeUndefined();
    await expect(new DeleteTagCommand(repository as never).execute(tag.id)).resolves.toBeUndefined();
  });
  it('creates, updates and removes one canonical Tag identity through the authority surface', async () => {
    let current: Tag | null = null;
    const deleted: string[] = [];
    const repository = {
      findById: async (id: string) => (current?.id === id ? current : null),
      create: async (props: { name: string; slug: string }) => {
        current = Tag.create('tag-1', props);
      },
      save: async (tag: Tag) => {
        current = tag;
      },
      delete: async (id: string) => {
        deleted.push(id);
        if (current?.id === id) current = null;
      },
    };
    const queries = {
      existsBySlug: async (slug: string) => current?.slug === slug,
      findBySlug: async (slug: string) =>
        current?.slug === slug
          ? {
              id: current.id,
              name: current.name,
              slug: current.slug,
              status: current.status,
            }
          : null,
    };
    const identities = {
      findIdentityTerm: async () => null,
      findAliasByValue: async () => null,
      findIdentityTermByValue: async () => null,
      createAlias: async () => undefined,
    };

    const created = await new CreateTagCommand(queries as never, repository as never, identities as never).execute({
      name: 'TypeScript',
      slug: 'typescript',
    });
    expect(created).toMatchObject({ id: 'tag-1', name: 'TypeScript', slug: 'typescript' });

    await new UpdateTagCommand(
      repository as never,
      {
        findBySlug: queries.findBySlug,
        findById: async () => ({ id: 'tag-1', name: 'TypeScript Language', slug: 'typescript', status: 'active' }),
      } as never,
      identities as never,
    ).execute('tag-1', {
      name: 'TypeScript Language',
    });
    expect(current).toMatchObject({ id: 'tag-1', name: 'TypeScript Language', slug: 'typescript' });

    await new DeleteTagCommand(repository as never).execute('tag-1');
    expect(current).toBeNull();
    expect(deleted).toEqual(['tag-1']);
  });

  it('creates an alias that resolves to its canonical identity and removing it removes that alternate identity', async () => {
    const canonical = Tag.create('tag-1', { name: 'TypeScript', slug: 'typescript' });
    let alias: { id: string; tagId: string; alias: string; createdAt: string } | null = null;
    const tags = { findById: async (id: string) => (id === canonical.id ? canonical : null) };
    const queries = {
      existsBySlug: async () => false,
      findBySlug: async () => null,
      findByName: async () => null,
      findById: async (id: string) =>
        id === canonical.id
          ? {
              id: canonical.id,
              name: canonical.name,
              slug: canonical.slug,
              status: canonical.status,
            }
          : null,
    };
    const identities = {
      findAliasByValue: async (value: string) => (alias?.alias === value ? alias : null),
      findCanonicalTagIdByAlias: async (value: string) => (alias?.alias === value ? alias.tagId : null),
      findIdentityTerm: async () => null,
      createAlias: async (tagId: string, value: string) => {
        alias = { id: 'alias-1', tagId, alias: value, createdAt: '2026-08-18T00:00:00.000Z' };

        return alias;
      },
      deleteAlias: async (id: string) => {
        if (alias?.id === id) alias = null;
      },
    };
    const workflow = { resolveMergedTag: async () => null };

    await new CreateTagAliasCommand(tags as never, queries as never, identities as never).execute({
      tagId: 'tag-1',
      alias: 'ts',
    });
    await expect(
      new ResolveTagQuery(queries as never, workflow as never, identities as never).execute('ts'),
    ).resolves.toMatchObject({ id: 'tag-1', slug: 'typescript' });

    await new DeleteTagAliasCommand(identities as never).execute('alias-1');
    await expect(
      new ResolveTagQuery(queries as never, workflow as never, identities as never).execute('ts'),
    ).resolves.toBeNull();
  });

  it('merges one canonical identity into another so resolution converges on the target identity', async () => {
    const source = { id: 'tag-source', name: 'Postgres', slug: 'postgres', status: 'active' };
    const target = { id: 'tag-target', name: 'PostgreSQL', slug: 'postgresql', status: 'active' };
    let merge: { sourceTagId: string; targetTagId: string; mergedById: string } | null = null;
    const workflow = {
      createMerge: async (input: typeof merge) => {
        merge = input;
      },
      resolveMergedTag: async (sourceTagId: string) => (merge?.sourceTagId === sourceTagId ? merge.targetTagId : null),
    };
    const queries = {
      findBySlug: async (slug: string) => (slug === source.slug ? source : slug === target.slug ? target : null),
      findByName: async () => null,
      findById: async (id: string) => (id === target.id ? target : id === source.id ? source : null),
    };
    const identities = { findCanonicalTagIdByAlias: async () => null };

    await new MergeTagsCommand(workflow).execute('admin-1', {
      sourceTagId: source.id,
      targetTagId: target.id,
    });

    await expect(
      new ResolveTagQuery(queries as never, workflow as never, identities as never).execute('postgres'),
    ).resolves.toEqual(target);
    expect(merge).toEqual({ sourceTagId: source.id, targetTagId: target.id, mergedById: 'admin-1' });
  });

  it('makes a blocked identity term prevent canonical creation until the authority removes that block', async () => {
    let term: {
      id: string;
      value: string;
      kind: 'blocked';
      createdAt: string;
      updatedAt: string;
    } | null = null;
    let created = 0;
    const identities = {
      findIdentityTerm: async (value: string) => (term?.value === value ? term : null),
      findAliasByValue: async () => null,
      setIdentityTerm: async (value: string, kind: 'blocked') => {
        term = {
          id: 'term-1',
          value,
          kind,
          createdAt: '2026-08-18T00:00:00.000Z',
          updatedAt: '2026-08-18T00:00:00.000Z',
        };

        return term;
      },
      deleteIdentityTerm: async (id: string) => {
        if (term?.id === id) term = null;
      },
    };
    const queries = { findBySlug: async () => null, existsBySlug: async () => false };
    const repository = {
      create: async () => {
        created += 1;
      },
    };

    await new SetTagIdentityTermCommand(queries as never, identities as never).execute({
      value: 'spam-tag',
      kind: 'blocked',
    });
    await expect(
      new CreateTagCommand(queries as never, repository as never, identities as never).execute({
        name: 'Spam Tag',
        slug: 'spam-tag',
      }),
    ).rejects.toMatchObject({ code: 'TAG_IDENTITY_BLOCKED' });
    expect(created).toBe(0);

    await new DeleteTagIdentityTermCommand(identities as never).execute('term-1');
    // Once the administrative block is gone, the same identity no longer fails at the block gate.
    await expect(
      new CreateTagCommand(
        { ...queries, findBySlug: async () => ({ id: 'tag-1' }) } as never,
        repository as never,
        identities as never,
      ).execute({ name: 'Spam Tag', slug: 'spam-tag' }),
    ).resolves.toEqual({ id: 'tag-1' });
    expect(created).toBe(1);
  });

  it('TAX-BE-UC-006/007/010 — administrative identity reads and public search preserve their filters', async () => {
    const listAliases = vi.fn(async () => [{ id: 'alias-1', tagId: 'tag-1', alias: 'ts' }]);
    const listIdentityTerms = vi.fn(async () => [{ id: 'term-1', value: 'spam', kind: 'blocked' }]);
    const search = vi.fn(async () => [{ id: 'tag-1', name: 'TypeScript', slug: 'typescript', status: 'active' }]);

    await expect(new ListTagAliasesQuery({ listAliases } as never).execute('tag-1')).resolves.toHaveLength(1);
    await expect(
      new ListTagIdentityTermsQuery({ listIdentityTerms } as never).execute('blocked'),
    ).resolves.toHaveLength(1);
    await expect(
      new SearchTagsQuery({ search } as never).execute({ search: 'type', pageSize: 8 }),
    ).resolves.toHaveLength(1);

    expect(listAliases).toHaveBeenCalledWith('tag-1');
    expect(listIdentityTerms).toHaveBeenCalledWith('blocked');
    expect(search).toHaveBeenCalledWith({ search: 'type', pageSize: 8 });
  });

  it('TAX-BE-UC-015 — replacing target tags validates canonical slugs before writing the classification', async () => {
    const classification = [{ id: 'tag-1', slug: 'typescript' }];
    const validateTags = vi.fn(async () => classification);
    const setResourceClassification = vi.fn(async () => undefined);
    const context = { tx: 'transaction' };
    const command = new ReplaceTargetTagsCommand({ validateTags, setResourceClassification } as never);

    await command.execute('article-1', ['typescript'], 'account-1', context);

    expect(validateTags).toHaveBeenCalledWith(['typescript'], 'account-1');
    expect(setResourceClassification).toHaveBeenCalledWith('article-1', classification, context);
  });

  it('TAX-BE-UC-016 — removing tags removes only that Resource classification', async () => {
    const removeResourceClassification = vi.fn(async () => undefined);
    await new RemoveResourceTagsCommand({ removeResourceClassification } as never).execute('article-1');
    expect(removeResourceClassification).toHaveBeenCalledWith('article-1');
  });

  it('rejects unknown community slugs instead of creating an implicit pending Tag', async () => {
    const service = new TaxonomyPublicService(
      {
        findBySlug: async () => null,
        findById: async () => null,
      } as never,
      {} as never,
      {
        findCanonicalTagIdByAlias: async () => null,
        findIdentityTerm: async () => null,
      } as never,
    );

    await expect(service.validateTags(['totally-new-tag'], 'account-1')).rejects.toMatchObject({
      code: 'TAG_NOT_FOUND',
    });
  });
});
