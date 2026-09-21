import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import {
  ArrowUpRight,
  BookOpenText,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileText,
  Library,
  MessageCircleQuestionMark,
  Newspaper,
  Search,
  X,
  type LucideIcon,
} from 'lucide-solid';
import { createEffect, createResource, createSignal, For, onCleanup, onMount, Show } from 'solid-js';
import { createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import { useI18n, type TranslationKey } from '@/features/home/i18n';
import { withLocale } from '@/shared/i18n/core/solid';
import { searchDiscovery, feedItemHref, type DiscoveryItem } from '@/features/discovery/public';
import { Combobox, createListCollection } from '@ark-ui/solid';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { parseHomeSearch } from '@/features/home/ui/schemas/search.schema.ts';

type Domain = DiscoveryItem['type'];

type DomainOption = readonly [Domain, TranslationKey, LucideIcon];
type SearchState = { query: string; types: Domain[] };
type SearchRequest = { search: string; types: string };
type SearchResult = { items: DiscoveryItem[] };

const domains = [
  ['article', 'home.format.articles', FileText],
  ['news', 'home.format.news', Newspaper],
  ['resource', 'home.format.resources', Library],
  ['question', 'home.format.questions', MessageCircleQuestionMark],
  ['project', 'home.format.projects', Boxes],
  ['job', 'home.format.jobs', BriefcaseBusiness],
  ['event', 'home.format.events', CalendarDays],
] as const satisfies readonly DomainOption[];

const domainMeta = new Map(domains.map(([type, label, icon]) => [type, { label, icon }] as const));

function SearchMenu() {
  const { t } = useI18n();
  const [search, setSearch] = createStore<SearchState>({
    query: '',
    types: domains.map(([value]) => value),
  });
  const [open, setOpen] = createSignal(false);
  const [history, setHistory] = createSignal<string[]>([]);
  const [request, setRequest] = createSignal<SearchRequest>();
  const initialResult: SearchResult = { items: [] };
  const [result] = createResource(
    request,
    async (next) => {
      try {
        const payload = await searchDiscovery({
          search: next.search,
          types: next.types,
          page: 1,
          pageSize: 6,
        });
        return { items: payload.items ?? [] };
      } catch {
        return initialResult;
      }
    },
    { initialValue: initialResult, ssrLoadFrom: 'initial' },
  );
  const requestDebounced = debounce((next: SearchRequest) => setRequest(() => next), 500);
  const currentResults = () =>
    search.query.trim() && search.types.length ? (result.latest ?? initialResult).items : [];
  const resultCollection = createMemo(() =>
    createListCollection({
      items: currentResults(),
      itemToString: (item: DiscoveryItem) => item.title,
      itemToValue: (item: DiscoveryItem) => feedItemHref(item),
    }),
  );

  createEffect(() => {
    const query = search.query.trim();
    const types = search.types.join(',');
    if (!query || !types) {
      requestDebounced.cancel();
      setRequest(undefined);
      return;
    }
    requestDebounced({ search: query, types });
  });

  const rememberQuery = (value: string) => {
    const nextHistory = [value, ...history().filter((item) => item !== value)].slice(0, 5);
    setHistory(nextHistory);
    localStorage.setItem('devhub-search-history', JSON.stringify(nextHistory));
  };

  const requestImmediately = () => {
    const query = search.query.trim();
    const types = search.types.join(',');
    if (!query || !types) return false;
    requestDebounced.cancel();
    setRequest({ search: query, types });
    return true;
  };

  const syncFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseHomeSearch(params);
    const query = parsed.q;
    setSearch({
      query,
      types: parsed.types,
    });
  };

  onMount(() => {
    syncFromUrl();
    try {
      const stored = JSON.parse(localStorage.getItem('devhub-search-history') ?? '[]');
      setHistory(
        Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string').slice(0, 5) : [],
      );
    } catch {
      setHistory([]);
    }

    const syncListener = (event: Event) => {
      const detail = (event as CustomEvent<{ query?: string; types?: Domain[] }>).detail;
      if (detail) {
        setSearch({ query: detail.query ?? '', types: detail.types?.length ? detail.types : [] });
      } else {
        syncFromUrl();
      }
    };
    window.addEventListener('devhub-search-state', syncListener);
    window.addEventListener('popstate', syncListener);
    onCleanup(requestDebounced.cancel);
    onCleanup(() => {
      window.removeEventListener('devhub-search-state', syncListener);
      window.removeEventListener('popstate', syncListener);
    });
  });

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    if (requestImmediately()) {
      rememberQuery(search.query.trim());
      setOpen(true);
    }
  };

  const toggle = (value: Domain) => {
    setSearch('types', (current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const chooseHistory = (value: string) => {
    setSearch('query', value);
    setOpen(true);
  };

  return (
    <form role="search" onSubmit={submit} class="relative ml-auto w-fit lg:mx-auto lg:w-full lg:max-w-2xl">
      <Combobox.Root
        open={open()}
        collection={resultCollection()}
        inputValue={search.query}
        onInputValueChange={(details) => {
          setSearch('query', details.inputValue);
          setOpen(true);
        }}
        onOpenChange={(details) => setOpen(details.open)}
        onValueChange={(details) => {
          const href = details.value[0];
          if (href) redirectTo(href);
        }}
        positioning={{ sameWidth: true }}
        class="contents"
      >
        <div class="lg:hidden">
          <button
            type="button"
           
           
            aria-label={t('search.placeholder')}
            aria-expanded={open()}
            title={t('search.placeholder')}
            onClick={() => setOpen((value) => !value)} class="action action-icon size-11 shrink-0 rounded-xl"
          >
            <Search class="size-5" aria-hidden="true" />
          </button>
        </div>
        <div class="hidden h-11 items-center gap-2 rounded-2xl border border-line bg-surface-elevated px-2 shadow-sm transition duration-standard ease-standard focus-within:border-action-border focus-within:ring-2 focus-within:ring-focus/30 lg:flex">
          <Search class="ml-1 size-4 shrink-0 text-content-subtle" aria-hidden="true" />
          <Combobox.Input
            aria-label={t('search.placeholder')}
            onFocus={() => setOpen(true)}
            placeholder={t('search.placeholder')}
            class="min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-content outline-none placeholder:text-content-subtle"
          />
          <Show when={search.query}>
            <button
              type="button"
              aria-label={t('search.clear')}
              title={t('search.clear')}
              onClick={() => {
                setSearch('query', '');
                setOpen(true);
              }} class="action action-ghost"
             
            >
              <X class="size-4" aria-hidden="true" />
            </button>
          </Show>
          <button
            type="submit"
            disabled={!search.query.trim() || !search.types.length}
            aria-label={t('search.submit')}
            title={t('search.submit')} class="action action-primary"
           
          >
            <Search class="size-3.5" aria-hidden="true" />
            <span class="hidden sm:inline">{t('search.submit')}</span>
          </button>
        </div>

        <Combobox.Content
          hidden={!open()}
          class="fixed left-3 right-3 top-[calc(var(--layout-header-height)+0.5rem)] z-[80] max-h-[calc(100dvh-var(--layout-header-height)-1rem)] overflow-y-auto rounded-2xl border border-line bg-surface-overlay shadow-ui-overlay backdrop-blur sm:rounded-3xl lg:absolute lg:inset-x-0 lg:left-auto lg:right-auto lg:top-[calc(100%+0.5rem)] lg:max-h-[min(36rem,calc(100dvh-var(--layout-header-height)-1rem))]"
        >
          <div class="grid md:grid-cols-[minmax(0,1fr)_15rem]">
            <div class="grid min-h-0 content-start gap-2 p-2 sm:p-4 md:min-h-64">
              <Show
                when={currentResults().length > 0}
                fallback={
                  <Show
                    when={history().length > 0}
                    fallback={
                      <div class="grid min-h-48 place-items-center px-6 text-center">
                        <div class="max-w-sm">
                          <BookOpenText class="mx-auto size-8 text-content-subtle" aria-hidden="true" />
                          <p class="text-strong mt-3">
                            {t('search.placeholder')}
                          </p>
                          <p class="text-muted-compact mt-1">
                            {t('search.domains')}
                          </p>
                        </div>
                      </div>
                    }
                  >
                    <div class="grid gap-2">
                      <p class="text-eyebrow px-2">
                        {t('search.history')}
                      </p>
                      <div class="grid gap-1">
                        <For each={history()}>
                          {(item) => (
                            <button type="button" onClick={() => chooseHistory(item)} class="action action-ghost">
                              <Clock3 class="size-4 shrink-0 text-content-subtle" aria-hidden="true" />
                              <span class="min-w-0 flex-1 truncate">{item}</span>
                            </button>
                          )}
                        </For>
                      </div>
                    </div>
                  </Show>
                }
              >
                <div class="grid gap-2">
                  <div class="flex items-center justify-between gap-3 px-2">
                    <p class="text-eyebrow">{t('search.results')}</p>
                    <span class="text-xs text-content-subtle">{currentResults().length}</span>
                  </div>
                  <div class="grid gap-1">
                    <For each={currentResults()}>
                      {(item) => {
                        const meta = domainMeta.get(item.type);
                        const ResultIcon = meta?.icon ?? Search;
                        return (
                          <Combobox.Item
                            item={item}
                            asChild={(getItemProps) => (
                              <a
                                {...getItemProps()}
                                class="group grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-hover"
                                href={feedItemHref(item)}
                              >
                                <span class="grid size-9 place-items-center rounded-xl border border-line bg-surface text-content-accent">
                                  <ResultIcon class="size-4" aria-hidden="true" />
                                </span>
                                <span class="min-w-0">
                                  <span class="block truncate text-sm font-semibold text-content">{item.title}</span>
                                  <span class="mt-0.5 block truncate text-xs text-content-muted">{item.summary}</span>
                                </span>
                                <ArrowUpRight
                                  class="size-4 text-content-subtle transition group-hover:text-content-accent"
                                  aria-hidden="true"
                                />
                              </a>
                            )}
                          />
                        );
                      }}
                    </For>
                  </div>
                </div>
              </Show>
            </div>

            <aside class="grid content-start gap-3 border-t border-line bg-surface-subtle/70 p-3 sm:p-4 md:border-t-0 md:border-l">
              <div class="flex items-center justify-between gap-2">
                <p class="text-eyebrow">{t('search.domains')}</p>
                <button
                  type="button"
                  onClick={() =>
                    setSearch(
                      'types',
                      domains.map(([value]) => value),
                    )
                  } class="action action-ghost"
                 
                >
                  {t('search.allDomains')}
                </button>
              </div>
              <div class="grid grid-cols-2 gap-1.5 md:grid-cols-1">
                <For each={domains}>
                  {([value, label, DomainIcon]) => (
                    <ToggleButton
                      type="button"
                      pressed={search.types.includes(value)}
                      size="sm"
                      class="w-full justify-start"
                      onClick={() => toggle(value)}
                    >
                      <DomainIcon class="size-3.5 shrink-0" aria-hidden="true" />
                      <span class="truncate">{t(label)}</span>
                    </ToggleButton>
                  )}
                </For>
              </div>
              <Show when={!search.types.length}>
                <p role="alert" class="text-danger-caption rounded-xl border border-danger-border bg-danger-bg px-3 py-2">
                  {t('search.selectDomain')}
                </p>
              </Show>
            </aside>
          </div>
        </Combobox.Content>
      </Combobox.Root>
    </form>
  );
}

export default withLocale(SearchMenu);
