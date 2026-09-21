import { ArrowDownUp, ExternalLink, GitBranch } from 'lucide-solid';
import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import { listProjectsQuery } from '@/features/project/actions/project.action.ts';
import type { ListProjectsQuery, Project } from '@/features/project/types/project.type.ts';
import { useI18n } from '@/features/project/i18n';
import { translate as translateShared } from '@/shared/i18n';
import { routes } from '@/shared/navigation/routes';
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
import { projectSearchSchema } from '@/features/project/ui/schemas/search.schema.ts';

type ListingView = 'grid' | 'list';
type ListingSort = 'recent' | 'title';
type ListingState = { query: string; tags: string[]; sort: ListingSort; page: number };
type ListingResult = { items: Project[]; total: number; error: boolean };

type Props = {
  initialItems: Project[];
  initialTotal: number;
  initialError: boolean;
  initialResolved?: boolean;
  initialState: ListingState;
  pageSize: number;
  contextual?: boolean;
};

const parseState = (url: URL, fallbackPage: number): ListingState => {
  const base = parseListingSearch(url.searchParams, fallbackPage);
  const parsed = projectSearchSchema.parse({ ...base, sort: url.searchParams.get('sort') });
  return {
    query: base.query,
    tags: base.tags,
    sort: parsed.sort,
    page: base.page,
  };
};

function ProjectsListing(props: Props) {
  const { t, locale } = useI18n();
  const initialList: ListingResult = {
    items: props.initialItems,
    total: props.initialTotal,
    error: props.initialError,
  };
  const [search, setSearch] = createStore<ListingState>(props.initialState);
  const [view, setView] = createSignal<ListingView>('grid');
  const listing = createInfiniteListing<Project, ListingState>({
    initial: initialList,
    initialPage: props.initialState.page,
    initialResolved: props.initialResolved,
    getKey: (project) => project.id,
    loadPage: async (next) => {
      try {
        const query: ListProjectsQuery = {
          search: next.query || undefined,
          tags: next.tags.length ? next.tags.join(',') : undefined,
          sort: next.sort,
          page: next.page,
          pageSize: props.pageSize,
        };
        const response = await listProjectsQuery(query);
        return {
          items: response.data?.data?.items ?? [],
          total: response.data?.data?.total ?? 0,
          error: Boolean(response.error),
        };
      } catch {
        return { items: [], total: 0, error: true };
      }
    },
  });
  const requestDebounced = debounce((next: ListingState) => void listing.replace(next), 500);

  const updateUrl = (next: ListingState) => {
    const url = new URL(window.location.href);
    syncSearchParam(url, 'q', next.query || undefined);
    syncSearchParam(url, 'tags', next.tags.length ? next.tags.join(',') : undefined);
    syncSearchParam(url, 'sort', next.sort === 'recent' ? undefined : next.sort);
    syncSearchParam(url, 'page', next.page > 1 ? String(next.page) : undefined);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };

  createEffect(
    on(
      () => [search.query, search.tags.join(','), search.sort, search.page] as const,
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
    const onPopState = () => setSearch(parseState(new URL(window.location.href), search.page));
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
              placeholder={t('projects.searchProjects')}
              onChange={(query) => setSearch({ query, page: 1 })}
            />
          }
          view={<ListingViewToggle view={view()} onChange={setView} />}
        >
          <ListingFiltersMenu>
            <TagSelector value={search.tags} onChange={(tags) => setSearch({ tags, page: 1 })} />
            <ListingSelect
              id="projects-sort"
              value={search.sort}
              options={[
                { value: 'recent', label: t('projects.sortRecent') },
                { value: 'title', label: t('projects.title') },
              ]}
              onChange={(value) => setSearch({ sort: value as ListingSort, page: 1 })}
              icon={ArrowDownUp}
              ariaLabel={t('projects.sort')}
            />
          </ListingFiltersMenu>
        </ListingToolbar>
      </Show>
      <Show when={listing.error() && !listing.loading()}>
        <p role="alert" class="text-danger rounded-xl border border-danger/30 bg-danger/5 p-4">
          {t('projects.couldNotLoadProjects')}
        </p>
      </Show>
      <Show
        when={listing.items().length > 0}
        fallback={
          <Show when={!listing.loading() && !listing.error()}>
            <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
              {t('projects.noProjectPublishedMatchesFilters')}
            </p>
          </Show>
        }
      >
        <div class={view() === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4'}>
          <For each={listing.items()}>
            {(project) => (
              <article class="rounded-2xl border border-line bg-surface-elevated p-4 shadow-sm">
                <p class="text-eyebrow">{t('editproject.project')}</p>
                <a href={routes.project(project.slug)}>
                  <h2 class="heading-card mt-2 text-lg hover:text-content-accent">
                    {project.title}
                  </h2>
                </a>
                <p class="text-muted mt-1 line-clamp-3">
                  {project.summary}
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <For each={project.tagSlugs}>
                    {(tag) => (
                      <a
                        href={routes.searchByTag(tag)}
                        class="rounded-full border border-line px-2.5 py-1 text-xs text-content-muted"
                      >
                        #{tag}
                      </a>
                    )}
                  </For>
                </div>
                <div class="mt-4 flex gap-2 border-t border-line pt-3">
                  <Show when={project.projectUrl}>
                    <a
                      href={project.projectUrl ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      class="inline-flex size-9 items-center justify-center rounded-xl border border-line"
                    >
                      <ExternalLink class="size-4" aria-hidden="true" />
                    </a>
                  </Show>
                  <Show when={project.repositoryUrl}>
                    <a
                      href={project.repositoryUrl ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      class="inline-flex size-9 items-center justify-center rounded-xl border border-line"
                    >
                      <GitBranch class="size-4" aria-hidden="true" />
                    </a>
                  </Show>
                </div>
              </article>
            )}
          </For>
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

export type { ListingState as ProjectsListingState };
export default ProjectsListing;
