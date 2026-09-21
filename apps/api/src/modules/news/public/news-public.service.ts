import { Injectable } from '@nestjs/common';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';
import { NewsStatus } from '@/modules/news/domain/news';
import { AppError } from '@/shared/errors/app-error';
import { NewsPublicServicePort } from '@/modules/news/public/news-public.service.port';

@Injectable()
export class NewsPublicService implements NewsPublicServicePort {
  constructor(private readonly newsRepository: NewsRepository) {}

  async resolveAccess(newsId: string) {
    const news = await this.newsRepository.findById(newsId);

    if (!news) return null;

    return {
      isPublic: news.status === NewsStatus.Published && news.deletedAt === null,
      commentsEnabled: news.commentsEnabled,
    };
  }

  async applyEditorialAction(newsId: string, action: 'archive' | 'delete'): Promise<void> {
    const news = await this.newsRepository.findById(newsId);
    if (!news) throw new AppError('NEWS_NOT_FOUND');
    if (news.deletedAt) throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');
    if (action === 'archive') news.archive();
    else news.softDelete();
    const saved = await this.newsRepository.save(news);
    if (!saved) throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');
  }
}
