import { EyeOff, Eye, RefreshCw } from 'lucide-solid';
import { createSignal, For, onMount, Show } from 'solid-js';
import { hideComment, listCommentsForAdministration, unhideComment, type CommentDTO } from '@/features/comment/public';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelActionHeader from '@/shared/ui/components/surfaces/list-panel-action-header.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import ManagementListItem from '@/shared/ui/components/surfaces/management-list-item.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
function CommentsAdminList() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<CommentDTO[]>([]);
  const [loading, setLoading] = createSignal(true);
  const load = async () => {
    setLoading(true);
    try {
      const result = await listCommentsForAdministration();
      setItems(result.data?.data?.items ?? []);
    } finally {
      setLoading(false);
    }
  };
  const updateVisibility = async (comment: CommentDTO) => {
    if (comment.hiddenAt) await unhideComment(comment.id);
    else await hideComment(comment.id);
    await load();
  };
  onMount(() => void load());
  return (
    <ListPanel>
      <ListPanelActionHeader>
        <PanelHeading
          title={t('commentsadminlist.comments')}
          description={t('commentsadminlist.reviewContextAdjustVisibilityWhenNecessary')}
        />
        <button type="button" onClick={() => void load()} disabled={loading()} class="action action-secondary">
          <RefreshCw class="size-4" />
          {loading() ? t('common.refreshing') : t('common.refresh')}
        </button>
      </ListPanelActionHeader>
      <Show when={!loading()} fallback={<LoadingState>{t('commentsadminlist.loadingComments')}</LoadingState>}>
        <ListPanelList>
          <For
            each={items()}
            fallback={
              <li class="px-6 py-12 text-center">
                <p class="text-strong">{t('commentsadminlist.noCommentFound')}</p>
              </li>
            }
          >
            {(comment) => (
              <li>
                <ManagementListItem
                  status={
                    <StatusBadge status={comment.hiddenAt ? 'danger' : 'success'}>
                      {comment.hiddenAt ? t('articlesmoderationlist.hidden') : t('commentsadminlist.visible')}
                    </StatusBadge>
                  }
                  meta={
                    <span class="text-xs text-content-muted">
                      {comment.author?.displayName ??
                        comment.author?.username ??
                        t('commentsadminlist.authorUnavailable')}
                    </span>
                  }
                  title={<span class="line-clamp-2 text-sm font-normal text-content">{comment.content}</span>}
                  actions={
                    <div class="flex flex-wrap gap-2">
                      <button type="button" onClick={() => void updateVisibility(comment)} class="action action-secondary">
                        comment.hiddenAt ? <Eye class="size-3.5" /> : <EyeOff class="size-3.5" />
                        {comment.hiddenAt ? t('commentsadminlist.show') : t('commentsadminlist.hide')}
                      </button>
                    </div>
                  }
                />
              </li>
            )}
          </For>
        </ListPanelList>
      </Show>
    </ListPanel>
  );
}

export default withLocale(CommentsAdminList);
