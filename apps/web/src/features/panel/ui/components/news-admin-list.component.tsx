import { Eye, Pencil, RefreshCw } from 'lucide-solid';
import { For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { listNewsForManagement } from '@/features/news/public';
import { routes } from '@/shared/navigation/routes';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import ManagementListItem from '@/shared/ui/components/surfaces/management-list-item.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';

const statusTone = (status: string): 'success' | 'neutral' | 'accent' =>
  status === 'published' ? 'success' : status === 'archived' ? 'neutral' : 'accent';

function NewsAdminList() {
  const { t, locale } = useI18n();
  const statusLabel = (status: string) =>
    ({
      draft: t('articlesmoderationlist.draft'),
      published: t('newsadminlist.published'),
      archived: t('newsadminlist.archived'),
    })[status] ?? status;
  type ManagementItem = Awaited<ReturnType<typeof listNewsForManagement>>['items'][number];
  const [state, setState] = createStore({
    items: [] as ManagementItem[],
    loading: true,
    error: false,
  });
  const load = async () => {
    setState({ loading: true, error: false });
    const result = await listNewsForManagement();
    setState({ items: result.items, loading: false, error: Boolean(result.error) });
  };
  onMount(() => void load());

  return (
    <ListPanel>
      <div class="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p class="text-strong">{t('newsadminlist.news')}</p>
          <p class="text-muted mt-1">
            {t('newsadminlist.trackStatusEditorialOpenEachNewsEditing')}
          </p>
        </div>
        <button type="button" onClick={() => void load()} disabled={state.loading} class="action action-secondary">
          <RefreshCw class="size-4" />
          {state.loading ? t('common.refreshing') : t('common.refresh')}
        </button>
      </div>
      <Show when={!state.loading} fallback={<LoadingState>{t('newsadminlist.loadingNews')}</LoadingState>}>
        <Show
          when={!state.error}
          fallback={
            <RetryErrorState
              message={t('newsadminlist.couldNotLoadNews')}
              retryLabel={t('common.refresh')}
              onRetry={() => void load()}
            />
          }
        >
          <ListPanelList>
            <For
              each={state.items.filter((news) => !news.deletedAt)}
              fallback={
                <li class="px-6 py-12 text-center">
                  <p class="text-strong">{t('newsadminlist.noNewsFound')}</p>
                  <p class="text-muted mt-2">
                    {t('newsadminlist.createNewsStartCoverageEditorial')}
                  </p>
                  <div class="mt-5">
                    <a href={routes.newsNew} class="action action-primary">
                      {t('newsadminlist.createNews')}
                    </a>
                  </div>
                </li>
              }
            >
              {(news) => (
                <li>
                  <ManagementListItem
                    status={<StatusBadge status={statusTone(news.status)}>{statusLabel(news.status)}</StatusBadge>}
                    meta={
                      <span class="text-xs text-content-muted">
                        {t('newsadminlist.updated')} {formatPublicDate(news.updatedAt, locale())}
                      </span>
                    }
                    title={news.title}
                    description={
                      <p class="text-caption">
                        {news.views} {t('newsadminlist.views')}
                      </p>
                    }
                    actions={
                      <div class="flex flex-wrap gap-2">
                        <Show when={news.status === 'published'}>
                          <a href={routes.newsDetail(news.slug)} class="action action-secondary">
                            <Eye class="size-3.5" /> {t('articlesmoderationlist.view')}
                          </a>
                        </Show>
                        <a href={routes.newsEdit(news.id)} class="action action-secondary">
                          <Pencil class="size-3.5" /> {t('newsadminlist.edit')}
                        </a>
                      </div>
                    }
                  />
                </li>
              )}
            </For>
          </ListPanelList>
        </Show>
      </Show>
    </ListPanel>
  );
}

export default withLocale(NewsAdminList);
