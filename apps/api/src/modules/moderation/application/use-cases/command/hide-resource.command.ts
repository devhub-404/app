import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';
import { ArticlePublicServicePort } from '@/modules/article/public/article-public.service.port';
import { ProjectPublicServicePort } from '@/modules/project/public/project-public.service';
import { JobPublicServicePort } from '@/modules/job/public/job-public.service';
import { QAndAPublicServicePort } from '@/modules/q-and-a/public/q-and-a-public.service';

@Injectable()
export class HideResourceCommand {
  constructor(
    private readonly identities: ResourceIdentityPort,
    private readonly articles: ArticlePublicServicePort,
    private readonly projects: ProjectPublicServicePort,
    private readonly jobs: JobPublicServicePort,
    private readonly qAndA: QAndAPublicServicePort,
  ) {}

  async execute(resourceId: string, reason?: string | null): Promise<void> {
    const identity = await this.identities.get(resourceId);
    if (!identity) throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');

    return this.hideByKind(identity.kind, resourceId, reason);
  }

  private hideByKind(kind: ResourceKind, id: string, reason?: string | null): Promise<void> {
    switch (kind) {
      case 'article':
        return this.articles.applyModerationAction(id, 'hide_article', reason);
      case 'project':
        return this.projects.applyModerationAction(id, 'hide_project');
      case 'job':
        return this.jobs.applyModerationAction(id, 'hide_job');
      case 'question':
        return this.qAndA.applyModerationAction(id, 'hide_question');
      case 'answer':
        return this.qAndA.applyModerationAction(id, 'hide_answer');
      default:
        throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');
    }
  }
}
