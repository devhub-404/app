import { Eye, RefreshCw } from 'lucide-solid';
import { createSignal, For, onMount, Show } from 'solid-js';
import { listArticlesForModeration, type ArticleItem } from '@/features/article/public';
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

const statusTone = (status: string): 'success' | 'neutral' => (status === 'published' ? 'success' : 'neutral');

function ArticlesModerationList() {
  const { t, locale } = useI18n();
  const statusLabel = (status: string) =>
    ({
      draft: t('articlesmoderationlist.draft'),
      published: t('articlesmoderationlist.published'),
      archived: t('articlesmoderationlist.archived'),
    })[status] ?? status;
  const [items, setItems] = createSignal<ArticleItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const load = async () => {
    setLoading(true);
    try {
      const result = await listArticlesForModeration({ pageSize: 50 });
      setItems(result.items);
      setError(result.error ? t('articlesmoderationlist.couldNotLoadArticles') : null);
    } catch {
      setError(t('articlesmoderationlist.couldNotLoadArticles'));
    } finally {
      setLoading(false);
    }
  };
  onMount(() => void load());

  return (
    <ListPanel>
      <div class="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p class="text-strong">{t('articlesmoderationlist.articles')}</p>
          <p class="text-muted mt-1">
            {t('articlesmoderationlist.inventoryTriageModerationAuthorshipLifecycleRemainEachAuthor')}
          </p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading()} class="action action-secondary">
          <RefreshCw class="size-4" />
          {loading() ? t('common.refreshing') : t('common.refresh')}
        </button>
      </div>
      <Show when={!loading()} fallback={<LoadingState>{t('articlesmoderationlist.loadingArticles')}</LoadingState>}>
        <Show
          when={!error()}
          fallback={
            <RetryErrorState message={error() ?? ''} retryLabel={t('common.refresh')} onRetry={() => void load()} />
          }
        >
          <ListPanelList>
            <For
              each={items()}
              fallback={
                <li class="px-6 py-12 text-center">
                  <p class="text-strong">{t('articlesmoderationlist.norticleFound')}</p>
                  <p class="text-muted mt-2">
                    {t('articlesmoderationlist.noRecordsTriageCurrent')}
                  </p>
                </li>
              }
            >
              {(article) => (
                <li>
                  <ManagementListItem
                    status={
                      <>
                        <StatusBadge status={statusTone(article.status)}>{statusLabel(article.status)}</StatusBadge>
                        <Show when={article.hiddenAt}>
                          <StatusBadge status="danger">{t('articlesmoderationlist.hidden')}</StatusBadge>
                        </Show>
                      </>
                    }
                    meta={
                      <span class="text-xs text-content-muted">
                        {t('articlesmoderationlist.updated')} {formatPublicDate(article.updatedAt, locale())}
                      </span>
                    }
                    title={article.title}
                    description={
                      <p class="text-caption">
                        {article.author?.displayName ?? t('articlesmoderationlist.authorshipUnavailable')} ·{' '}
                        {article.views} {t('articlesmoderationlist.views')} {article.commentCount}{' '}
                        {t('articlesmoderationlist.comments')}
                      </p>
                    }
                    actions={
                      <Show
                        when={article.status === 'published' && !article.hiddenAt}
                        fallback={
                          <span class="text-xs text-content-subtle">
                            {t('articlesmoderationlist.withoutReadingPublic')}
                          </span>
                        }
                      >
                        <a href={routes.article(article.slug)} class="action action-secondary">
                          <Eye class="size-3.5" /> {t('articlesmoderationlist.view')}
                        </a>
                      </Show>
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

export default withLocale(ArticlesModerationList);
