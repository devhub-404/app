export { default as ArticlePage } from '../ui/pages/article.page.astro';
export { default as ArticleEditPage } from '../ui/pages/article-edit.page.astro';
export { default as ArticleNewPage } from '../ui/pages/article-new.page.astro';
export { default as ArticlesPage } from '../ui/pages/articles.page.astro';

export { translate } from '../i18n';
export type { ArticleDetails, ArticleItem } from '../types/article.type.ts';

export {
  deleteArticle,
  getArticleBySlugQuery,
  listArticlesForModeration,
  listArticlesQuery,
  listPopularArticleTagsQuery,
  loadMyArticles,
  resolveArticleHrefById,
} from '../actions/article.action.ts';
export type { ListArticlesQuery } from '../actions/article.action.ts';

export { useArticleInteractions } from '../ui/hooks/use-article-interactions.hook.ts';
export { default as ArticleSummaryCard } from '../ui/components/card/article-summary-card.component.tsx';
export { default as ArticlesListing } from '../ui/components/articles-listing.component.tsx';
export type { ArticlesListingState } from '../ui/components/articles-listing.component.tsx';
