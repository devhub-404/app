import { ArrowDownUp, CalendarDays } from 'lucide-solid';
import { debounce } from '@utilify/core';
import type { ArticleItem } from '@/features/article/types/article.type.ts';
import { listArticlesQuery } from '@/features/article/actions/article.action.ts';
import ArticleListingCard from './article-listing-card.component.tsx';
import { useI18n } from '@/features/article/i18n';
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
import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { toArticleQuery, parseArticleListingUrl, type ArticleListingFilters, type ArticleListingPeriod, type ArticleListingSort, type ArticleListingView } from '../utils/article-listing-query.util.ts';
type ListingView = ArticleListingView;
type ListingFilters = ArticleListingFilters;
type ListingState = ListingFilters;
type ListingResult = { items: ArticleItem[]; total: number; error: boolean };

type Props = {
  initialItems: ArticleItem[];
  initialTotal: number;
  initialError: boolean;
  initialResolved?: boolean;
  initialState: ListingState;
  initialView: ListingView;
  popularTags?: { slug: string; name: string }[];
  pageSize: number;
  contextual?: boolean;
};

function ArticlesListing(props: Props) {
  const { t, locale } = useI18n();
  const initialList: ListingResult = {
    items: props.initialItems,
    total: props.initialTotal,
    error: props.initialError,
  };
  const [search, setSearch] = createStore<ListingFilters>(props.initialState);
  const [view, setView] = createSignal(props.initialView);
  const listing = createInfiniteListing<ArticleItem, ListingFilters>({
    initial: initialList,
    initialPage: props.initialState.page,
    initialResolved: props.initialResolved,
    getKey: (article) => article.id,
    loadPage: async (next, signal) => {
      try {
        const response = await listArticlesQuery(toArticleQuery(next, props.pageSize), undefined, { signal });
        return { items: response.items, total: response.total, error: Boolean(response.error) };
      } catch {
        return { items: [], total: 0, error: true };
      }
    },
  });
  const requestDebounced = debounce((next: ListingFilters) => void listing.replace(next), 300);

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
    const onPopState = () => {
      const next = parseArticleListingUrl(new URL(window.location.href));
      setSearch(next);
    };
    window.addEventListener('popstate', onPopState);
    onCleanup(() => window.removeEventListener('popstate', onPopState));
    onCleanup(requestDebounced.cancel);
    onCleanup(listing.cancel);
  });

  const loadMore = () => void listing.loadMore({ ...search, tags: [...search.tags] });

  return (
    <section class="grid gap-5" aria-busy={listing.loading()}>
      <Show when={!props.contextual}>
        <ListingToolbar
          search={
            <ListingSearch
              query={search.query}
              placeholder={t('listing.search')}
              onChange={(query) => setSearch({ query, page: 1 })}
            />
          }
          view={
            <ListingViewToggle
              view={view()}
              onChange={(nextView) => {
                setView(nextView);
              }}
            />
          }
        >
          <ListingFiltersMenu>
            <TagSelector
              value={search.tags}
              initialOptions={props.popularTags}
              onChange={(tags) => setSearch({ tags, page: 1 })}
            />
            <ListingSelect
              id="articles-sort"
              value={search.sort}
              options={[
                { value: 'recent', label: t('article.sortRecent') },
                { value: 'votes', label: t('article.sortVotes') },
                { value: 'views', label: t('article.sortViews') },
                { value: 'comments', label: t('article.sortComments') },
              ]}
              onChange={(value) => setSearch({ sort: value as ArticleListingSort, page: 1 })}
              icon={ArrowDownUp}
              ariaLabel={t('listing.sort')}
            />
            <ListingSelect
              id="articles-period"
              value={search.period}
              options={[
                { value: 'all', label: t('listing.periodAll') },
                { value: 'day', label: t('listing.lastDay') },
                { value: 'week', label: t('listing.lastWeek') },
                { value: 'month', label: t('listing.lastMonth') },
                { value: 'year', label: t('listing.lastYear') },
              ]}
              onChange={(value) => setSearch({ period: value as ArticleListingPeriod, page: 1 })}
              icon={CalendarDays}
              ariaLabel={t('listing.period')}
            />
          </ListingFiltersMenu>
        </ListingToolbar>
      </Show>

      <Show when={listing.error() && !listing.loading()}>
        <p role="alert" class="text-danger rounded-xl border border-danger/30 bg-danger/5 p-4">
          {t('listing.couldNotLoad')}
        </p>
      </Show>
      <Show
        when={listing.items().length > 0}
        fallback={
          <Show when={!listing.loading() && !listing.error()}>
            <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
              {t('listing.noArticles')}
            </p>
          </Show>
        }
      >
        <div
          class={
            view() === 'grid' ? 'grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4' : 'grid grid-cols-1 gap-5'
          }
        >
          <For each={listing.items()}>{(article) => <ArticleListingCard article={article} view={view()} />}</For>
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

export type { ListingState as ArticlesListingState };
export default ArticlesListing;
