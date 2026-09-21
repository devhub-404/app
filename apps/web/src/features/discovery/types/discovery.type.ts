import type { components, paths } from '@devhub-404/api-contract';

export type DiscoveryItem = components['schemas']['DiscoveryItemDTO'];
export type DiscoveryPage = components['schemas']['SearchExploreOutputDTO'];
export type DiscoveryType = DiscoveryItem['type'];

export type SearchQuery = NonNullable<paths['/api/v1/discovery/search']['get']['parameters']['query']>;
export type FeedQuery = NonNullable<paths['/api/v1/discovery/feed']['get']['parameters']['query']>;
export type TrendingQuery = NonNullable<paths['/api/v1/discovery/trending']['get']['parameters']['query']>;
export type PopularQuery = NonNullable<paths['/api/v1/discovery/popular']['get']['parameters']['query']>;
export type RecentQuery = NonNullable<paths['/api/v1/discovery/recent']['get']['parameters']['query']>;
