import { createEffect, createMemo, createSignal, For, on, onCleanup, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { debounce } from '@utilify/core';
import type { ToolDefinition } from '../../domain/tool-catalog.domain.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { syncSearchParam } from '@/shared/utils/search-params.util.ts';
import ListingFiltersMenu from '@/shared/ui/components/listing/listing-filters-menu.component.tsx';
import ListingSearch from '@/shared/ui/components/listing/listing-search.component.tsx';
import TagSelector from '@/shared/ui/components/forms/tag-selector.component.tsx';
import ListingViewToggle from '@/shared/ui/components/listing/listing-view-toggle.component.tsx';
import ListingToolbar from '@/shared/ui/components/listing/listing-toolbar.component.tsx';
import { useI18n } from '../../i18n';
import ToolCard from './tool-card.component.tsx';
import { parseSearchQuery } from '@/shared/ui/schemas/search.schema.ts';

type Props = { items: ToolDefinition[]; initialQuery?: string; initialTags?: string[] };
type SearchState = { query: string; tags: string[] };

function ToolsCatalog(props: Props) {
  const { t } = useI18n();
  const [search, setSearch] = createStore<SearchState>({
    query: props.initialQuery ?? '',
    tags: [...(props.initialTags ?? [])],
  });
  const [appliedQuery, setAppliedQuery] = createSignal(search.query);
  const [view, setView] = createSignal<'grid' | 'list'>('grid');
  const requestDebounced = debounce((query: string) => setAppliedQuery(query), 500);
  const tagOptions = [...new Set(props.items.flatMap((item) => item.tags))]
    .sort()
    .map((slug) => ({ slug, name: slug }));

  const filtered = createMemo(() => {
    const normalizedQuery = appliedQuery().trim().toLowerCase();
    const selectedTags = search.tags.map((tag) => tag.toLowerCase());
    return props.items.filter((item) => {
      const searchable = [t(item.titleKey), t(item.descriptionKey), ...item.tags].join(' ').toLowerCase();
      const itemTags = item.tags.map((tag) => tag.toLowerCase());
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        selectedTags.every((tag) => itemTags.includes(tag))
      );
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
      const currentUrl = new URL(window.location.href);
      const parsed = parseSearchQuery(currentUrl.searchParams);
      requestDebounced.cancel();
      setSearch({ query: parsed.q, tags: parsed.tags });
      setAppliedQuery(parsed.q);
    };
    window.addEventListener('popstate', onPopState);
    onCleanup(() => window.removeEventListener('popstate', onPopState));
    onCleanup(requestDebounced.cancel);
  });

  return (
    <section class="grid gap-5">
      <ListingToolbar
        search={
          <ListingSearch
            query={search.query}
            placeholder={t('tools.searchTools')}
            onChange={(query) => setSearch({ query })}
          />
        }
        view={<ListingViewToggle view={view()} onChange={setView} />}
      >
        <Show when={tagOptions.length > 0}>
          <ListingFiltersMenu>
            <TagSelector
              value={search.tags}
              initialOptions={tagOptions}
              remote={false}
              onChange={(tags) => setSearch({ tags })}
            />
          </ListingFiltersMenu>
        </Show>
      </ListingToolbar>

      <div class={view() === 'list' ? 'grid grid-cols-1 gap-4' : 'grid gap-4 md:grid-cols-2'}>
        <For each={filtered()} fallback={<p class="text-muted">{t('tools.noToolMatchesFilters')}</p>}>
          {(item) => <ToolCard item={item} />}
        </For>
      </div>
    </section>
  );
}

export default withLocale(ToolsCatalog);
