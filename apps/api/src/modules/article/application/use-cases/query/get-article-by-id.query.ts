import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { ArticleDTO } from '@/modules/article/application/dtos/out';
import { Role } from '@/shared/kernel/auth/role';
import { ArticleDetailProjection } from '@/modules/article/application/article-detail-projection';
import { ArticlePolicy } from '@/modules/article/application/article.policy';
import type { User } from '@/shared/kernel/auth/authenticated-user';

@Injectable()
export class GetArticleByIdQuery {
  constructor(
    private readonly articleQueryRepository: ArticleQueryRepository,
    private readonly articleDetailProjection: ArticleDetailProjection,
    private readonly articlePolicy: ArticlePolicy,
  ) {}

  async execute(userId: string, id: string, role: Role | null = null): Promise<ArticleDTO> {
    const article = await this.articleQueryRepository.findById(id);

    if (!article || article.deletedAt) throw new AppError('ARTICLE_NOT_FOUND');
    this.articlePolicy.canRead({ sub: userId, role } satisfies User, article);

    return this.articleDetailProjection.project(article);
  }
}
