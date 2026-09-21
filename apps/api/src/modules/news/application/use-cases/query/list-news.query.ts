import { Injectable } from '@nestjs/common';
import { NewsQueryRepository } from '@/modules/news/application/ports/repositories/news.query.repository';
import { QueryNewsDTO } from '@/modules/news/application/dtos/in';
import { Paginated } from '@/shared/kernel/pagination';
import { NewsItemDTO, NewsSourceDTO } from '@/modules/news/application/dtos/out';
import { toNewsSearchCriteria } from './news-search-criteria';

@Injectable()
export class ListNewsQuery {
  constructor(private readonly newsQueryRepository: NewsQueryRepository) {}

  async execute(query: QueryNewsDTO): Promise<Paginated<NewsItemDTO>> {
    return await this.newsQueryRepository.search(toNewsSearchCriteria(query));
  }
  async listPopularSources(): Promise<NewsSourceDTO[]> {
    return await this.newsQueryRepository.listPopularSources();
  }
}
