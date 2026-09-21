import { createSignal, For, onMount, Show } from 'solid-js';
import { loadPopularNewsSources, type NewsSourceDTO } from '@/features/news/public';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
function NewsSourcesAdminList() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<NewsSourceDTO[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);
  onMount(async () => {
    const result = await loadPopularNewsSources();
    setItems(result.items);
    setError(Boolean(result.error));
    setLoading(false);
  });
  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading
          title={t('newssourcesadminlist.sources')}
          description={t('newssourcesadminlist.sourcesGlobalMoreFrequentCoveragePublished')}
        />
      </ListPanelHeader>
      <Show when={!loading()} fallback={<LoadingState>{t('newssourcesadminlist.loadingSources')}</LoadingState>}>
        <Show
          when={!error()}
          fallback={
            <p class="text-danger px-6 py-8">
              {t('newssourcesadminlist.couldNotLoadSources')}
            </p>
          }
        >
          <ListPanelList>
            <For each={items()}>
              {(item) => (
                <li class="flex items-center justify-between px-5 py-4 sm:px-6">
                  <div>
                    <p class="text-strong">{item.name}</p>
                    <p class="text-caption mt-1">
                      {item.domain}
                    </p>
                  </div>
                  <span class="text-xs font-semibold text-content-muted">
                    {item.newsCount} {t('newsadminlist.news')}
                  </span>
                </li>
              )}
            </For>
          </ListPanelList>
        </Show>
      </Show>
    </ListPanel>
  );
}

export default withLocale(NewsSourcesAdminList);
