import { ArrowDownUp, CalendarDays } from 'lucide-solid';
import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import type { NewsItem } from '@/features/news/types/news.dto.type.ts';
import { listNews } from '@/features/news/actions/news.action.ts';
import NewsListingCard from './news-listing-card.component.tsx';
import { useI18n } from '@/features/news/i18n';
import { translate as translateShared } from '@/shared/i18n';
import { createInfiniteListing } from '@/shared/utils/create-infinite-listing.util.ts';
import { syncSearchParam } from '@/shared/utils/search-params.util.ts';
import ListingSearch from '@/shared/ui/components/listing/listing-search.component.tsx';
import ListingFiltersMenu from '@/shared/ui/components/listing/listing-filters-menu.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import ListingViewToggle from '@/shared/ui/components/listing/listing-view-toggle.component.tsx';
import ListingSelect from '@/shared/ui/components/listing/listing-select.component.tsx';
import ListingToolbar from '@/shared/ui/components/listing/listing-toolbar.component.tsx';
import InfiniteScrollSentinel from '@/shared/ui/components/listing/infinite-scroll-sentinel.component.tsx';
import { parseListingSearch } from '@/shared/ui/schemas/search.schema.ts';
import { newsSearchSchema } from '@/features/news/ui/schemas/search.schema.ts';
import {
  toNewsQuery,
  type NewsListingFilters,
  type NewsListingPeriod,
  type NewsListingSort,
} from '../utils/news-listing-query.util.ts';

type ListingView = 'grid' | 'list';
type ListingFilters = NewsListingFilters;
type ListingState = ListingFilters;
type ListingResult = { items: NewsItem[]; total: number; error: boolean };

type Props = {
  initialItems: NewsItem[];
  initialTotal: number;
  initialError: boolean;
  initialResolved?: boolean;
  initialState: ListingState;
  initialView: ListingView;
  pageSize: number;
  contextual?: boolean;
};

const parseFilters = (url: URL, fallbackPage: number): ListingFilters => {
  const base = parseListingSearch(url.searchParams, fallbackPage);
  const parsed = newsSearchSchema.parse({ ...base, sort: url.searchParams.get('sort'), period: url.searchParams.get('period') });
  return {
    query: base.query,
    tags: base.tags,
    sort: parsed.sort,
    period: parsed.period,
    page: base.page,
  };
};

function NewsListing(props: Props) {
  const { t, locale } = useI18n();
  const initialList: ListingResult = {
    items: props.initialItems,
    total: props.initialTotal,
    error: props.initialError,
  };
  const [search, setSearch] = createStore<ListingFilters>(props.initialState);
  const [view, setView] = createSignal(props.initialView);
  const listing = createInfiniteListing<NewsItem, ListingFilters>({
    initial: initialList,
    initialPage: props.initialState.page,
    initialResolved: props.initialResolved,
    getKey: (news) => news.id,
    loadPage: async (next) => {
      try {
        const response = await listNews(toNewsQuery(next, props.pageSize));
        return {
          items: response.items,
          total: response.total || response.items.length,
          error: Boolean(response.error),
        };
      } catch {
        return { items: [], total: 0, error: true };
      }
    },
  });
  const requestDebounced = debounce((next: ListingFilters) => void listing.replace(next), 500);

  const updateUrl = (next: ListingFilters) => {
    const url = new URL(window.location.href);
    syncSearchParam(url, 'q', next.query || undefined);
    syncSearchParam(url, 'tags', next.tags.length ? next.tags.join(',') : undefined);
    syncSearchParam(url, 'sort', next.sort === 'recent' ? undefined : next.sort);
    syncSearchParam(url, 'period', next.period === 'all' ? undefined : next.period);
    syncSearchParam(url, 'page', next.page > 1 ? String(next.page) : undefined);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };

  createEffect(
    on(
      () => [search.query, search.tags.join(','), search.sort, search.period, search.page] as const,
      (next, previous) => {
        if (!previous) return;

        updateUrl(search);

        if (next[0] !== previous?.[0]) requestDebounced({ ...search, tags: [...search.tags] });
        else {
          requestDebounced.cancel();
          void listing.replace({ ...search, tags: [...search.tags] });
        }
      },
    ),
  );

  onMount(() => {
    void listing.loadInitial({ ...search, tags: [...search.tags] });
    const url = new URL(window.location.href);
    let changed = false;
    for (const key of ['source']) {
      if (!url.searchParams.has(key)) continue;
      syncSearchParam(url, key);
      changed = true;
    }
    if (changed) {
      window.history.replaceState({}, '', `${url.pathname}${url.search}`);
    }

    const onPopState = () => {
      const next = parseFilters(new URL(window.location.href), search.page);
      setSearch(next);
    };
    window.addEventListener('popstate', onPopState);
    onCleanup(() => window.removeEventListener('popstate', onPopState));
    onCleanup(requestDebounced.cancel);
  });

  const loadMore = () => void listing.loadMore({ ...search, tags: [...search.tags] });

  return (
    <section class="grid gap-5" aria-busy={listing.loading()}>
      <Show when={!props.contextual}>
        <ListingToolbar
          search={
            <ListingSearch
              query={search.query}
              placeholder={t('news.searchNewsOrTags')}
              onChange={(query) => setSearch({ query, page: 1 })}
            />
          }
          view={<ListingViewToggle view={view()} onChange={setView} />}
        >
          <ListingFiltersMenu>
            <TagSelector value={search.tags} onChange={(tags) => setSearch({ tags, page: 1 })} />
            <ListingSelect
              id="news-sort"
              value={search.sort}
              options={[
                { value: 'recent', label: t('news.moreRecent') },
                { value: 'oldest', label: t('news.moreOld') },
              ]}
              onChange={(value) => setSearch({ sort: value as NewsListingSort, page: 1 })}
              icon={ArrowDownUp}
              ariaLabel={t('news.order')}
            />
            <ListingSelect
              id="news-period"
              value={search.period}
              options={[
                { value: 'all', label: t('news.periodAll') },
                { value: 'day', label: t('news.periodDay') },
                { value: 'week', label: t('news.periodWeek') },
                { value: 'month', label: t('news.periodMonth') },
                { value: 'year', label: t('news.periodYear') },
              ]}
              onChange={(value) => setSearch({ period: value as NewsListingPeriod, page: 1 })}
              icon={CalendarDays}
              ariaLabel={t('news.filtersNews')}
            />
          </ListingFiltersMenu>
        </ListingToolbar>
      </Show>

      <Show when={listing.error() && !listing.loading()}>
        <p role="alert" class="text-danger rounded-xl border border-danger/30 bg-danger/5 p-4">
          {t('news.couldNotLoadNews')}
        </p>
      </Show>
      <Show
        when={listing.items().length > 0}
        fallback={
          <Show when={!listing.loading() && !listing.error()}>
            <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
              {t('news.noNewsMatchesFilters')}
            </p>
          </Show>
        }
      >
        <div
          class={
            view() === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid grid-cols-1 gap-5'
          }
        >
          <For each={listing.items()}>{(news) => <NewsListingCard news={news} view={view()} />}</For>
        </div>
      </Show>

      <Show when={listing.items().length > 0 && listing.hasMore()}>
        <InfiniteScrollSentinel
          hasMore={listing.hasMore()}
          loading={listing.loading()}
          onLoadMore={loadMore}
          label={translateShared(locale(), 'listing.loadingMore')}
        />
      </Show>
    </section>
  );
}

export type { ListingState as NewsListingState };
export default NewsListing;
