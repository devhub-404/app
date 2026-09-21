import { describe, expect, it } from 'vitest';
import { Project } from '@/modules/project/domain/project';

const input = {
  id: 'project-1',
  authorAccountId: 'account-1',
  title: 'DevHub',
  slug: 'devhub',
  summary: 'A project',
  description: 'Project description',
  projectUrl: 'https://example.com/project',
  repositoryUrl: 'https://github.com/example/project',
};

describe('Project domain', () => {
  it('PRJ-RN-001 — requires exactly one Account author and exposes no Organization ownership field', () => {
    expect(() => Project.create({ ...input, authorAccountId: '' })).toThrow('PROJECT_AUTHOR_REQUIRED');
    const project = Project.create(input);
    expect(project.value.authorAccountId).toBe('account-1');
    expect(project.value).not.toHaveProperty('organizationId');
  });

  it('PRJ-RN-002/003 — owns draft publication, archive/unarchive and terminal deletion lifecycle', () => {
    const project = Project.create(input);
    expect(project.value.status).toBe('draft');
    expect(() => project.archive()).toThrow('PROJECT_INVALID_STATUS');
    project.publish(new Date('2026-01-01T00:00:00.000Z'));
    project.archive(new Date('2026-01-02T00:00:00.000Z'));
    project.unarchive(new Date('2026-01-03T00:00:00.000Z'));
    expect(project.value).toMatchObject({ status: 'published', slug: 'devhub' });
    project.delete(new Date('2026-01-04T00:00:00.000Z'));
    expect(project.value.deletedAt).toBe('2026-01-04T00:00:00.000Z');
    expect(() => project.update({ title: 'Changed' })).toThrow('PROJECT_DELETED');
  });

  it('PRJ-RN-004 — hide is orthogonal to lifecycle and remains active through archive/unarchive', () => {
    const project = Project.create(input);
    project.publish(new Date('2026-01-01T00:00:00.000Z'));
    project.hide(new Date('2026-01-02T00:00:00.000Z'));
    project.archive();
    expect(project.value.hiddenAt).toBe('2026-01-02T00:00:00.000Z');
    project.unarchive();
    project.unhide();
    expect(project.value.hiddenAt).toBeNull();
  });

  it('PRJ-RN-004 — permits hide/unhide independently of lifecycle state', () => {
    const project = Project.create(input);
    project.hide(new Date('2026-01-02T00:00:00.000Z'));
    expect(project.value.hiddenAt).toBe('2026-01-02T00:00:00.000Z');
    project.unhide();
    expect(project.value.hiddenAt).toBeNull();
  });

  it('PRJ-RF-002/006 — validates mutable details while preserving stable slug and state', () => {
    const project = Project.create(input);
    project.update({ title: 'Updated project', summary: 'Updated summary' });
    expect(project.value).toMatchObject({
      title: 'Updated project',
      summary: 'Updated summary',
      slug: 'devhub',
      status: 'draft',
    });
    expect(() => project.update({ title: ' ' })).toThrow('PROJECT_INVALID_TITLE');
    expect(() => Project.create({ ...input, description: '' }).update({ description: 'Changed' })).toThrow(
      'PROJECT_INVALID_DESCRIPTION',
    );
  });
});
