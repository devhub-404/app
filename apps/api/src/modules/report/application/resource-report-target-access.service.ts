import { Injectable } from '@nestjs/common';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import { ArticlePublicServicePort } from '@/modules/article/public';
import { NewsPublicServicePort } from '@/modules/news/public';
import { ExternalResourcePublicServicePort } from '@/modules/external-resource/public';
import { ProjectPublicServicePort } from '@/modules/project/public';
import { EventPublicServicePort } from '@/modules/event/public/event-public.service';
import { JobPublicServicePort } from '@/modules/job/public';
import { QAndAPublicServicePort } from '@/modules/q-and-a/public';
import { ResourceReportTargetPolicy } from '@/modules/report/domain';

@Injectable()
export class ResourceReportTargetAccessService {
  constructor(
    private readonly resources: ResourceIdentityPort,
    private readonly articles: ArticlePublicServicePort,
    private readonly news: NewsPublicServicePort,
    private readonly externalResources: ExternalResourcePublicServicePort,
    private readonly projects: ProjectPublicServicePort,
    private readonly events: EventPublicServicePort,
    private readonly jobs: JobPublicServicePort,
    private readonly qAndA: QAndAPublicServicePort,
  ) {}

  async isReportable(resourceId: string): Promise<boolean> {
    const identity = await this.resources.get(resourceId);
    if (!identity || !ResourceReportTargetPolicy.supports(identity.kind)) return false;
    switch (identity.kind) {
      case 'article':
        return (await this.articles.resolveAccess(resourceId))?.isPublic === true;
      case 'news':
        return (await this.news.resolveAccess(resourceId))?.isPublic === true;
      case 'external_resource':
        return (await this.externalResources.resolveAccess(resourceId))?.isPublic === true;
      case 'project':
        return (await this.projects.resolveAccess(resourceId))?.isPublic === true;
      case 'event':
        return (await this.events.resolveAccess(resourceId))?.isPublic === true;
      case 'job':
        return (await this.jobs.resolveAccess(resourceId))?.isPublic === true;
      case 'question':
      case 'answer':
        return (await this.qAndA.resolveAccess(resourceId))?.isPublic === true;
    }
  }
}
