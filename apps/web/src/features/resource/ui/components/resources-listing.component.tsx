import { createEffect, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import type { ResourceItem } from '@/features/resource/types/resource.type.ts';
import { listResources } from '@/features/resource/actions/resource.action.ts';
import ResourceCard from './card/resource-card.component.tsx';
import { useI18n } from '@/features/resource/i18n';
import { translate as translateShared } from '@/shared/i18n';
import { createInfiniteListing } from '@/shared/utils/create-infinite-listing.util.ts';
import { syncSearchParam } from '@/shared/utils/search-params.util.ts';
import ListingSearch from '@/shared/ui/components/listing/listing-search.component.tsx';
import ListingFiltersMenu from '@/shared/ui/components/listing/listing-filters-menu.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import ListingToolbar from '@/shared/ui/components/listing/listing-toolbar.component.tsx';
import InfiniteScrollSentinel from '@/shared/ui/components/listing/infinite-scroll-sentinel.component.tsx';
import { parseListingSearch } from '@/shared/ui/schemas/search.schema.ts';
import { resourceSearchSchema } from '@/features/resource/ui/schemas/search.schema.ts';

type ListingFilters = { query: string; tags: string[]; page: number };
type ListingResult = { items: ResourceItem[]; total: number; error: boolean };

type Props = {
  initialItems: ResourceItem[];
  initialTotal: number;
  initialError: boolean;
  initialResolved?: boolean;
  initialState: ListingFilters;
  pageSize: number;
  contextual?: boolean;
};

const parseFilters = (url: URL, fallbackPage: number): ListingFilters => {
  const base = parseListingSearch(url.searchParams, fallbackPage);
  const parsed = resourceSearchSchema.parse(base);
  return {
    query: parsed.query,
    tags: parsed.tags,
    page: parsed.page,
  };
};

function ResourcesListing(props: Props) {
  const { t, locale } = useI18n();
  const initialList: ListingResult = {
    items: props.initialItems,
    total: props.initialTotal,
    error: props.initialError,
  };
  const [search, setSearch] = createStore<ListingFilters>(props.initialState);
  const listing = createInfiniteListing<ResourceItem, ListingFilters>({
    initial: initialList,
    initialPage: props.initialState.page,
    initialResolved: props.initialResolved,
    getKey: (resource) => resource.id,
    loadPage: async (next) => {
      try {
        const response = await listResources({
          query: next.query || undefined,
          tags: next.tags,
          page: next.page,
          pageSize: props.pageSize,
          sort: 'votes',
        });
        return { items: response.items, total: response.total, error: Boolean(response.error) };
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
    syncSearchParam(url, 'page', next.page > 1 ? String(next.page) : undefined);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };

  createEffect(
    on(
      () => [search.query, search.tags.join(','), search.page] as const,
      (next, previous) => {
        if (!previous) return;
        updateUrl(search);
        if (next[0] !== previous[0]) requestDebounced({ ...search, tags: [...search.tags] });
        else {
          requestDebounced.cancel();
          void listing.replace({ ...search, tags: [...search.tags] });
        }
      },
    ),
  );

  onMount(() => {
    void listing.loadInitial({ ...search, tags: [...search.tags] });
    const onPopState = () => setSearch(parseFilters(new URL(window.location.href), search.page));
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
              placeholder={t('resources.searchResourcesSitesOrTags')}
              onChange={(query) => setSearch({ query, page: 1 })}
            />
          }
        >
          <ListingFiltersMenu>
            <TagSelector value={search.tags} onChange={(tags) => setSearch({ tags, page: 1 })} />
          </ListingFiltersMenu>
        </ListingToolbar>
      </Show>
      <Show when={listing.error() && !listing.loading()}>
        <p role="alert" class="text-danger rounded-xl border border-danger/30 bg-danger/5 p-4">
          {t('resources.couldNotLoadResources')}
        </p>
      </Show>
      <Show
        when={listing.items().length > 0}
        fallback={
          <Show when={!listing.loading() && !listing.error()}>
            <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
              {t('resources.noResourceMatchesFilters')}
            </p>
          </Show>
        }
      >
        <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <For each={listing.items()}>{(resource) => <ResourceCard item={resource} />}</For>
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

export type { ListingFilters as ResourcesListingState };
export default ResourcesListing;
