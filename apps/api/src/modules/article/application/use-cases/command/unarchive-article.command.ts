import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ArticleRepository } from '@/modules/article/application/ports/repositories/article.repository';
import { ArticlePolicy } from '@/modules/article/application/article.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';

@Injectable()
export class UnarchiveArticleCommand {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articlePolicy: ArticlePolicy,
  ) {}

  async execute(user: User, id: string): Promise<void> {
    const article = await this.articleRepository.findById(id);
    if (!article) throw new AppError('ARTICLE_NOT_FOUND');
    this.articlePolicy.canUpdate(user, article.authorId);
    article.unarchive();
    if (!(await this.articleRepository.save(article))) {
      throw new AppError('ARTICLE_INVALID_STATUS');
    }
  }
}
