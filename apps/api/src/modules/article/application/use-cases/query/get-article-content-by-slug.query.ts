import { Injectable } from '@nestjs/common';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { ArticleContentDTO } from '@/modules/article/application/dtos/out';
import { AppError } from '@/shared/errors/app-error';

@Injectable()
export class GetArticleContentBySlugQuery {
  constructor(private readonly articleQueryRepository: ArticleQueryRepository) {}

  async execute(slug: string): Promise<ArticleContentDTO> {
    const article = await this.articleQueryRepository.findContentBySlug(slug);
    if (!article) throw new AppError('ARTICLE_NOT_FOUND');

    return { id: article.id, content: article.content, contentVersion: article.contentVersion };
  }
}
