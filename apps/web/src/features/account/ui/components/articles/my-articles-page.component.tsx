import { deleteArticle, loadMyArticles } from '@/features/article/public';
import { useAccount } from '@/features/account/ui/hooks/use-account.hook.ts';
import type { ArticleItem } from '@/features/article/public';
import { routes } from '@/shared/navigation/routes';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelActionHeader from '@/shared/ui/components/surfaces/list-panel-action-header.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import { createSignal, For, onMount, Show } from 'solid-js';
import { Eye, FilePlusCorner, Pencil, Trash } from 'lucide-solid';
const STATUS_TONE: Record<ArticleItem['status'], 'neutral' | 'success' | 'accent'> = {
  draft: 'neutral',
  published: 'success',
  archived: 'accent',
};

function MyArticlesPage() {
  const { t, locale } = useI18n();
  const STATUS_LABEL: Record<ArticleItem['status'], string> = {
    draft: t('myarticles.draft'),
    published: t('myarticles.published'),
    archived: t('myarticles.archived'),
  };
  const { state: account } = useAccount();
  const [items, setItems] = createSignal<ArticleItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);
  const [confirmingId, setConfirmingId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await loadMyArticles({ page: 1, pageSize: 30 }, account().details?.account.id);
      setItems(result);
    } catch {
      setItems([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  onMount(() => void load());

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      const result = await deleteArticle(id);
      if (result.kind === 'failure') {
        notifyError(result.code);
        return;
      }
      notifySuccess(result.code);
      setItems((current) => current.filter((item) => item.id !== id));
    } finally {
      setConfirmingId(null);
      setDeletingId(null);
    }
  };

  return (
    <ListPanel>
      <ListPanelActionHeader>
        <PanelHeading
          title={t('myarticles.articles')}
          description={t('myarticles.trackStatusOpenEditingEachPublication')}
        />
        <a href={routes.articleNew} class="action action-primary">
          <FilePlusCorner class="size-4" /> {t('myarticles.writeArticle')}
        </a>
      </ListPanelActionHeader>
      <Show when={!loading()} fallback={<LoadingState>{t('myarticles.loadingArticles')}</LoadingState>}>
        <Show
          when={!error()}
          fallback={
            <RetryErrorState
              message={t('myarticles.couldNotLoadArticles')}
              retryLabel={t('myarticles.tryAgain')}
              onRetry={() => void load()}
            />
          }
        >
          <Show
            when={items().length}
            fallback={
              <EmptyState>
                <p class="text-emphasis">{t('myarticles.youStillNotEscreveunorticle')}</p>
                <p class="text-muted-body mx-auto mt-2 max-w-md">
                  {t('myarticles.startDraftPublishKnowledgeDecisionsTechnicalOrLearningsCommunity')}
                </p>
                <a href={routes.articleNew} class="action action-primary mt-5">
                  <FilePlusCorner class="size-4" /> {t('myarticles.writeFirstArticle')}
                </a>
              </EmptyState>
            }
          >
            <ListPanelList>
              <For each={items()}>
                {(item) => (
                  <li class="px-5 py-5 sm:px-6">
                    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <StatusBadge status={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</StatusBadge>
                          <span class="text-xs text-content-muted">
                            {t('myarticles.updated')} {formatPublicDate(item.updatedAt, locale())}
                          </span>
                        </div>
                        <h2 class="heading-callout mt-3 truncate text-base">
                          {item.title}
                        </h2>
                        <p class="text-caption mt-2">
                          {item.views} {t('myarticles.views')} {item.votes} {t('myarticles.votes')} {item.commentCount}{' '}
                          {t('myarticles.comments')}
                        </p>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <Show when={item.status === 'published'}>
                          <a href={routes.article(item.slug)} class="action action-secondary">
                            <Eye class="size-3.5" /> {t('myarticles.view')}
                          </a>
                        </Show>
                        <a href={routes.articleEdit(item.id)} class="action action-secondary">
                          <Pencil class="size-3.5" /> {t('myarticles.edit')}
                        </a>
                        <button type="button" onClick={() => setConfirmingId(item.id)} class="action action-danger">
                          <Trash class="size-3.5" /> {t('myarticles.delete')}
                        </button>
                      </div>
                    </div>
                    <Show when={confirmingId() === item.id}>
                      <div class="mt-4 flex flex-col gap-3 rounded-2xl border border-danger-border bg-danger-bg p-4 sm:flex-row sm:items-center sm:justify-between">
                        <p class="text-muted">
                          {t('myarticles.delete')} <strong class="text-content">{item.title}</strong>
                          {t('myarticles.thisActionNotCanBeUndone')}{' '}
                        </p>
                        <div class="flex gap-2">
                          <button
                            type="button"
                            disabled={deletingId() === item.id}
                            onClick={() => void remove(item.id)} class="action action-danger"
                           
                          >
                            <Trash class="size-4" aria-hidden="true" />
                            {deletingId() === item.id ? t('myarticles.deleting') : t('myarticles.confirmDeletion')}
                          </button>
                          <button
                            type="button"
                            disabled={deletingId() === item.id}
                            onClick={() => setConfirmingId(null)} class="action action-secondary"
                           
                          >
                            {t('myarticles.cancel')}
                          </button>
                        </div>
                      </div>
                    </Show>
                  </li>
                )}
              </For>
            </ListPanelList>
          </Show>
        </Show>
      </Show>
    </ListPanel>
  );
}

export default withLocale(MyArticlesPage);
