import { deleteComment, listMyComments, type CommentDTO } from '@/features/comment/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import ListPanelRows from '@/shared/ui/components/surfaces/list-panel-rows.component.tsx';
import { createSignal, For, onMount, Show } from 'solid-js';
import { Trash } from 'lucide-solid';
function MyCommentsPanel() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<CommentDTO[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [confirmingId, setConfirmingId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await listMyComments();
      setItems(result.data?.data?.items ?? []);
    } finally {
      setLoading(false);
    }
  };

  onMount(() => void load());

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteComment(id);
      setConfirmingId(null);
      await load();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <ListPanel aria-labelledby="my-comments-heading">
      <ListPanelHeader>
        <PanelHeading
          id="my-comments-heading"
          title={t('mycommentspanel.comments')}
          description={t('mycommentspanel.accessConversationOriginalOrRemoveContribution')}
        />
      </ListPanelHeader>
      <Show
        when={!loading()}
        fallback={<LoadingState role="status">{t('mycommentspanel.loadingComments')}</LoadingState>}
      >
        <ListPanelRows>
          <For
            each={items()}
            fallback={
              <EmptyState>
                <p class="text-body">{t('mycommentspanel.youStillNotPublishedComments')}</p>
                <p class="text-muted mt-1">
                  {t('mycommentspanel.participationsArticlesNewsWillAppearHere')}
                </p>
              </EmptyState>
            }
          >
            {(comment) => (
              <article class="px-5 py-5 text-sm text-content sm:px-6">
                <p class="text-body whitespace-pre-line">
                  {comment.content}
                </p>
                <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-content-muted">
                  <span>{comment.hiddenAt ? t('myqandacontributions.hidden') : t('mycommentspanel.visible')}</span>
                  <div class="flex items-center gap-2">
                    <Show
                      when={confirmingId() === comment.id}
                      fallback={
                        <button type="button" onClick={() => setConfirmingId(comment.id)} class="action action-danger">
                          <Trash class="size-3.5" aria-hidden="true" /> {t('myarticles.delete')}
                        </button>
                      }
                    >
                      <span class="inline-flex items-center gap-1.5 text-danger">
                        {t('mycommentspanel.deleteThisComment')}
                      </span>
                      <button
                        type="button"
                        disabled={deletingId() === comment.id}
                        onClick={() => void remove(comment.id)} class="action action-danger"
                       
                      >
                        <Trash class="size-4" aria-hidden="true" />
                        {deletingId() === comment.id ? t('mycommentspanel.deleting') : t('mycommentspanel.confirm')}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId() === comment.id}
                        onClick={() => setConfirmingId(null)} class="action action-ghost"
                       
                      >
                        {t('myarticles.cancel')}
                      </button>
                    </Show>
                  </div>
                </div>
              </article>
            )}
          </For>
        </ListPanelRows>
      </Show>
    </ListPanel>
  );
}

export default withLocale(MyCommentsPanel);
