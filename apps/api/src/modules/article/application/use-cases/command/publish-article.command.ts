import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ArticleRepository } from '@/modules/article/application/ports/repositories/article.repository';
import { ArticlePolicy } from '@/modules/article/application/article.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { ArticlePublishInputDTO } from '@/modules/article/application/dtos/in/publish-article.dto';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ARTICLE_PUBLISHED_EVENT, ArticlePublishedEvent } from '@/modules/article/public/article-published.event';

@Injectable()
export class PublishArticleCommand {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articlePolicy: ArticlePolicy,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(user: User, id: string, payload: ArticlePublishInputDTO): Promise<void> {
    const article = await this.articleRepository.findById(id);

    if (!article) {
      throw new AppError('ARTICLE_NOT_FOUND');
    }

    this.articlePolicy.canUpdate(user, article.authorId);

    const tagSlugs = await this.taxonomyService.getResourceTagSlugs(article.id);
    if (tagSlugs.length < 1 || tagSlugs.length > 5) throw new AppError('CONTENT_INVALID_TAG_COUNT');
    article.publish(payload.publishedAt);
    const saved = await this.articleRepository.save(article);
    if (!saved) throw new AppError('ARTICLE_INVALID_STATUS');
    await this.eventEmitter.emitAsync(
      ARTICLE_PUBLISHED_EVENT,
      new ArticlePublishedEvent({
        id: `article:${article.id}:${article.publishedAt}`,
        occurredAt: new Date().toISOString(),
        event: 'article_published',
        data: {
          article: {
            id: article.id,
            title: article.title,
            slug: article.slug,
            publishedAt: article.publishedAt!,
            coverImageUrl: article.coverImageUrl,
            tags: tagSlugs,
          },
        },
      }),
    );
  }
}
