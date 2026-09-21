import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { NewsPolicy } from '@/modules/news/application/news.policy';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';

@Injectable()
export class SetNewsCommentsEnabledCommand {
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly newsPolicy: NewsPolicy,
  ) {}

  async execute(user: User, newsId: string, enabled: boolean): Promise<void> {
    this.newsPolicy.canManage(user);

    const news = await this.newsRepository.findById(newsId);
    if (!news) throw new AppError('NEWS_NOT_FOUND');

    news.setCommentsEnabled(enabled);
    const saved = await this.newsRepository.save(news);
    if (!saved) throw new AppError('NEWS_INVALID_STATUS');
  }
}
