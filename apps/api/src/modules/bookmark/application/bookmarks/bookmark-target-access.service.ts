import { Injectable } from '@nestjs/common';
import { ArticlePublicServicePort } from '@/modules/article/public/article-public.service.port';
import { NewsPublicServicePort } from '@/modules/news/public/news-public.service.port';
import { ExternalResourcePublicServicePort } from '@/modules/external-resource/public/resource-public.service.port';
import { ProjectPublicServicePort } from '@/modules/project/public/project-public.service';
import { QAndAPublicServicePort } from '@/modules/q-and-a/public';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import { BookmarkTargetPolicy } from '@/modules/bookmark/domain';

@Injectable()
export class BookmarkTargetAccessService {
  constructor(
    private readonly resources: ResourceIdentityPort,
    private readonly articles: ArticlePublicServicePort,
    private readonly news: NewsPublicServicePort,
    private readonly externalResources: ExternalResourcePublicServicePort,
    private readonly projects: ProjectPublicServicePort,
    private readonly qAndA: QAndAPublicServicePort,
  ) {}

  async isBookmarkable(resourceId: string): Promise<boolean> {
    const identity = await this.resources.get(resourceId);
    if (!identity || !BookmarkTargetPolicy.supports(identity.kind)) return false;

    switch (identity.kind) {
      case 'article':
        return Boolean((await this.articles.resolveAccess(resourceId))?.isPublic);
      case 'news':
        return Boolean((await this.news.resolveAccess(resourceId))?.isPublic);
      case 'external_resource':
        return Boolean((await this.externalResources.resolveAccess(resourceId))?.isPublic);
      case 'project':
        return Boolean((await this.projects.resolveAccess(resourceId))?.isPublic);
      case 'question':
        return Boolean((await this.qAndA.resolveAccess(resourceId))?.isPublic);
      default:
        return false;
    }
  }
}
