import { describe, expect, it, vi } from 'vitest';
import { ArticleStatus } from '@/modules/article/domain/article';
import { SaveArticleDraftCommand } from '@/modules/article/application/use-cases/command/save-article-draft.command';
import { DeleteArticleCommand } from '@/modules/article/application/use-cases/command/delete-article.command';
import { UpdateArticleCommand } from '@/modules/article/application/use-cases/command/update-article.command';
import { ArchiveArticleCommand } from '@/modules/article/application/use-cases/command/archive-article.command';
import { UnarchiveArticleCommand } from '@/modules/article/application/use-cases/command/unarchive-article.command';
import { PublishArticleCommand } from '@/modules/article/application/use-cases/command/publish-article.command';
import { ArticlePolicy } from '@/modules/article/application/article.policy';
import { Role } from '@/shared/kernel/auth/role';
import { article } from '@test/content/domain/fixtures';
import { GetArticleByIdQuery } from '@/modules/article/application/use-cases/query/get-article-by-id.query';
import { GetArticleBySlugQuery } from '@/modules/article/application/use-cases/query/get-article-by-slug.query';
import { ListArticlesQuery } from '@/modules/article/application/use-cases/query/list-articles.query';
import { ListMyArticlesQuery } from '@/modules/article/application/use-cases/query/list-my-articles.query';
import { ListArticlesForModerationQuery } from '@/modules/article/application/use-cases/query/list-articles-for-moderation.query';
import { AppError } from '@/shared/errors/app-error';

const publishedAt = '2026-01-01T00:00:00.000Z';

describe('Article commands', () => {
  it('creates an author-owned draft and resolves declared tags', async () => {
    let persistedStatus: ArticleStatus | undefined;
    const command = new SaveArticleDraftCommand(
      {
        transaction: async (work: (context: unknown) => Promise<unknown>) => work({}),
        create: async (value: { status: ArticleStatus }) => {
          persistedStatus = value.status;

          return 'article-1';
        },
        slugExists: async () => false,
      } as never,
      { findById: async () => ({ id: 'article-1' }) } as never,
      { validateTags: async () => ({ tagSlugs: ['tag'] }) } as never,
      { confirmImageUpload: async () => null } as never,
      { assertAccountCapability: async () => undefined },
      { project: async (value: unknown) => value } as never,
      { create: async () => ({ id: 'resource-1' }) } as never,
    );

    await command.execute(
      { sub: 'author-1', role: null },
      { title: 'Article', description: 'Description', content: 'Content', tagSlugs: ['tag'] },
    );
    expect(persistedStatus).toBe(ArticleStatus.Draft);
  });

  it('does not create Article when CONTRIBUTION is restricted, but preserves existing Article editing', async () => {
    const deny = {
      assertAccountCapability: async () => {
        throw new AppError('ACCOUNT_CAPABILITY_DENIED', { capability: 'CONTRIBUTION' });
      },
    } as never;
    const create = vi.fn();
    const draft = new SaveArticleDraftCommand(
      { create, slugExists: async () => false } as never,
      {} as never,
      {} as never,
      {} as never,
      deny,
      {} as never,
      {} as never,
    );
    await expect(
      draft.execute({ sub: 'user-1', role: null }, { title: 'A', description: 'Description', content: 'C' } as never),
    ).rejects.toMatchObject({ code: 'ACCOUNT_CAPABILITY_DENIED', data: { capability: 'CONTRIBUTION' } });
    expect(create).not.toHaveBeenCalled();

    const entity = article();
    const save = vi.fn(async () => true);
    const update = new UpdateArticleCommand(
      { findById: async () => entity, save } as never,
      new ArticlePolicy(),
      { getResourceTagSlugs: async () => [] } as never,
      {} as never,
    );
    await expect(
      update.execute({ sub: 'user-1', role: null }, entity.id, { title: 'Changed' }),
    ).resolves.toBeUndefined();
    expect(entity.title).toBe('Changed');
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('persists owner archive without changing first-publication history', async () => {
    const entity = article({ publish: true, publishedAt: '2026-01-01T00:00:00.000Z' });
    let persisted: { status: ArticleStatus; publishedAt: string | null } | null = null;
    const repository = {
      findById: async () => entity,
      save: async (value: typeof entity) => {
        persisted = { status: value.status, publishedAt: value.publishedAt };

        return true;
      },
    };

    await new ArchiveArticleCommand(repository as never, new ArticlePolicy()).execute(
      { sub: 'user-1', role: null },
      entity.id,
    );

    expect(persisted).toEqual({
      status: ArticleStatus.Archived,
      publishedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('unarchives an archived Article through the application command', async () => {
    const firstPublishedAt = '2026-01-01T00:00:00.000Z';
    const entity = article({ publish: true, publishedAt: firstPublishedAt });
    entity.archive();
    const save = vi.fn(async () => true);
    const emitAsync = vi.fn(async () => []);

    await new UnarchiveArticleCommand({ findById: async () => entity, save } as never, new ArticlePolicy()).execute(
      { sub: 'user-1', role: null },
      entity.id,
    );

    expect(entity.status).toBe(ArticleStatus.Published);
    expect(entity.publishedAt).toBe(firstPublishedAt);
    expect(save).toHaveBeenCalledTimes(1);
    expect(emitAsync).not.toHaveBeenCalled();
  });

  it('does not emit publication when the lifecycle CAS loses a concurrent race', async () => {
    const entity = article();
    const emitAsync = vi.fn(async () => []);
    const command = new PublishArticleCommand(
      { findById: async () => entity, save: vi.fn(async () => false) } as never,
      new ArticlePolicy(),
      { getResourceTagSlugs: async () => ['typescript'] } as never,
      { emitAsync } as never,
    );

    await expect(
      command.execute({ sub: 'user-1', role: null }, entity.id, { publishedAt: '2026-08-18T00:00:00.000Z' }),
    ).rejects.toMatchObject({ code: 'ARTICLE_INVALID_STATUS' });
    expect(emitAsync).not.toHaveBeenCalled();
  });

  it('persists terminal author deletion through the author surface', async () => {
    const entity = article({ publish: true });
    let persisted: { status: ArticleStatus; deletedAt: string | null } | null = null;
    const repository = {
      findById: async () => entity,
      save: async (value: typeof entity) => {
        persisted = { status: value.status, deletedAt: value.deletedAt };

        return true;
      },
    };

    await new DeleteArticleCommand(repository as never, new ArticlePolicy()).execute(
      { sub: 'user-1', role: null },
      entity.id,
    );

    expect(persisted?.status).toBe(ArticleStatus.Published);
    expect(persisted?.deletedAt).not.toBeNull();
  });

  it('removes the previous cover only after replacement is persisted', async () => {
    const entity = article({ coverMediaId: 'media-old' });
    const calls: string[] = [];
    const command = new UpdateArticleCommand(
      {
        findById: async () => entity,
        save: async () => {
          calls.push('save');

          return true;
        },
      } as never,
      new ArticlePolicy(),
      { getResourceTagSlugs: async () => [] } as never,
      {
        confirmImageUpload: async () => ({ mediaId: 'media-new' }),
        deleteImage: async () => {
          calls.push('delete-old');

          return true;
        },
      } as never,
      { assertAccountCapability: async () => undefined },
    );
    await command.execute({ sub: 'user-1', role: null }, entity.id, { coverMediaId: 'media-new' });
    expect(calls).toEqual(['save', 'delete-old']);
  });

  it('does not persist any author mutation when actor is not the Article owner', async () => {
    const intruder = { sub: 'intruder', role: null };
    const draftForPublish = article();
    const publishSave = vi.fn(async () => undefined);
    await expect(
      new PublishArticleCommand(
        { findById: async () => draftForPublish, save: publishSave } as never,
        new ArticlePolicy(),
        { getResourceTagSlugs: async () => ['typescript'] } as never,
        { emitAsync: vi.fn(async () => []) } as never,
      ).execute(intruder, draftForPublish.id, { publishedAt: '2026-08-18T00:00:00.000Z' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(draftForPublish.status).toBe(ArticleStatus.Draft);
    expect(draftForPublish.publishedAt).toBeNull();
    expect(publishSave).not.toHaveBeenCalled();

    const publishedForArchive = article({ publish: true });
    const archiveSave = vi.fn(async () => undefined);
    await expect(
      new ArchiveArticleCommand(
        { findById: async () => publishedForArchive, save: archiveSave } as never,
        new ArticlePolicy(),
      ).execute(intruder, publishedForArchive.id),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(publishedForArchive.status).toBe(ArticleStatus.Published);
    expect(archiveSave).not.toHaveBeenCalled();

    const draftForUpdate = article();
    const originalTitle = draftForUpdate.title;
    const updateSave = vi.fn(async () => true);
    await expect(
      new UpdateArticleCommand(
        { findById: async () => draftForUpdate, save: updateSave } as never,
        new ArticlePolicy(),
        { getResourceTagSlugs: async () => [] } as never,
        { confirmImageUpload: async () => null, deleteImage: async () => true } as never,
        { assertAccountCapability: async () => undefined },
      ).execute(intruder, draftForUpdate.id, { title: 'Intruder title' }),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(draftForUpdate.title).toBe(originalTitle);
    expect(updateSave).not.toHaveBeenCalled();

    const publishedForDelete = article({ publish: true });
    const deleteSave = vi.fn(async () => undefined);
    await expect(
      new DeleteArticleCommand(
        { findById: async () => publishedForDelete, save: deleteSave } as never,
        new ArticlePolicy(),
      ).execute(intruder, publishedForDelete.id),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(publishedForDelete.deletedAt).toBeNull();
    expect(publishedForDelete.status).toBe(ArticleStatus.Published);
    expect(deleteSave).not.toHaveBeenCalled();
  });
});

describe('Article read use cases', () => {
  const detail = { id: 'article-1', slug: 'article', title: 'Article', status: 'published' } as never;
  const page = { items: [detail], total: 1, page: 1, pageSize: 20 } as never;

  it('ART-BE-UC-007/008 — id and slug reads delegate one direct lookup each', async () => {
    const findById = vi.fn(async () => detail);
    const findBySlug = vi.fn(async () => detail);
    const repository = { findById, findBySlug } as never;
    const projection = { project: vi.fn(async (value: unknown) => value) } as never;
    await expect(
      new GetArticleByIdQuery(repository, projection, new ArticlePolicy()).execute(
        'account-1',
        'article-1',
        Role.MODERATOR,
      ),
    ).resolves.toBe(detail);
    await expect(new GetArticleBySlugQuery(repository, projection).execute('ignored-account', 'article')).resolves.toBe(
      detail,
    );
    expect(findById).toHaveBeenCalledWith('article-1');
    expect(findBySlug).toHaveBeenCalledWith('article');
  });

  it('ART-BE-UC-007/008 — detail queries fail closed when the visibility-aware repository returns no Article', async () => {
    const repository = { findById: vi.fn(async () => null), findBySlug: vi.fn(async () => null) } as never;
    const projection = { project: vi.fn() } as never;
    await expect(
      new GetArticleByIdQuery(repository, projection, new ArticlePolicy()).execute('account-1', 'missing'),
    ).rejects.toMatchObject({
      code: 'ARTICLE_NOT_FOUND',
    });
    await expect(
      new GetArticleBySlugQuery(repository, projection).execute('account-1', 'missing'),
    ).rejects.toMatchObject({
      code: 'ARTICLE_NOT_FOUND',
    });
  });

  it('ART-BE-UC-009/010/011 — public, own and moderation inventories remain distinct repository projections', async () => {
    const search = vi.fn(async () => page);
    const searchByAuthor = vi.fn(async () => page);
    const searchForModeration = vi.fn(async () => page);
    const repository = { search, searchByAuthor, searchForModeration } as never;
    const filter = { page: 1, pageSize: 20, search: 'article' } as never;

    await expect(new ListArticlesQuery(repository).execute(filter)).resolves.toBe(page);
    await expect(new ListMyArticlesQuery(repository).execute('account-1', filter)).resolves.toBe(page);
    await expect(new ListArticlesForModerationQuery(repository).execute(filter)).resolves.toBe(page);

    expect(search).toHaveBeenCalledWith(filter);
    expect(searchByAuthor).toHaveBeenCalledWith('account-1', filter);
    expect(searchForModeration).toHaveBeenCalledWith(filter);
  });
});

describe('Article command boundaries', () => {
  it('returns the projected Article created by SaveArticleDraftCommand', async () => {
    const projected = { id: 'article-1', slug: 'article', status: ArticleStatus.Draft } as never;
    const create = vi.fn(async () => 'article-1');
    const findById = vi.fn(async () => projected);
    const project = vi.fn(async (value: unknown) => value);

    const command = new SaveArticleDraftCommand(
      {
        transaction: async (work: (context: unknown) => Promise<unknown>) => work({}),
        create,
        slugExists: async () => false,
      } as never,
      { findById } as never,
      { validateTags: async () => ({ tagSlugs: [] }) } as never,
      { confirmImageUpload: async () => null } as never,
      { assertAccountCapability: async () => undefined },
      { project } as never,
      { create: async () => ({ id: 'resource-1' }) } as never,
    );

    await expect(
      command.execute(
        { sub: 'author-1', role: null },
        { title: 'Article', description: 'Description', content: 'Content' },
      ),
    ).resolves.toBe(projected);
    expect(create).toHaveBeenCalledTimes(1);
    expect(findById).toHaveBeenCalledWith('article-1');
    expect(project).toHaveBeenCalledWith(projected);
  });

  it.each([0, 6])('rejects publication with %s tags before changing state or emitting an event', async (tagCount) => {
    const entity = article();
    const save = vi.fn(async () => true);
    const emitAsync = vi.fn(async () => []);
    const command = new PublishArticleCommand(
      { findById: async () => entity, save } as never,
      new ArticlePolicy(),
      { getResourceTagSlugs: async () => Array.from({ length: tagCount }, (_, index) => `tag-${index}`) } as never,
      { emitAsync } as never,
    );

    await expect(command.execute({ sub: 'user-1', role: null }, entity.id, { publishedAt })).rejects.toMatchObject({
      code: 'CONTENT_INVALID_TAG_COUNT',
    });
    expect(entity.status).toBe(ArticleStatus.Draft);
    expect(save).not.toHaveBeenCalled();
    expect(emitAsync).not.toHaveBeenCalled();
  });

  it('emits ArticlePublished only after successful persistence', async () => {
    const entity = article();
    const calls: string[] = [];
    const command = new PublishArticleCommand(
      {
        findById: async () => entity,
        save: async () => {
          calls.push('save');

          return true;
        },
      } as never,
      new ArticlePolicy(),
      { getResourceTagSlugs: async () => ['typescript'] } as never,
      {
        emitAsync: async (_event: string, payload: unknown) => {
          calls.push('event');
          expect(payload).toMatchObject({ message: { data: { article: { id: entity.id, tags: ['typescript'] } } } });

          return [];
        },
      } as never,
    );

    await command.execute({ sub: 'user-1', role: null }, entity.id, { publishedAt });

    expect(calls).toEqual(['save', 'event']);
  });

  it('allows an Administrator to delete another author Article', async () => {
    const entity = article({ publish: true });
    const save = vi.fn(async () => true);

    await new DeleteArticleCommand({ findById: async () => entity, save } as never, new ArticlePolicy()).execute(
      { sub: 'administrator-1', role: Role.ADMIN },
      entity.id,
    );

    expect(save).toHaveBeenCalledWith(entity);
    expect(entity.deletedAt).not.toBeNull();
    expect(entity.status).toBe(ArticleStatus.Published);
  });

  it('uses the direct detail lookup for both Moderator and Administrator reads', async () => {
    const findById = vi.fn(async () => ({ id: 'article-1' }));
    const project = vi.fn(async (value: unknown) => value);
    const query = new GetArticleByIdQuery({ findById } as never, { project } as never, new ArticlePolicy());

    await query.execute('account-1', 'article-1', Role.MODERATOR);
    await query.execute('account-2', 'article-1', Role.ADMIN);

    expect(findById).toHaveBeenNthCalledWith(1, 'article-1');
    expect(findById).toHaveBeenNthCalledWith(2, 'article-1');
  });
});
