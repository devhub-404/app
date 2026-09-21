import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NewsQueryRepository } from '@/modules/news/application/ports/repositories/news.query.repository';
import { NewsDTO } from '@/modules/news/application/dtos/out';

@Injectable()
export class GetNewsBySlugQuery {
  constructor(private readonly newsQueryRepository: NewsQueryRepository) {}

  async execute(_userId: string | null, slug: string): Promise<NewsDTO> {
    const news = await this.newsQueryRepository.findBySlug(slug);
    if (!news) {
      throw new AppError('NEWS_NOT_FOUND');
    }

    return news;
  }
}
