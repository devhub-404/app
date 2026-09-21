import { renderContentToHtml } from '@/shared/ui/editor/content';
import PreviewDialog from '@/shared/ui/components/dialogs/preview-dialog.component.tsx';
import { useI18n } from '@/features/news/i18n';

export default function NewsPreviewDialog(props: { title: string; content: string; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <PreviewDialog
      titleId="news-preview-title"
      closeLabel={t('newsform.close')}
      onClose={props.onClose}
      header={
        <h2 id="news-preview-title" class="heading-section">
          {props.title || t('newsform.withoutTitle')}
        </h2>
      }
    >
      <div
        class="content-prose"
        innerHTML={renderContentToHtml(props.content) || `<p>${t('newsform.withoutContent')}</p>`}
      />
    </PreviewDialog>
  );
}
