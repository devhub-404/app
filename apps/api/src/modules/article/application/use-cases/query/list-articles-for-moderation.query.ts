import { Injectable } from '@nestjs/common';
import { QueryArticleDTO } from '@/modules/article/application/dtos/in';
import { ArticleItemDTO } from '@/modules/article/application/dtos/out';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { Paginated } from '@/shared/kernel/pagination';
import { toArticleSearchCriteria } from './article-search-criteria';

@Injectable()
export class ListArticlesForModerationQuery {
  constructor(private readonly articleQueryRepository: ArticleQueryRepository) {}

  async execute(query: QueryArticleDTO): Promise<Paginated<ArticleItemDTO>> {
    return this.articleQueryRepository.searchForModeration(toArticleSearchCriteria(query));
  }
}
