import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NewsRepository } from '@/modules/news/application/ports/repositories/news.repository';
import { NewsPolicy } from '@/modules/news/application/news.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';

@Injectable()
export class DeleteNewsCommand {
  constructor(
    private readonly newsRepository: NewsRepository,
    private readonly newsPolicy: NewsPolicy,
  ) {}

  async execute(user: User, id: string): Promise<void> {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw new AppError('NEWS_NOT_FOUND');
    }

    this.newsPolicy.canDelete(user);
    if (news.deletedAt) throw new AppError('NEWS_INVALID_STATUS');

    news.softDelete();
    const saved = await this.newsRepository.save(news);
    if (!saved) throw new AppError('NEWS_INVALID_STATUS');
  }
}
