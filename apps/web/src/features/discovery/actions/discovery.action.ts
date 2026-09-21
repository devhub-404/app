import { DiscoveryApi } from '@/features/discovery/api/discovery.api.ts';
import type { ApiClient } from '@/shared/api';
import type {
  DiscoveryPage,
  PopularQuery,
  RecentQuery,
  SearchQuery,
  TrendingQuery,
} from '@/features/discovery/types/discovery.type.ts';

export type {
  FeedQuery,
  PopularQuery,
  RecentQuery,
  SearchQuery,
  TrendingQuery,
} from '@/features/discovery/types/discovery.type.ts';

function unwrap(result: Awaited<ReturnType<typeof DiscoveryApi.search>>): DiscoveryPage {
  const data = result.data?.data;
  if (!data) throw new Error(result.error?.code ?? 'DISCOVERY_UNAVAILABLE');
  return data;
}

export async function searchDiscovery(query: SearchQuery, client?: ApiClient): Promise<DiscoveryPage> {
  return unwrap(await DiscoveryApi.search(query, client));
}

export async function loadTrending(query: TrendingQuery, client?: ApiClient): Promise<DiscoveryPage> {
  return unwrap(await DiscoveryApi.trending(query, client));
}

export async function loadPopular(query: PopularQuery, client?: ApiClient): Promise<DiscoveryPage> {
  return unwrap(await DiscoveryApi.popular(query, client));
}

export async function loadRecent(query: RecentQuery, client?: ApiClient): Promise<DiscoveryPage> {
  return unwrap(await DiscoveryApi.recent(query, client));
}

export async function loadRelated(resourceId: string, limit = 4): Promise<DiscoveryPage> {
  const result = await DiscoveryApi.related(resourceId, limit);
  const data = result.data?.data;
  if (!data) throw new Error(result.error?.code ?? 'DISCOVERY_UNAVAILABLE');
  return data;
}
