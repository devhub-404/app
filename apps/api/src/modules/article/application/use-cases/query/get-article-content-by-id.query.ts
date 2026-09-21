import { Injectable } from '@nestjs/common';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { ArticleContentDTO } from '@/modules/article/application/dtos/out';
import { AppError } from '@/shared/errors/app-error';
import { ArticlePolicy } from '@/modules/article/application/article.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { Role } from '@/shared/kernel/auth/role';

@Injectable()
export class GetArticleContentByIdQuery {
  constructor(
    private readonly articleQueryRepository: ArticleQueryRepository,
    private readonly articlePolicy: ArticlePolicy,
  ) {}

  async execute(userId: string, id: string, role: Role | null = null): Promise<ArticleContentDTO> {
    const article = await this.articleQueryRepository.findContentById(id);
    if (!article || article.deletedAt) throw new AppError('ARTICLE_NOT_FOUND');

    this.articlePolicy.canReadContent({ sub: userId, role } satisfies User, article);

    return { id: article.id, content: article.content, contentVersion: article.contentVersion };
  }
}
