import { ArrowDownUp, Circle, CircleCheck } from 'lucide-solid';
import { createEffect, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import { listQuestionsQuery } from '@/features/q-and-a/actions/question.action.ts';
import type { ListQuestionsQuery, QuestionListItem } from '@/features/q-and-a/types/q-and-a.type.ts';
import { useI18n } from '@/features/q-and-a/i18n';
import { translate as translateShared } from '@/shared/i18n';
import { formatLocalizedDate } from '@/shared/i18n/core';
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
import { questionSearchSchema } from '@/features/q-and-a/ui/schemas/search.schema.ts';

type ListingView = 'grid' | 'list';
type ListingStatus = 'open' | 'closed' | 'solved';
type ListingState = { query: string; tags: string[]; status?: ListingStatus; sort: 'recent' | 'answers'; page: number };
type ListingResult = { items: QuestionListItem[]; total: number; error: boolean };
type Props = {
  initialItems: QuestionListItem[];
  initialTotal: number;
  initialError: boolean;
  initialResolved?: boolean;
  initialState: ListingState;
  pageSize: number;
  contextual?: boolean;
};

const parseState = (url: URL, fallbackPage: number): ListingState => {
  const base = parseListingSearch(url.searchParams, fallbackPage);
  const parsed = questionSearchSchema.parse({ ...base, status: url.searchParams.get('status'), sort: url.searchParams.get('sort') });
  return {
    query: base.query,
    tags: base.tags,
    status: parsed.status,
    sort: parsed.sort,
    page: base.page,
  };
};

function QuestionsListing(props: Props) {
  const { t, locale } = useI18n();
  const initialList: ListingResult = {
    items: props.initialItems,
    total: props.initialTotal,
    error: props.initialError,
  };
  const [search, setSearch] = createStore<ListingState>(props.initialState);
  const [view, setView] = createSignal<ListingView>('list');
  const listing = createInfiniteListing<QuestionListItem, ListingState>({
    initial: initialList,
    initialPage: props.initialState.page,
    initialResolved: props.initialResolved,
    getKey: (question) => question.id,
    loadPage: async (next) => {
      try {
        const query: ListQuestionsQuery = {
          page: next.page,
          pageSize: props.pageSize,
          search: next.query || undefined,
          tags: next.tags.length ? next.tags.join(',') : undefined,
          status: next.status,
          sort: next.sort,
        };
        const response = await listQuestionsQuery(query);
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
    syncSearchParam(url, 'status', next.status);
    syncSearchParam(url, 'sort', next.sort === 'recent' ? undefined : next.sort);
    syncSearchParam(url, 'page', next.page > 1 ? String(next.page) : undefined);
    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  };
  createEffect(
    on(
      () => [search.query, search.tags.join(','), search.status, search.sort, search.page] as const,
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
  const statusLabel = (question: QuestionListItem) =>
    question.status === 'closed'
      ? t('questions.closedOne')
      : question.acceptedAnswerId
        ? t('questions.solvedOne')
        : t('questions.openOne');
  return (
    <section class="grid gap-5" aria-busy={listing.loading()}>
      <Show when={!props.contextual}>
        <ListingToolbar
          search={
            <ListingSearch
              query={search.query}
              placeholder={t('questions.searchQuestions')}
              onChange={(query) => setSearch({ query, page: 1 })}
            />
          }
          view={<ListingViewToggle view={view()} onChange={setView} />}
        >
          <ListingFiltersMenu>
            <TagSelector value={search.tags} onChange={(tags) => setSearch({ tags, page: 1 })} />
            <ListingSelect
              id="questions-status"
              value={search.status ?? ''}
              options={[
                { value: '', label: t('questions.all') },
                { value: 'open', label: t('questions.openOne') },
                { value: 'solved', label: t('questions.solvedOne') },
                { value: 'closed', label: t('questions.closedOne') },
              ]}
              onChange={(value) => setSearch({ status: (value || undefined) as ListingStatus | undefined, page: 1 })}
              icon={CircleCheck}
              ariaLabel={t('questions.status')}
            />
            <ListingSelect
              id="questions-sort"
              value={search.sort}
              options={[
                { value: 'recent', label: t('questions.mostRecent') },
                { value: 'answers', label: t('questions.mostAnswers') },
              ]}
              onChange={(value) => setSearch({ sort: value as 'recent' | 'answers', page: 1 })}
              icon={ArrowDownUp}
              ariaLabel={t('questions.sort')}
            />
          </ListingFiltersMenu>
        </ListingToolbar>
      </Show>
      <Show when={listing.error() && !listing.loading()}>
        <p role="alert" class="text-danger rounded-xl border border-danger/30 bg-danger/5 p-4">
          {t('questions.couldNotLoadQuestions')}
        </p>
      </Show>
      <Show
        when={listing.items().length > 0}
        fallback={
          <Show when={!listing.loading() && !listing.error()}>
            <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
              {t('questions.noQuestionFound')}
            </p>
          </Show>
        }
      >
        <div class={view() === 'grid' ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4'}>
          <For each={listing.items()}>
            {(question) => (
              <article class="rounded-2xl border border-line bg-surface-elevated p-5 shadow-sm">
                <div
                  class={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] ${question.status === 'closed' ? 'text-content-muted' : question.acceptedAnswerId ? 'text-success' : 'text-content-accent'}`}
                >
                  <span class="inline-flex size-5 items-center justify-center rounded-full bg-current/10">
                    {question.status === 'closed' ? (
                      <CircleCheck class="size-4" aria-hidden="true" />
                    ) : (
                      <Circle class="size-2.5 fill-current" aria-hidden="true" />
                    )}
                  </span>
                  {statusLabel(question)}
                </div>
                <h2 class="heading-subsection mt-2 text-xl">
                  <a href={routes.question(question.id)} class="hover:text-content-accent">
                    {question.title}
                  </a>
                </h2>
                <div class="mt-2 flex flex-wrap gap-2">
                  <For each={question.tagSlugs}>
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
                <div class="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm text-content-muted">
                  <span>
                    {t('questions.by')}{' '}
                    {question.author?.displayName || question.author?.username || t('questiondetail.anonymous')} ·{' '}
                    {formatLocalizedDate(question.createdAt, locale(), {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>
                    {question.answerCount}{' '}
                    {question.answerCount === 1 ? t('questions.answerOne') : t('questions.answerMany')}
                  </span>
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
export type { ListingState as QuestionsListingState };
export default QuestionsListing;
