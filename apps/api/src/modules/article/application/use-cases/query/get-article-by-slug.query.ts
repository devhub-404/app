import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { ArticleDTO } from '@/modules/article/application/dtos/out';
import { ArticleDetailProjection } from '@/modules/article/application/article-detail-projection';

@Injectable()
export class GetArticleBySlugQuery {
  constructor(
    private readonly articleQueryRepository: ArticleQueryRepository,
    private readonly articleDetailProjection: ArticleDetailProjection,
  ) {}

  async execute(_userId: string, slug: string): Promise<ArticleDTO> {
    const article = await this.articleQueryRepository.findBySlug(slug);
    if (!article) throw new AppError('ARTICLE_NOT_FOUND');

    return this.articleDetailProjection.project(article);
  }
}
