import { ArrowDownUp, Briefcase, CircleDollarSign, House, MapPin } from 'lucide-solid';
import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import { listJobsQuery } from '@/features/job/actions/job.action.ts';
import type { Job, JobType, ListJobsQuery } from '@/features/job/types/job.type.ts';
import JobCard from './job-card.component.tsx';
import { jobTypeLabel, workplaceLabel } from '../options/job-options';
import { useI18n } from '@/features/job/i18n';
import { translate as translateShared } from '@/shared/i18n';
import { createInfiniteListing } from '@/shared/utils/create-infinite-listing.util.ts';
import { syncSearchParam } from '@/shared/utils/search-params.util.ts';
import ListingSearch from '@/shared/ui/components/listing/listing-search.component.tsx';
import ListingFiltersMenu from '@/shared/ui/components/listing/listing-filters-menu.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import ListingViewToggle from '@/shared/ui/components/listing/listing-view-toggle.component.tsx';
import ListingSelect from '@/shared/ui/components/listing/listing-select.component.tsx';
import ListingInput from '@/shared/ui/components/listing/listing-input.component.tsx';
import ListingToolbar from '@/shared/ui/components/listing/listing-toolbar.component.tsx';
import InfiniteScrollSentinel from '@/shared/ui/components/listing/infinite-scroll-sentinel.component.tsx';
import { parseListingSearch } from '@/shared/ui/schemas/search.schema.ts';
import { jobSearchSchema } from '@/features/job/ui/schemas/search.schema.ts';

type ListingView = 'grid' | 'list';
type ListingSort = 'recent' | 'comp';
type ListingState = {
  query: string;
  tags: string[];
  employmentType?: JobType;
  workplaceType?: Job['workplaceType'];
  location: string;
  minComp?: number;
  sort: ListingSort;
  page: number;
};
type ListingResult = { items: Job[]; total: number; error: boolean };
type Props = {
  initialItems: Job[];
  initialTotal: number;
  initialError: boolean;
  initialResolved?: boolean;
  initialState: ListingState;
  pageSize: number;
};

const parseState = (url: URL, fallbackPage: number): ListingState => {
  const base = parseListingSearch(url.searchParams, fallbackPage);
  const parsed = jobSearchSchema.parse({
    ...base,
    employmentType: url.searchParams.get('employmentType'),
    workplaceType: url.searchParams.get('workplace'),
    location: url.searchParams.get('location'),
    minComp: url.searchParams.get('minComp'),
    sort: url.searchParams.get('sort'),
  });
  return {
    query: base.query,
    tags: base.tags,
    employmentType: parsed.employmentType,
    workplaceType: parsed.workplaceType,
    location: parsed.location,
    minComp: parsed.minComp,
    sort: parsed.sort,
    page: base.page,
  };
};

function JobsListing(props: Props) {
  const { t, locale } = useI18n();
  const initialList: ListingResult = {
    items: props.initialItems,
    total: props.initialTotal,
    error: props.initialError,
  };
  const [search, setSearch] = createStore<ListingState>(props.initialState);
  const [view, setView] = createSignal<ListingView>('grid');
  const listing = createInfiniteListing<Job, ListingState>({
    initial: initialList,
    initialPage: props.initialState.page,
    initialResolved: props.initialResolved,
    getKey: (job) => job.id,
    loadPage: async (next) => {
      try {
        const query: ListJobsQuery = {
          page: next.page,
          pageSize: props.pageSize,
          search: next.query || undefined,
          tags: next.tags.length ? next.tags.join(',') : undefined,
          employmentType: next.employmentType,
          workplaceType: next.workplaceType,
          location: next.location || undefined,
          minComp: next.minComp,
          sort: next.sort,
        };
        const response = await listJobsQuery(query);
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
    syncSearchParam(url, 'employmentType', next.employmentType);
    syncSearchParam(url, 'workplace', next.workplaceType);
    syncSearchParam(url, 'location', next.location || undefined);
    syncSearchParam(url, 'minComp', next.minComp ? String(next.minComp) : undefined);
    syncSearchParam(url, 'sort', next.sort === 'recent' ? undefined : next.sort);
    syncSearchParam(url, 'page', next.page > 1 ? String(next.page) : undefined);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };
  createEffect(
    on(
      () =>
        [
          search.query,
          search.tags.join(','),
          search.employmentType,
          search.workplaceType,
          search.location,
          search.minComp,
          search.sort,
          search.page,
        ] as const,
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
  const types = ['full_time', 'part_time', 'contract', 'internship', 'temporary'] as const;
  const workplaces = ['remote', 'hybrid', 'onsite'] as const;
  return (
    <section class="grid gap-5" aria-busy={listing.loading()}>
      <ListingToolbar
        search={
          <ListingSearch
            query={search.query}
            placeholder={t('jobs.searchJobs')}
            onChange={(query) => setSearch({ query, page: 1 })}
          />
        }
        view={<ListingViewToggle view={view()} onChange={setView} />}
        stackDesktop
      >
        <ListingFiltersMenu>
          <TagSelector value={search.tags} onChange={(tags) => setSearch({ tags, page: 1 })} />
          <ListingSelect
            id="jobs-type"
            value={search.employmentType ?? ''}
            options={[
              { value: '', label: t('jobs.allTypes') },
              ...types.map((value) => ({ value, label: jobTypeLabel(value, t) })),
            ]}
            onChange={(value) => setSearch({ employmentType: (value || undefined) as JobType | undefined, page: 1 })}
            icon={Briefcase}
            ariaLabel={t('jobs.type')}
          />
          <ListingSelect
            id="jobs-workplace"
            value={search.workplaceType ?? ''}
            options={[
              { value: '', label: t('jobs.anyWorkplace') },
              ...workplaces.map((value) => ({ value, label: workplaceLabel(value, t) })),
            ]}
            onChange={(value) =>
              setSearch({ workplaceType: (value || undefined) as Job['workplaceType'] | undefined, page: 1 })
            }
            icon={House}
            ariaLabel={t('editjob.model')}
          />
          <ListingInput
            value={search.location}
            placeholder={t('editjob.location')}
            onInput={(value) => setSearch({ location: value, page: 1 })}
            icon={<MapPin class="size-4" />}
            ariaLabel={t('editjob.location')}
          />
          <ListingInput
            value={search.minComp ?? ''}
            placeholder={t('jobs.compensationMinimum')}
            inputMode="numeric"
            onInput={(value) => setSearch({ minComp: Number(value) || undefined, page: 1 })}
            icon={<CircleDollarSign class="size-4" />}
            ariaLabel={t('jobs.compensationMinimum')}
          />
          <ListingSelect
            id="jobs-sort"
            value={search.sort}
            options={[
              { value: 'recent', label: t('jobs.mostRecent') },
              { value: 'comp', label: t('jobs.greaterCompensation') },
            ]}
            onChange={(value) => setSearch({ sort: value as ListingSort, page: 1 })}
            icon={ArrowDownUp}
            ariaLabel={t('jobs.sort')}
          />
        </ListingFiltersMenu>
      </ListingToolbar>
      <Show when={listing.error() && !listing.loading()}>
        <p role="alert" class="text-danger rounded-xl border border-danger/30 bg-danger/5 p-4">
          {t('jobs.couldNotLoadOpportunities')}
        </p>
      </Show>
      <Show
        when={listing.items().length > 0}
        fallback={
          <Show when={!listing.loading() && !listing.error()}>
            <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
              {t('jobs.noOpportunityActiveMatchesFilters')}
            </p>
          </Show>
        }
      >
        <div class={view() === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4'}>
          <For each={listing.items()}>{(job) => <JobCard job={job} />}</For>
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
export type { ListingState as JobsListingState };
export default JobsListing;
