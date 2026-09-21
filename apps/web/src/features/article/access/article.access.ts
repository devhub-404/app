import { canModerate, type Actor } from '../../auth/public/access.ts';

type ArticleAccessSubject = {
  authorAccountId: string | null;
};

export function isArticleAuthor(article: ArticleAccessSubject, actor: Actor): boolean {
  return Boolean(actor.accountId && article.authorAccountId === actor.accountId);
}

export function canEditArticle(article: ArticleAccessSubject, actor: Actor): boolean {
  return isArticleAuthor(article, actor);
}

export function canPublishArticle(article: ArticleAccessSubject, actor: Actor): boolean {
  return canEditArticle(article, actor);
}

export function canArchiveArticle(article: ArticleAccessSubject, actor: Actor): boolean {
  return canEditArticle(article, actor);
}

export function canUnarchiveArticle(article: ArticleAccessSubject, actor: Actor): boolean {
  return canEditArticle(article, actor);
}

export function canDeleteArticle(article: ArticleAccessSubject, actor: Actor): boolean {
  return actor.role === 'admin' || isArticleAuthor(article, actor);
}

export function canModerateArticles(actor: Actor): boolean {
  return canModerate(actor);
}

export function canSaveArticleDraft(actor: Actor): boolean {
  return Boolean(actor.accountId);
}
