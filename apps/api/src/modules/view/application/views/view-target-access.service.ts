import { Injectable } from '@nestjs/common';
import { ArticlePublicServicePort } from '@/modules/article/public/article-public.service.port';
import { NewsPublicServicePort } from '@/modules/news/public/news-public.service.port';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import { ViewTargetPolicy } from '@/modules/view/domain';

@Injectable()
export class ViewTargetAccessService {
  constructor(
    private readonly resources: ResourceIdentityPort,
    private readonly articles: ArticlePublicServicePort,
    private readonly news: NewsPublicServicePort,
  ) {}

  async isViewable(resourceId: string): Promise<boolean> {
    const identity = await this.resources.get(resourceId);
    if (!identity || !ViewTargetPolicy.supports(identity.kind)) return false;

    switch (identity.kind) {
      case 'article':
        return Boolean((await this.articles.resolveAccess(resourceId))?.isPublic);
      case 'news':
        return Boolean((await this.news.resolveAccess(resourceId))?.isPublic);
      default:
        return false;
    }
  }
}
