import { Save } from 'lucide-solid';
import { useI18n } from '@/features/resource/i18n';

export default function ResourceEditorStatusPanel(props: {
  status: string | null | undefined;
  busy: boolean;
  canSave: boolean;
  onSave: () => void;
}) {
  const { t } = useI18n();
  return (
    <section class="rounded-2xl border border-line bg-surface-elevated p-5">
      <h2 class="heading-tiny text-xs">
        {t('resourceform.status')}
      </h2>
      <p class="text-strong mt-4 flex items-center gap-2">
        <span class="size-2 rounded-full bg-action" />
        {props.status?.toUpperCase() ?? t('resourceform.new')}
      </p>
      <div class="mt-5">
        <button type="button" disabled={!props.canSave || props.busy} onClick={props.onSave} class="action action-primary">
          <Save class="size-4" />
          {t('resourceform.saveChanges')}
        </button>
      </div>
    </section>
  );
}
