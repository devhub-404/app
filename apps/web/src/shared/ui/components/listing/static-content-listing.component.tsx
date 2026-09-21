import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import { useI18n } from '@/shared/i18n/app';
import { translate as translateShared } from '@/shared/i18n';
import { syncSearchParam } from '@/shared/utils/search-params.util.ts';
import ListingFiltersMenu from './listing-filters-menu.component.tsx';
import ListingSearch from './listing-search.component.tsx';
import TagSelector, { type TagSelectorOption } from '@/shared/ui/components/forms/tag-selector.component.tsx';
import ListingViewToggle from './listing-view-toggle.component.tsx';
import ListingToolbar from './listing-toolbar.component.tsx';
import { parseSearchQuery } from '@/shared/ui/schemas/search.schema.ts';
import InfiniteScrollSentinel from './infinite-scroll-sentinel.component.tsx';

export type StaticContentListingItem = {
  id: string;
  title: string;
  description: string;
  logo?: string;
  category?: string;
  tags: string[];
  searchText?: string;
};

type Props = {
  items: StaticContentListingItem[];
  initialQuery: string;
  initialTags: string[];
  initialOptions: TagSelectorOption[];
  initialView?: 'grid' | 'list';
  basePath: string;
  label: string;
  searchPlaceholder: string;
  emptyMessage: string;
};

type SearchState = { query: string; tags: string[] };
const PAGE_SIZE = 12;

function StaticContentListing(props: Props) {
  const { t, locale } = useI18n();
  const [search, setSearch] = createStore<SearchState>({ query: props.initialQuery, tags: [...props.initialTags] });
  const [appliedQuery, setAppliedQuery] = createSignal(props.initialQuery);
  const [view, setView] = createSignal(props.initialView ?? 'grid');
  const [page, setPage] = createSignal(1);
  const requestDebounced = debounce((query: string) => setAppliedQuery(query), 500);

  const filtered = createMemo(() => {
    const query = appliedQuery().trim().toLocaleLowerCase();
    return props.items.filter((item) => {
      const searchable = [item.title, item.description, item.category, item.searchText, ...item.tags]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase();
      return (!query || searchable.includes(query)) && search.tags.every((tag) => item.tags.includes(tag));
    });
  });

  const updateUrl = (next: SearchState) => {
    const url = new URL(window.location.href);
    syncSearchParam(url, 'q', next.query || undefined);
    syncSearchParam(url, 'tags', next.tags.length ? next.tags.join(',') : undefined);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };

  createEffect(
    on(
      () => [search.query, search.tags.join(',')] as const,
      (next, previous) => {
        if (!previous) return;
        updateUrl(search);
        setPage(1);
        if (next[0] !== previous[0]) requestDebounced(search.query);
        else {
          requestDebounced.cancel();
          setAppliedQuery(search.query);
        }
      },
    ),
  );

  onMount(() => {
    const onPopState = () => {
      const parsed = parseSearchQuery(new URL(window.location.href).searchParams);
      requestDebounced.cancel();
      setSearch({ query: parsed.q, tags: parsed.tags });
      setAppliedQuery(parsed.q);
      setPage(1);
    };
    window.addEventListener('popstate', onPopState);
    onCleanup(() => window.removeEventListener('popstate', onPopState));
    onCleanup(requestDebounced.cancel);
  });

  const hrefFor = (id: string) => `${props.basePath}/${id.split('/').map(encodeURIComponent).join('/')}`;
  const visibleItems = createMemo(() => filtered().slice(0, page() * PAGE_SIZE));
  const loadMore = () => setPage((current) => current + 1);

  return (
    <section class="grid gap-5" aria-busy={false}>
      <ListingToolbar
        search={
          <ListingSearch
            query={search.query}
            placeholder={props.searchPlaceholder}
            onChange={(query) => setSearch({ query })}
          />
        }
        view={<ListingViewToggle view={view()} onChange={setView} />}
      >
        <ListingFiltersMenu>
          <TagSelector
            value={search.tags}
            initialOptions={props.initialOptions}
            remote={false}
            onChange={(tags) => setSearch({ tags })}
          />
        </ListingFiltersMenu>
      </ListingToolbar>

      <Show
        when={visibleItems().length > 0}
        fallback={
          <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
            {props.emptyMessage}
          </p>
        }
      >
        <div
          aria-label={props.label}
          class={view() === 'grid' ? 'grid gap-5 md:grid-cols-2' : 'grid grid-cols-1 gap-5'}
        >
          <For each={visibleItems()}>
            {(item) => (
              <article class="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface-elevated p-5 transition duration-standard ease-standard hover:-translate-y-0.5 hover:border-action-border">
                <div class="flex items-start gap-3">
                  {item.logo && (
                    <span class="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-subtle p-1.5">
                      <img
                        src={item.logo}
                        alt={`${item.title} logo`}
                        class="size-full object-contain"
                        width="96"
                        height="96"
                      />
                    </span>
                  )}
                  <div class="flex min-w-0 flex-1 items-center gap-3 pt-1 text-xs font-semibold uppercase tracking-[.16em] text-content-muted">
                    <span>{props.label}</span>
                    {item.category && <span>{item.category}</span>}
                  </div>
                </div>
                <h2 class="heading-subsection text-xl">
                  <a href={hrefFor(item.id)} class="hover:text-content-accent">
                    {item.title}
                  </a>
                </h2>
                <p class="text-muted-body flex-1">
                  {item.description}
                </p>
                <div class="flex flex-wrap gap-2">
                  <For each={item.tags}>
                    {(tag) => (
                      <span class="rounded-full bg-surface-subtle px-2.5 py-1 text-xs text-content-muted">{tag}</span>
                    )}
                  </For>
                </div>
                <a href={hrefFor(item.id)} class="text-sm font-semibold text-content-accent">
                  {t('content.read')}
                </a>
              </article>
            )}
          </For>
        </div>
      </Show>

      <Show when={visibleItems().length > 0 && visibleItems().length < filtered().length}>
        <InfiniteScrollSentinel
          hasMore={visibleItems().length < filtered().length}
          loading={false}
          onLoadMore={loadMore}
          label={translateShared(locale(), 'listing.loadingMore')}
        />
      </Show>
    </section>
  );
}

export default StaticContentListing;
