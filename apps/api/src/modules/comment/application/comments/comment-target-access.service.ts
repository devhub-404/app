import { Injectable } from '@nestjs/common';
import { ArticlePublicServicePort } from '@/modules/article/public/article-public.service.port';
import { NewsPublicServicePort } from '@/modules/news/public/news-public.service.port';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';
import { CommentTargetPolicy } from '@/modules/comment/domain';

export type CommentTargetAccess = {
  kind: 'article' | 'news';
  isReadable: boolean;
  isCommentable: boolean;
  ownerAccountId: string | null;
};

@Injectable()
export class CommentTargetAccessService {
  constructor(
    private readonly resources: ResourceIdentityPort,
    private readonly articles: ArticlePublicServicePort,
    private readonly news: NewsPublicServicePort,
  ) {}

  async resolve(resourceId: string): Promise<CommentTargetAccess | null> {
    const identity = await this.resources.get(resourceId);
    if (!identity || !CommentTargetPolicy.supports(identity.kind)) return null;
    switch (identity.kind) {
      case 'article': {
        const target = await this.articles.resolveAccess(resourceId);
        if (!target) return null;

        return {
          kind: 'article',
          isReadable: target.isPublic,
          isCommentable: target.isPublic && target.commentsEnabled,
          ownerAccountId: target.ownerAccountId ?? null,
        };
      }
      case 'news': {
        const target = await this.news.resolveAccess(resourceId);
        if (!target) return null;

        return {
          kind: 'news',
          isReadable: target.isPublic,
          isCommentable: target.isPublic && target.commentsEnabled,
          ownerAccountId: null,
        };
      }
      default:
        return null;
    }
  }
}
