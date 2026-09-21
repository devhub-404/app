export type ArticleLifecycleState = 'draft' | 'published' | 'archived';

type ArticleLifecycleSubject = {
  status: ArticleLifecycleState;
  hiddenAt?: string | null;
};

export function isArticlePublishable(article: ArticleLifecycleSubject): boolean {
  return article.status === 'draft' && !article.hiddenAt;
}

export function isArticleArchivable(article: ArticleLifecycleSubject): boolean {
  return article.status === 'published' && !article.hiddenAt;
}

export function isArticleUnarchivable(article: ArticleLifecycleSubject): boolean {
  return article.status === 'archived' && !article.hiddenAt;
}
