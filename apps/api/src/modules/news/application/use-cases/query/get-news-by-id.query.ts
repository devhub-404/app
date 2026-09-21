import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { NewsQueryRepository } from '@/modules/news/application/ports/repositories/news.query.repository';
import { NewsDTO } from '@/modules/news/application/dtos/out';

@Injectable()
export class GetNewsByIdQuery {
  constructor(private readonly newsQueryRepository: NewsQueryRepository) {}

  async execute(id: string): Promise<NewsDTO> {
    const news = await this.newsQueryRepository.findById(id);
    if (!news) {
      throw new AppError('NEWS_NOT_FOUND');
    }

    return news;
  }
}
