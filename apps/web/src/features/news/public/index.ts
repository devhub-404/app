export { default as NewsArticlePage } from '../ui/pages/news-article.page.astro';
export { default as NewsPage } from '../ui/pages/news.page.astro';

export {
  listNews,
  loadNewsBySlug,
  loadMyNewsSuggestions,
  loadPopularNewsSources,
  loadPendingNewsSuggestions,
  acceptNewsSuggestion,
  rejectNewsSuggestion,
} from '../actions/news.action.ts';
export type { ListNewsQuery } from '../actions/news.action.ts';

export type { NewsDetails, NewsSuggestionDTO, NewsSourceDTO } from '../types/news.dto.type.ts';
export { canEditNews, canDeleteNews, canPublishNews, canArchiveNews, canUnarchiveNews } from '../access/news.access.ts';
export {
  isNewsPublic,
  isNewsPublishable,
  isNewsArchivable,
  isNewsUnarchivable,
  type NewsLifecycleState,
} from '../domain/news.domain.ts';
export { default as NewsEditPage } from '../ui/pages/news-edit.page.astro';
export { default as NewsNewPage } from '../ui/pages/news-new.page.astro';
export { default as NewsSuggestionPage } from '../ui/pages/news-suggestion.page.astro';
export { canAccessNewsEditorialPath, requiresNewsEditorialAccess } from '../access/route.access.ts';
export { catalogs, translate, useI18n, localeFromRequest, localeToHtmlLang } from '../i18n';
export type { Locale, TranslationKey } from '../i18n';

export { listNewsForManagement } from '../actions/news.action.ts';
export { setNewsCommentsEnabled } from '../actions/news.action.ts';

export { default as NewsListing } from '../ui/components/news-listing.component.tsx';
export type { NewsListingState } from '../ui/components/news-listing.component.tsx';
