import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { Grid2x2, List } from 'lucide-solid';
import { createMemo, createSignal, For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  loadPopular,
  loadRecent,
  loadTrending,
  searchDiscovery,
  type DiscoveryItem,
  type DiscoveryType,
} from '@/features/discovery/public';
import { routes } from '@/shared/navigation/routes';

type GroupSpec = { label: string; type: DiscoveryType };

type Props = {
  groupSpecs: GroupSpec[];
  query: string;
  tags: string[];
  types: DiscoveryType[];
  mode: 'search' | 'trending' | 'popular' | 'recent';
  resultsLabel: string;
  emptyLabel: string;
  errorLabel: string;
  gridLabel: string;
  listLabel: string;
  viewLabel: string;
};

function hrefFor(item: DiscoveryItem): string {
  switch (item.type) {
    case 'resource':
      return item.slug;
    case 'article':
      return routes.article(item.slug);
    case 'question':
      return routes.question(item.id);
    case 'project':
      return routes.project(item.slug);
    case 'job':
      return routes.job(item.id);
    case 'event':
      return routes.event(item.slug);
    case 'news':
      return routes.newsDetail(item.slug);
  }
}

export default function SearchResults(props: Props) {
  const [view, setView] = createSignal<'grid' | 'list'>('grid');
  const [state, setState] = createStore({ loading: true, error: false, items: [] as DiscoveryItem[], total: 0 });

  const groups = createMemo(() =>
    props.groupSpecs
      .map((group) => ({
        label: group.label,
        results: state.items
          .filter((item) => item.type === group.type)
          .map((item) => ({ href: hrefFor(item), title: item.title, summary: item.summary })),
      }))
      .filter((group) => group.results.length > 0),
  );

  onMount(async () => {
    setState({ loading: true, error: false });
    const request = {
      search: props.query.trim() || undefined,
      tags: props.tags.length ? props.tags.join(',') : undefined,
      types: props.types.join(','),
      page: 1,
      pageSize: 50,
    };
    try {
      const payload =
        props.mode === 'trending'
          ? await loadTrending(request)
          : props.mode === 'popular'
            ? await loadPopular(request)
            : props.mode === 'recent'
              ? await loadRecent(request)
              : await searchDiscovery(request);
      setState({ items: payload.items ?? [], total: payload.total ?? payload.items?.length ?? 0, loading: false });
    } catch {
      setState({ items: [], total: 0, error: true, loading: false });
    }
  });

  return (
    <>
      <div class="mt-3 flex justify-end">
        <nav class="inline-flex items-center rounded-xl border border-line bg-surface p-1" aria-label={props.viewLabel}>
          <ToggleButton
            type="button"
            aria-label={props.gridLabel}
            title={props.gridLabel}
            pressed={view() === 'grid'}
            size="sm"
            onClick={() => setView('grid')}
          >
            <Grid2x2 size={16} aria-hidden="true" />
          </ToggleButton>
          <ToggleButton
            type="button"
            aria-label={props.listLabel}
            title={props.listLabel}
            pressed={view() === 'list'}
            size="sm"
            onClick={() => setView('list')}
          >
            <List size={16} aria-hidden="true" />
          </ToggleButton>
        </nav>
      </div>
      <Show
        when={!state.error}
        fallback={
          <p class="text-danger mt-6">
            {props.errorLabel}
          </p>
        }
      >
        <Show
          when={!state.loading}
          fallback={
            <p class="text-muted mt-6">
              …
            </p>
          }
        >
          <p class="text-muted mt-6">
            {state.total} {props.resultsLabel}
          </p>
          <div class="mt-5 space-y-8">
            <For each={groups()}>
              {(group) => (
                <section>
                  <h2 class="heading-tiny mb-3 text-sm">
                    {group.label}
                  </h2>
                  <div
                    class={view() === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-1 gap-4'}
                  >
                    <For each={group.results}>
                      {(result) => (
                        <a
                          href={result.href}
                          class="grid gap-2 rounded-3xl border border-line bg-surface-elevated p-5 shadow-sm transition hover:border-action-border"
                        >
                          <h3 class="heading-card text-lg">
                            {result.title}
                          </h3>
                          <p class="text-muted line-clamp-3">
                            {result.summary}
                          </p>
                        </a>
                      )}
                    </For>
                  </div>
                </section>
              )}
            </For>
          </div>
          <Show when={groups().length === 0}>
            <p class="text-muted mt-5 rounded-3xl border border-line p-6">
              {props.emptyLabel}
            </p>
          </Show>
        </Show>
      </Show>
    </>
  );
}
