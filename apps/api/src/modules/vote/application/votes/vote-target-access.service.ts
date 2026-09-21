import { Injectable } from '@nestjs/common';
import { ArticlePublicServicePort } from '@/modules/article/public/article-public.service.port';
import { QAndAPublicServicePort } from '@/modules/q-and-a/public';
import { ExternalResourcePublicServicePort } from '@/modules/external-resource/public/resource-public.service.port';
import { ProjectPublicServicePort } from '@/modules/project/public/project-public.service';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import { VoteTargetPolicy } from '@/modules/vote/domain';

@Injectable()
export class VoteTargetAccessService {
  constructor(
    private readonly resources: ResourceIdentityPort,
    private readonly articles: ArticlePublicServicePort,
    private readonly externalResources: ExternalResourcePublicServicePort,
    private readonly projects: ProjectPublicServicePort,
    private readonly qAndA: QAndAPublicServicePort,
  ) {}

  async isVoteable(resourceId: string): Promise<boolean> {
    const identity = await this.resources.get(resourceId);
    if (!identity || !VoteTargetPolicy.supports(identity.kind)) return false;

    switch (identity.kind) {
      case 'article':
        return Boolean((await this.articles.resolveAccess(resourceId))?.isPublic);
      case 'external_resource':
        return Boolean((await this.externalResources.resolveAccess(resourceId))?.isPublic);
      case 'project':
        return Boolean((await this.projects.resolveAccess(resourceId))?.isPublic);
      case 'question':
      case 'answer':
        return Boolean((await this.qAndA.resolveAccess(resourceId))?.isPublic);
      default:
        return false;
    }
  }
}
