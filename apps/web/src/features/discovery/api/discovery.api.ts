import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult } from '@/shared/api';
import type {
  DiscoveryPage,
  FeedQuery,
  PopularQuery,
  RecentQuery,
  SearchQuery,
  TrendingQuery,
} from '@/features/discovery/types/discovery.type.ts';

export class DiscoveryApi {
  static search(query: SearchQuery, client: ApiClient = publicClient): Promise<ApiResult<DiscoveryPage>> {
    return client.GET('/api/v1/discovery/search', { params: { query } });
  }

  static feed(query: FeedQuery, client: ApiClient = publicClient): Promise<ApiResult<DiscoveryPage>> {
    return client.GET('/api/v1/discovery/feed', { params: { query } });
  }

  static trending(query: TrendingQuery, client: ApiClient = publicClient): Promise<ApiResult<DiscoveryPage>> {
    return client.GET('/api/v1/discovery/trending', {
      params: { query },
    });
  }

  static popular(query: PopularQuery, client: ApiClient = publicClient): Promise<ApiResult<DiscoveryPage>> {
    return client.GET('/api/v1/discovery/popular', { params: { query } });
  }

  static recent(query: RecentQuery, client: ApiClient = publicClient): Promise<ApiResult<DiscoveryPage>> {
    return client.GET('/api/v1/discovery/recent', { params: { query } });
  }

  static related(resourceId: string, limit = 4, client: ApiClient = publicClient): Promise<ApiResult<DiscoveryPage>> {
    return client.GET('/api/v1/discovery/related/{resourceId}', {
      params: { path: { resourceId }, query: { limit } },
    });
  }
}
