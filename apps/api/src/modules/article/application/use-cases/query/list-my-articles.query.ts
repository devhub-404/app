import { Injectable } from '@nestjs/common';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { QueryArticleDTO } from '@/modules/article/application/dtos/in';
import { ArticleItemDTO } from '@/modules/article/application/dtos/out';
import { Paginated } from '@/shared/kernel/pagination';
import { toArticleSearchCriteria } from './article-search-criteria';

@Injectable()
export class ListMyArticlesQuery {
  constructor(private readonly articleQueryRepository: ArticleQueryRepository) {}

  async execute(userId: string, query: QueryArticleDTO): Promise<Paginated<ArticleItemDTO>> {
    return await this.articleQueryRepository.searchByAuthor(userId, toArticleSearchCriteria(query));
  }
}
