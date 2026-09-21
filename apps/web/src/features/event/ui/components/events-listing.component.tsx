import { ArrowDownUp, CalendarClock, Monitor } from 'lucide-solid';
import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import type { Event, ListEventsQuery } from '@/features/event/types/event.type.ts';
import { listEventsQuery } from '@/features/event/actions/event.action.ts';
import { useI18n } from '@/features/event/i18n';
import { translate as translateShared } from '@/shared/i18n';
import { createInfiniteListing } from '@/shared/utils/create-infinite-listing.util.ts';
import { syncSearchParam } from '@/shared/utils/search-params.util.ts';
import ListingSearch from '@/shared/ui/components/listing/listing-search.component.tsx';
import ListingFiltersMenu from '@/shared/ui/components/listing/listing-filters-menu.component.tsx';
import ListingViewToggle from '@/shared/ui/components/listing/listing-view-toggle.component.tsx';
import ListingSelect from '@/shared/ui/components/listing/listing-select.component.tsx';
import ListingToolbar from '@/shared/ui/components/listing/listing-toolbar.component.tsx';
import EventListingCard from './event-listing-card.component.tsx';
import InfiniteScrollSentinel from '@/shared/ui/components/listing/infinite-scroll-sentinel.component.tsx';
import { parseListingSearch } from '@/shared/ui/schemas/search.schema.ts';
import { eventSearchSchema } from '@/features/event/ui/schemas/search.schema.ts';

type ListingView = 'grid' | 'list';
type TemporalState = 'upcoming' | 'ongoing' | 'ended';
type EventFormat = 'online' | 'in_person' | 'hybrid';
type EventSort = 'upcoming' | 'recent';
type ListingFilters = {
  query: string;
  temporalState?: TemporalState;
  format?: EventFormat;
  sort: EventSort;
  page: number;
};
type ListingResult = { items: Event[]; total: number; error: boolean };

type Props = {
  initialItems: Event[];
  initialTotal: number;
  initialError: boolean;
  initialResolved?: boolean;
  initialState: ListingFilters;
  initialView: ListingView;
  pageSize: number;
};

const parseFilters = (url: URL, fallbackPage: number): ListingFilters => {
  const base = parseListingSearch(url.searchParams, fallbackPage);
  const parsed = eventSearchSchema.parse({ ...base, temporalState: url.searchParams.get('temporalState'), format: url.searchParams.get('format'), sort: url.searchParams.get('sort') });
  return {
    query: base.query,
    temporalState: parsed.temporalState,
    format: parsed.format,
    sort: parsed.sort,
    page: base.page,
  };
};

const toEventsQuery = (filters: ListingFilters, pageSize: number): ListEventsQuery => ({
  page: filters.page,
  pageSize,
  search: filters.query || undefined,
  temporalState: filters.temporalState,
  format: filters.format,
  sort: filters.sort === 'upcoming' ? undefined : filters.sort,
});

function EventsListing(props: Props) {
  const { t, locale } = useI18n();
  const initialList: ListingResult = {
    items: props.initialItems,
    total: props.initialTotal,
    error: props.initialError,
  };
  const [search, setSearch] = createStore<ListingFilters>(props.initialState);
  const [view, setView] = createSignal(props.initialView);
  const listing = createInfiniteListing<Event, ListingFilters>({
    initial: initialList,
    initialPage: props.initialState.page,
    initialResolved: props.initialResolved,
    getKey: (event) => event.id,
    loadPage: async (next) => {
      try {
        const response = await listEventsQuery(toEventsQuery(next, props.pageSize));
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
    syncSearchParam(url, 'temporalState', next.temporalState);
    syncSearchParam(url, 'format', next.format);
    syncSearchParam(url, 'sort', next.sort === 'upcoming' ? undefined : next.sort);
    syncSearchParam(url, 'page', next.page > 1 ? String(next.page) : undefined);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };

  createEffect(
    on(
      () => [search.query, search.temporalState, search.format, search.sort, search.page] as const,
      (next, previous) => {
        if (!previous) return;
        updateUrl(search);
        if (next[0] !== previous[0]) requestDebounced({ ...search });
        else {
          requestDebounced.cancel();
          void listing.replace({ ...search });
        }
      },
    ),
  );

  onMount(() => {
    void listing.loadInitial({ ...search });
    const onPopState = () => setSearch(parseFilters(new URL(window.location.href), search.page));
    window.addEventListener('popstate', onPopState);
    onCleanup(() => window.removeEventListener('popstate', onPopState));
    onCleanup(requestDebounced.cancel);
  });

  const loadMore = () => void listing.loadMore({ ...search });

  return (
    <section class="grid gap-5" aria-busy={listing.loading()}>
      <ListingToolbar
        search={
          <ListingSearch
            query={search.query}
            placeholder={t('events.search')}
            onChange={(query) => setSearch({ query, page: 1 })}
          />
        }
        view={<ListingViewToggle view={view()} onChange={setView} />}
      >
        <ListingFiltersMenu>
          <ListingSelect
            id="events-temporal-state"
            value={search.temporalState ?? ''}
            options={[
              { value: '', label: t('events.allEvents') },
              { value: 'upcoming', label: t('events.upcoming') },
              { value: 'ongoing', label: t('events.ongoing') },
              { value: 'ended', label: t('events.ended') },
            ]}
            onChange={(value) =>
              setSearch({ temporalState: (value || undefined) as TemporalState | undefined, page: 1 })
            }
            icon={CalendarClock}
            ariaLabel={t('events.filterByTime')}
          />
          <ListingSelect
            id="events-format"
            value={search.format ?? ''}
            options={[
              { value: '', label: t('events.allFormats') },
              { value: 'online', label: t('events.online') },
              { value: 'in_person', label: t('events.onsite') },
              { value: 'hybrid', label: t('events.hybrid') },
            ]}
            onChange={(value) => setSearch({ format: (value || undefined) as EventFormat | undefined, page: 1 })}
            icon={Monitor}
            ariaLabel={t('events.format')}
          />
          <ListingSelect
            id="events-sort"
            value={search.sort}
            options={[
              { value: 'upcoming', label: t('events.upcoming') },
              { value: 'recent', label: t('events.recent') },
            ]}
            onChange={(value) => setSearch({ sort: value as EventSort, page: 1 })}
            icon={ArrowDownUp}
            ariaLabel={t('events.sort')}
          />
        </ListingFiltersMenu>
      </ListingToolbar>

      <Show when={listing.error() && !listing.loading()}>
        <p role="alert" class="text-danger rounded-xl border border-danger/30 bg-danger/5 p-4">
          {t('events.couldNotLoadEvents')}
        </p>
      </Show>
      <Show
        when={listing.items().length > 0}
        fallback={
          <Show when={!listing.loading() && !listing.error()}>
            <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
              {t('events.noEventAvailableNow')}
            </p>
          </Show>
        }
      >
        <div class={view() === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'grid grid-cols-1 gap-4'}>
          <For each={listing.items()}>{(event) => <EventListingCard event={event} view={view()} />}</For>
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

export type { ListingFilters as EventsListingState };
export default EventsListing;
