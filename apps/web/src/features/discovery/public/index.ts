export { default as RelatedContent } from '../ui/components/related-content.component.tsx';
export { loadPopular, loadRecent, loadRelated, loadTrending, searchDiscovery } from '../actions/discovery.action.ts';
export type { FeedQuery, PopularQuery, RecentQuery, SearchQuery, TrendingQuery } from '../actions/discovery.action.ts';
export type { DiscoveryItem, DiscoveryPage, DiscoveryType } from '../types/discovery.type.ts';
export { default as FeedPage } from '../ui/pages/feed.page.astro';
export { feedItemHref, feedItemLabelKey } from '../ui/components/feed-item-utils.component.ts';
