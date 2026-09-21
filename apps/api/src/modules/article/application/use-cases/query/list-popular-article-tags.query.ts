import { Injectable } from '@nestjs/common';
import {
  ArticleQueryRepository,
  type ArticlePopularTag,
} from '@/modules/article/application/ports/repositories/article.query.repository';

@Injectable()
export class ListPopularArticleTagsQuery {
  constructor(private readonly articleQueryRepository: ArticleQueryRepository) {}

  execute(limit?: number): Promise<ArticlePopularTag[]> {
    return this.articleQueryRepository.listPopularTags(limit);
  }
}
