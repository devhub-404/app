import { Show } from 'solid-js';
import { useI18n } from '@/features/article/i18n';
import EditorManagementPanel from '@/shared/ui/editor/components/editor-management-panel.component.tsx';
import { Archive, ArchiveRestore, MessageSquare, MessageSquareOff, Trash } from 'lucide-solid';

interface Props {
  canArchive: boolean;
  canUnarchive: boolean;
  canDelete: boolean;
  archiveAvailable: boolean;
  unarchiveAvailable: boolean;
  deleteAvailable: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
  onDeleteRequest: () => void;
  onEnableComments: () => void;
  onDisableComments: () => void;
}

export default function ArticleEditorManagementPanel(props: Props) {
  const { t } = useI18n();
  return (
    <EditorManagementPanel heading={t('articleform.manage')}>
      <Show when={props.canArchive}>
        <button type="button" disabled={!props.archiveAvailable} onClick={props.onArchive} class="action action-secondary">
          <Archive class="size-4" />
          {t('articleform.archive')}
        </button>
      </Show>
      <Show when={props.canUnarchive}>
        <button type="button" disabled={!props.unarchiveAvailable} onClick={props.onUnarchive} class="action action-secondary">
          <ArchiveRestore class="size-4" />
          {t('articleform.unarchive')}
        </button>
      </Show>
      <div class="grid grid-cols-2 gap-2">
        <button type="button" onClick={props.onEnableComments} class="action action-secondary">
          <MessageSquare class="size-4" />
          {t('articleform.enableComments')}
        </button>
        <button type="button" onClick={props.onDisableComments} class="action action-secondary">
          <MessageSquareOff class="size-4" />
          {t('articleform.disableComments')}
        </button>
      </div>
      <Show when={props.canDelete}>
        <button type="button" disabled={!props.deleteAvailable} onClick={props.onDeleteRequest} class="action action-danger">
          <Trash class="size-4" />
          {t('articleform.deleteArticle')}
        </button>
      </Show>
    </EditorManagementPanel>
  );
}
