export type ArticleAccessSnapshot = { isPublic: boolean; commentsEnabled: boolean; ownerAccountId: string | null };

export type ArticlePublicContribution = {
  id: string;
  type: 'article';
  title: string;
  slug: string;
  occurredAt: string | null;
};

export abstract class ArticlePublicServicePort {
  abstract resolveAccess(articleId: string): Promise<ArticleAccessSnapshot | null>;
  abstract applyModerationAction(articleId: string, action: 'hide_article', reason?: string | null): Promise<void>;
  abstract unhideArticle(articleId: string): Promise<void>;
  abstract listHiddenForModeration(): Promise<Array<{ id: string; hiddenAt: string }>>;
  abstract resolveReviewAccess(articleId: string): Promise<{
    authorAccountId: string | null;
    hiddenAt: string | null;
    deletedAt: string | null;
  } | null>;
  abstract listPublishedByAuthor(accountId: string, limit?: number): Promise<ArticlePublicContribution[]>;
}

export const ARTICLE_PUBLIC_SERVICE = 'ARTICLE_PUBLIC_SERVICE';
