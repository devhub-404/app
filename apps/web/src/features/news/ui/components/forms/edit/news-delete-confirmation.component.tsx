import { Show } from 'solid-js';
import DestructiveConfirmation from '@/shared/ui/components/feedback/destructive-confirmation.component.tsx';
import { useI18n } from '@/features/news/i18n';

interface Props {
  open: boolean;
  deleteAvailable: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function NewsDeleteConfirmation(props: Props) {
  const { t } = useI18n();
  return (
    <Show when={props.open}>
      <DestructiveConfirmation
        accessibleLabel={t('newsform.confirmDeletion')}
        title={t('newsform.deleteThisNewsPermanently')}
        description={t('newsform.deletionRequiresConfirmation')}
        confirmLabel={t('newsform.confirmDeletion')}
        cancelLabel={t('newsform.cancel')}
        busy={!props.deleteAvailable}
        onConfirm={props.onConfirm}
        onCancel={props.onCancel}
      />
    </Show>
  );
}
