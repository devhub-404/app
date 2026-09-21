import { Injectable } from '@nestjs/common';
import { ProjectRepository } from '@/modules/project/application/ports/repositories/project.repository';
import { ProjectQueryRepository } from '@/modules/project/application/ports/repositories/project.query.repository';
export type ProjectAccessSnapshot = { isPublic: boolean; ownerAccountId: string };

export type ProjectPublicContribution = {
  id: string;
  type: 'project';
  title: string;
  slug: string;
  occurredAt: string | null;
};

export abstract class ProjectPublicServicePort {
  abstract resolveAccess(id: string): Promise<ProjectAccessSnapshot | null>;
  abstract applyModerationAction(id: string, action: 'hide_project' | 'unhide_project'): Promise<void>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
  abstract listPublishedByAuthor(accountId: string, limit?: number): Promise<ProjectPublicContribution[]>;
}

@Injectable()
export class ProjectPublicService implements ProjectPublicServicePort {
  constructor(
    private readonly repo: ProjectRepository,
    private readonly query: ProjectQueryRepository,
  ) {}

  async listPublishedByAuthor(accountId: string, limit = 20): Promise<ProjectPublicContribution[]> {
    const page = await this.query.search({
      authorAccountId: accountId,
      page: 1,
      pageSize: Math.min(50, Math.max(1, limit)),
    });

    return page.items.map((project) => ({
      id: project.id,
      type: 'project' as const,
      title: project.title,
      slug: project.slug,
      occurredAt: project.publishedAt,
    }));
  }

  async applyModerationAction(id: string, action: 'hide_project' | 'unhide_project'): Promise<void> {
    const moderationAction = action === 'hide_project' ? 'hide' : 'unhide';
    if (!(await this.repo.moderate(id, moderationAction))) throw new Error('MODERATION_ACTION_NOT_SUPPORTED');
  }

  listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>> {
    return this.query.listHiddenForModeration();
  }

  async resolveAccess(id: string): Promise<ProjectAccessSnapshot | null> {
    const resolved = await this.query.resolve(id);
    if (!resolved || resolved.status !== 'published' || resolved.hiddenAt || resolved.deletedAt) return null;

    return { isPublic: true, ownerAccountId: resolved.authorAccountId };
  }
}
