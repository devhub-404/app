import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';
import { NewsPolicy } from '@/modules/news/application/news.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { TaxonomyPublicServicePort } from '@/modules/taxonomy/public/taxonomy-public.service.port';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NEWS_PUBLISHED_EVENT, NewsPublishedEvent } from '@/modules/news/public/news-published.event';
import { NewsSourceRepository } from '@/modules/news/application/ports/repositories/news-source.repository';

@Injectable()
export class PublishNewsCommand {
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly newsPolicy: NewsPolicy,
    private readonly taxonomyService: TaxonomyPublicServicePort,
    private readonly eventEmitter: EventEmitter2,
    private readonly sourceRepository: NewsSourceRepository,
  ) {}

  async execute(user: User, id: string): Promise<void> {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw new AppError('NEWS_NOT_FOUND');
    }

    this.newsPolicy.canManage(user);

    const tagSlugs = await this.taxonomyService.getResourceTagSlugs(news.id);
    if (tagSlugs.length < 1 || tagSlugs.length > 5) throw new AppError('CONTENT_INVALID_TAG_COUNT');
    if (!(await this.sourceRepository.hasForNews(news.id))) throw new AppError('NEWS_SOURCE_REQUIRED');
    news.publish();
    const saved = await this.newsRepository.save(news);
    if (!saved) throw new AppError('NEWS_INVALID_STATUS');
    await this.eventEmitter.emitAsync(
      NEWS_PUBLISHED_EVENT,
      new NewsPublishedEvent({
        id: `news:${news.id}:${news.publishedAt}`,
        occurredAt: new Date().toISOString(),
        event: 'news_published',
        data: {
          news: {
            id: news.id,
            title: news.title,
            slug: news.slug,
            publishedAt: news.publishedAt!,
            coverImageUrl: news.coverImageUrl,
            tags: tagSlugs,
          },
        },
      }),
    );
  }
}
