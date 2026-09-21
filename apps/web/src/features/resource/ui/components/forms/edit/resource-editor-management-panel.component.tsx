import { Show } from 'solid-js';
import EditorManagementPanel from '@/shared/ui/editor/components/editor-management-panel.component.tsx';
import { useI18n } from '@/features/resource/i18n';
import { Archive, ArchiveRestore, Trash } from 'lucide-solid';

export default function ResourceEditorManagementPanel(props: {
  busy: boolean;
  canArchive: boolean;
  canArchiveNow: boolean;
  canUnarchive: boolean;
  canUnarchiveNow: boolean;
  canDelete: boolean;
  onArchive: () => void;
  onUnarchive: () => void;
  onRequestDelete: () => void;
}) {
  const { t } = useI18n();
  return (
    <EditorManagementPanel heading={t('resourceform.manage')}>
      <Show when={props.canArchive}>
        <button
         
          type="button"
          disabled={!props.canArchiveNow || props.busy}
          onClick={props.onArchive} class="action action-secondary"
        >
          <Archive class="size-4" />
          {t('resourceform.archive')}
        </button>
      </Show>
      <Show when={props.canUnarchive}>
        <button
         
          type="button"
          disabled={!props.canUnarchiveNow || props.busy}
          onClick={props.onUnarchive} class="action action-secondary"
        >
          <ArchiveRestore class="size-4" />
          {t('resourceform.unarchive')}
        </button>
      </Show>
      <Show when={props.canDelete}>
        <button type="button" disabled={props.busy} onClick={props.onRequestDelete} class="action action-danger">
          <Trash class="size-4" />
          {t('resourceform.deleteResource')}
        </button>
      </Show>
      <p class="text-caption">{t('resourceform.deletionRequiresConfirmation')}</p>
    </EditorManagementPanel>
  );
}
