import { Injectable } from '@nestjs/common';
import { NewsQueryRepository } from '@/modules/news/application/ports/repositories/news.query.repository';
import { QueryNewsDTO } from '@/modules/news/application/dtos/in';
import { NewsItemDTO } from '@/modules/news/application/dtos/out';
import { Paginated } from '@/shared/kernel/pagination';
import { toNewsSearchCriteria } from './news-search-criteria';

@Injectable()
export class ListNewsForManagementQuery {
  constructor(private readonly newsQueryRepository: NewsQueryRepository) {}

  async execute(query: QueryNewsDTO): Promise<Paginated<NewsItemDTO>> {
    return await this.newsQueryRepository.searchForManagement(toNewsSearchCriteria(query));
  }
}
