import DestructiveDialog from '@/shared/ui/components/dialogs/destructive-dialog.component.tsx';
import { useI18n } from '@/features/article/i18n';

interface Props {
  open: boolean;
  deleteAvailable: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ArticleDeleteDialog(props: Props) {
  const { t } = useI18n();

  return (
    <DestructiveDialog
      open={props.open}
      onOpenChange={(open) => !open && props.onCancel()}
      titleId="delete-article-heading"
      accessibleLabel={t('articleform.deleteThisArticlePermanently')}
      title={t('articleform.deleteThisArticlePermanently')}
      confirmLabel={t('articleform.confirmDeletion')}
      cancelLabel={t('articleform.cancel')}
      confirmDisabled={!props.deleteAvailable}
      onConfirm={props.onConfirm}
    />
  );
}
