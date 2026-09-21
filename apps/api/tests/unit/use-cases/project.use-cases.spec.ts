import { describe, expect, it, vi } from 'vitest';
import { CreateProjectCommand } from '@/modules/project/application/use-cases/command/create-project.command';
import { UpdateProjectCommand } from '@/modules/project/application/use-cases/command/update-project.command';
import { PublishProjectCommand } from '@/modules/project/application/use-cases/command/publish-project.command';
import { DeleteProjectCommand } from '@/modules/project/application/use-cases/command/delete-project.command';
import { ListMyProjectsQuery } from '@/modules/project/application/use-cases/query/list-my-projects.query';
import { Role } from '@/shared/kernel/auth/role';

describe('Project use cases', () => {
  const input = {
    title: 'DevHub CLI',
    summary: 'A project summary',
    description: 'A project description',
    projectUrl: 'https://example.com/project',
    repositoryUrl: 'https://github.com/example/project',
    tagSlugs: ['typescript'],
  };
  const project = {
    id: 'project-1',
    authorAccountId: 'account-1',
    author: null,
    slug: 'devhub-cli',
    ...input,
    status: 'draft' as const,
    publishedAt: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-08-10T00:00:00.000Z',
  };
  const taxonomy = {
    validateTags: vi.fn(async () => ({ tagSlugs: ['typescript'] })),
    setResourceClassification: vi.fn(async () => undefined),
    getResourceTagSlugs: vi.fn(async () => ['typescript']),
    getTagsByResourceIds: vi.fn(async () => ({ 'project-1': [{ name: 'TypeScript', slug: 'typescript' }] })),
  };
  const access = { assertCanManage: vi.fn(async () => undefined) };

  it('PRJ-RN-007/PRJ-RNF-001 — creates a developer-owned Project with one ResourceIdentity and classification transaction', async () => {
    const context = { transaction: true };
    const repository = {
      transaction: vi.fn(async (work: (context: unknown) => Promise<unknown>) => work(context)),
      create: vi.fn(async () => project),
    };
    const identities = { create: vi.fn(async () => ({ id: project.id, kind: 'project' })) };
    const restrictions = { assertAccountCapability: vi.fn(async () => undefined) };
    const result = await new CreateProjectCommand(
      repository as never,
      taxonomy as never,
      restrictions,
      identities as never,
    ).execute('account-1', input);
    expect(identities.create).toHaveBeenCalledWith('project', context);
    expect(repository.create).toHaveBeenCalledWith(
      project.id,
      'account-1',
      expect.not.objectContaining({ tagSlugs: expect.anything() }),
      context,
    );
    expect(taxonomy.setResourceClassification).toHaveBeenCalledWith(project.id, { tagSlugs: ['typescript'] }, context);
    expect(result.authorAccountId).toBe('account-1');
    expect(result).not.toHaveProperty('organizationId');
  });

  it('updates only after author access and keeps classification under Taxonomy', async () => {
    const context = { transaction: true };
    const repository = {
      getById: vi.fn(async () => project),
      transaction: vi.fn(async (work: (context: unknown) => Promise<unknown>) => work(context)),
      update: vi.fn(async (_id: string, patch: object) => ({ ...project, ...patch })),
    };
    const result = await new UpdateProjectCommand(repository as never, taxonomy as never, access).execute(
      'account-1',
      project.id,
      { ...input, title: 'Changed' },
    );
    expect(access.assertCanManage).toHaveBeenCalledWith('account-1', project);
    expect(taxonomy.setResourceClassification).toHaveBeenCalledWith(project.id, { tagSlugs: ['typescript'] }, context);
    expect(result.title).toBe('Changed');
  });

  it('publishes through owner authorization and enriches Resource tags', async () => {
    const published = { ...project, status: 'published' as const, publishedAt: '2026-08-18T00:00:00.000Z' };
    const repository = { getById: vi.fn(async () => project), publish: vi.fn(async () => published) };
    await expect(
      new PublishProjectCommand(repository as never, taxonomy as never, access as never).execute(
        'account-1',
        project.id,
      ),
    ).resolves.toMatchObject({ status: 'published', tagSlugs: ['typescript'] });
  });

  it('lists only Projects authored by the current Account; Organization is not part of ownership', async () => {
    const page = { items: [project], total: 1, page: 1, pageSize: 20 };
    const repository = { searchManaged: vi.fn(async () => page) };
    await new ListMyProjectsQuery(repository as never, taxonomy as never).execute('account-1', {
      page: 1,
      pageSize: 20,
    });
    expect(repository.searchManaged).toHaveBeenCalledWith({ page: 1, pageSize: 20 }, 'account-1');
  });

  it('lets Administrator delete any Project and author delete their own', async () => {
    const repository = { getById: vi.fn(async () => project), remove: vi.fn(async () => true) };
    await new DeleteProjectCommand(repository as never, access).execute({ sub: 'account-1', role: null }, project.id);
    await new DeleteProjectCommand(repository as never, access).execute(
      { sub: 'admin-1', role: Role.ADMIN },
      project.id,
    );
    expect(repository.remove).toHaveBeenCalledTimes(2);
  });
});
