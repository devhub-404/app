import type { Project } from '@/features/project/types/project.type.ts';
import { useI18n } from '@/features/project/i18n';
import PreviewDialog from '@/shared/ui/components/dialogs/preview-dialog.component.tsx';

export default function ProjectPreviewDialog(props: { project: Project; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <PreviewDialog
      titleId="project-preview-title"
      closeLabel={t('editproject.close')}
      onClose={props.onClose}
      header={
        <div>
          <p class="text-accent-label">{t('editproject.preview')}</p>
          <h2 id="project-preview-title" class="heading-large-section mt-2">
            {props.project.title || t('editproject.withoutTitle')}
          </h2>
          <p class="text-muted mt-2">
            {props.project.summary || t('editproject.withoutSummary')}
          </p>
        </div>
      }
    >
      <p class="text-body whitespace-pre-wrap">
        {props.project.description || t('editproject.withoutDescription')}
      </p>
    </PreviewDialog>
  );
}
