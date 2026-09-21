import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ResourceIdentityStore } from '@/shared/infrastructure/database/drizzle/resource-identity.store';
import type { ResourceKind } from '@/shared/kernel/resource/resource-identity';
import { ArticlePublicServicePort } from '@/modules/article/public/article-public.service.port';
import { ProjectPublicServicePort } from '@/modules/project/public/project-public.service';
import { JobPublicServicePort } from '@/modules/job/public/job-public.service';
import { QAndAPublicServicePort } from '@/modules/q-and-a/public/q-and-a-public.service';
import { CommentModerationPort } from '@/modules/comment/public/comment-moderation.port';
import {
  ModerationTargetVisibilityPort,
  type HiddenModerationTarget,
} from '../../application/ports/moderation-target-visibility.port';

@Injectable()
export class PublicOwnerModerationTargetVisibility implements ModerationTargetVisibilityPort {
  constructor(
    private readonly identities: ResourceIdentityStore,
    private readonly articles: ArticlePublicServicePort,
    private readonly projects: ProjectPublicServicePort,
    private readonly jobs: JobPublicServicePort,
    private readonly qAndA: QAndAPublicServicePort,
    private readonly comments: CommentModerationPort,
  ) {}

  async unhideResource(resourceId: string): Promise<void> {
    const identity = await this.identities.get(resourceId);
    if (!identity) throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');

    return this.unhideByKind(identity.kind, resourceId);
  }

  unhideComment(commentId: string): Promise<void> {
    return this.comments.apply(commentId, 'unhide_comment');
  }

  async listHidden(): Promise<HiddenModerationTarget[]> {
    const [articles, projects, jobs, qAndA, comments] = await Promise.all([
      this.articles.listHiddenForModeration(),
      this.projects.listHiddenForModeration(),
      this.jobs.listHiddenForModeration(),
      this.qAndA.listHiddenForModeration(),
      this.comments.listHiddenForModeration(),
    ]);

    const pack = (
      resourceKind: ResourceKind,
      rows: Array<{ id: string; hiddenAt: string }>,
    ): HiddenModerationTarget[] =>
      rows.map((row) => ({ kind: 'resource', resourceKind, resourceId: row.id, hiddenAt: row.hiddenAt }));

    return [
      ...pack('article', articles),
      ...pack('project', projects),
      ...pack('job', jobs),
      ...qAndA.map((row): HiddenModerationTarget => ({
        kind: 'resource',
        resourceKind: row.kind,
        resourceId: row.id,
        hiddenAt: row.hiddenAt,
      })),
      ...comments.map((row): HiddenModerationTarget => ({
        kind: 'comment',
        commentId: row.id,
        hiddenAt: row.hiddenAt,
      })),
    ].sort((a, b) => b.hiddenAt.localeCompare(a.hiddenAt));
  }

  private unhideByKind(kind: ResourceKind, id: string): Promise<void> {
    switch (kind) {
      case 'article':
        return this.articles.unhideArticle(id);
      case 'project':
        return this.projects.applyModerationAction(id, 'unhide_project');
      case 'job':
        return this.jobs.applyModerationAction(id, 'unhide_job');
      case 'question':
        return this.qAndA.applyModerationAction(id, 'unhide_question');
      case 'answer':
        return this.qAndA.applyModerationAction(id, 'unhide_answer');
      default:
        throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');
    }
  }
}
