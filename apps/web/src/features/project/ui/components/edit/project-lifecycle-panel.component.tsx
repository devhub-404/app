import { Show, createSignal } from 'solid-js';
import type { Project } from '@/features/project/types/project.type.ts';
import { useI18n } from '@/features/project/i18n';
import LifecyclePanel from '@/shared/ui/editor/components/lifecycle-panel.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
import DestructiveConfirmation from '@/shared/ui/components/feedback/destructive-confirmation.component.tsx';
import { Archive, ArchiveRestore, Send, Trash } from 'lucide-solid';

export default function ProjectLifecyclePanel(props: {
  project: Project;
  busy: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canUnarchive: boolean;
  canDelete: boolean;
  onAction: (action: 'publish' | 'archive' | 'unarchive' | 'delete') => void;
}) {
  const { t } = useI18n();
  const [confirmDelete, setConfirmDelete] = createSignal(false);
  return (
    <LifecyclePanel
      headingId="project-lifecycle-heading"
      eyebrow={t('editproject.publication')}
      heading={
        <>
          {t('editproject.status')} {props.project.status}
        </>
      }
      badge={
        <Show when={props.project.hiddenAt}>
          <StatusBadge status="danger">{t('editproject.hiddenByModeration')}</StatusBadge>
        </Show>
      }
      description={<>{t('editproject.manageVisibilityThisProjectWithoutSignOutEditing')}</>}
      actions={
        <>
          <Show when={props.canPublish}>
            <button type="button" disabled={props.busy} onClick={() => props.onAction('publish')} class="action action-primary">
              <Send class="size-4" />
              {props.busy ? t('editproject.applying') : t('editproject.publish')}
            </button>
          </Show>
          <Show when={props.canArchive}>
            <button type="button" disabled={props.busy} onClick={() => props.onAction('archive')} class="action action-secondary">
              <Archive class="size-4" />
              {props.busy ? t('editproject.applying') : t('editproject.archive')}
            </button>
          </Show>
          <Show when={props.canUnarchive}>
            <button type="button" disabled={props.busy} onClick={() => props.onAction('unarchive')} class="action action-primary">
              <ArchiveRestore class="size-4" />
              {props.busy ? t('editproject.applying') : t('editproject.unarchive')}
            </button>
          </Show>
          <Show when={props.canDelete}>
            <button type="button" disabled={props.busy} onClick={() => setConfirmDelete(true)} class="action action-danger-outline">
              <Trash class="size-4" />
              {t('editproject.delete')}
            </button>
          </Show>
        </>
      }
      confirmation={
        <Show when={confirmDelete()}>
          <DestructiveConfirmation
            accessibleLabel={t('editproject.confirmDeletionProject')}
            title={t('editproject.deleteThisProjectPermanently')}
            description={t('editproject.deletionRemovesProjectFromPublicProfile')}
            confirmLabel={props.busy ? t('editproject.deleting') : t('editproject.confirmDeletion')}
            cancelLabel={t('editproject.cancel')}
            busy={props.busy}
            onConfirm={() => props.onAction('delete')}
            onCancel={() => setConfirmDelete(false)}
          />
        </Show>
      }
    />
  );
}
