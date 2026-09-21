import { Injectable } from '@nestjs/common';
import { ArticleQueryRepository } from '@/modules/article/application/ports/repositories/article.query.repository';
import { ArticleRepository } from '@/modules/article/application/ports/repositories/article.repository';
import { AppError } from '@/shared/errors/app-error';
import { DomainError } from '@/shared/errors/domain-error';
import {
  ArticlePublicServicePort,
  type ArticlePublicContribution,
} from '@/modules/article/public/article-public.service.port';

@Injectable()
export class ArticlePublicService implements ArticlePublicServicePort {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly articleQueries: ArticleQueryRepository,
  ) {}

  async listPublishedByAuthor(accountId: string, limit = 20): Promise<ArticlePublicContribution[]> {
    const page = await this.articleQueries.searchByAuthor(accountId, {
      page: 1,
      pageSize: Math.min(50, Math.max(1, limit)),
    });

    return page.items
      .filter((item) => item.status === 'published' && item.hiddenAt === null && item.deletedAt === null)
      .map((item) => ({
        id: item.id,
        type: 'article' as const,
        title: item.title,
        slug: item.slug,
        occurredAt: item.publishedAt,
      }));
  }

  listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>> {
    return this.articleQueries.listHiddenForModeration();
  }

  async resolveAccess(articleId: string) {
    const article = await this.articleQueries.findOperationalStateById(articleId);
    if (!article) return null;

    return {
      isPublic: article.status === 'published' && article.hiddenAt === null && article.deletedAt === null,
      commentsEnabled: article.commentsEnabled,
      ownerAccountId: article.authorId,
    };
  }

  async applyModerationAction(articleId: string, action: 'hide_article', reason?: string | null): Promise<void> {
    const article = await this.articleRepository.findById(articleId);
    if (!article) throw new AppError('ARTICLE_NOT_FOUND');
    if (action !== 'hide_article' || article.deletedAt) throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');
    if (article.hiddenAt) return;
    try {
      article.hide(reason?.trim() || 'Article ocultado por Moderation.');
    } catch (error) {
      if (error instanceof DomainError) throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');

      throw error;
    }
    const saved = await this.articleRepository.save(article);
    if (!saved) {
      const current = await this.articleRepository.findById(articleId);
      if (current?.hiddenAt && !current.deletedAt) return;

      throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');
    }
  }

  async unhideArticle(articleId: string): Promise<void> {
    const article = await this.articleRepository.findById(articleId);
    if (!article || article.deletedAt || !article.hiddenAt) throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');
    article.unhide();
    if (!(await this.articleRepository.save(article))) {
      throw new AppError('MODERATION_ACTION_NOT_SUPPORTED');
    }
  }

  async resolveReviewAccess(articleId: string) {
    const article = await this.articleQueries.findOperationalStateById(articleId);
    if (!article) return null;

    return { authorAccountId: article.authorId, hiddenAt: article.hiddenAt, deletedAt: article.deletedAt };
  }
}
