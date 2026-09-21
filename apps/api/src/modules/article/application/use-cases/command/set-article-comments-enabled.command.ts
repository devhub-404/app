import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { ArticlePolicy } from '@/modules/article/application/article.policy';
import { ArticleRepository } from '@/modules/article/application/ports/repositories/article.repository';

@Injectable()
export class SetArticleCommentsEnabledCommand {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articlePolicy: ArticlePolicy,
  ) {}

  async execute(user: User, articleId: string, enabled: boolean): Promise<void> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) throw new AppError('ARTICLE_NOT_FOUND');

    this.articlePolicy.canUpdate(user, article.authorId);
    article.setCommentsEnabled(enabled);

    const saved = await this.articleRepository.save(article);
    if (!saved) throw new AppError('ARTICLE_INVALID_STATUS');
  }
}
