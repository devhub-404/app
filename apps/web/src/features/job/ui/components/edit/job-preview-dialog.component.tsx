import type { Job } from '@/features/job/types/job.type.ts';
import { useI18n } from '@/features/job/i18n';
import PreviewDialog from '@/shared/ui/components/dialogs/preview-dialog.component.tsx';

export default function JobPreviewDialog(props: { job: Job; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <PreviewDialog
      titleId="job-preview-title"
      closeLabel={t('editjob.close')}
      onClose={props.onClose}
      header={
        <div>
          <p class="text-accent-label">{t('editjob.preview')}</p>
          <h2 id="job-preview-title" class="heading-large-section mt-2">
            {props.job.title || t('editjob.withoutTitle')}
          </h2>
        </div>
      }
    >
      <p class="text-body whitespace-pre-wrap">
        {props.job.description || t('editjob.withoutDescription')}
      </p>
    </PreviewDialog>
  );
}
