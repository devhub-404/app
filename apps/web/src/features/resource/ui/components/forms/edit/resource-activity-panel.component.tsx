import { useI18n } from '@/features/resource/i18n';

export default function ResourceActivityPanel(props: { votes: number }) {
  const { t } = useI18n();
  return (
    <section class="rounded-2xl border border-line bg-surface-elevated p-5">
      <h2 class="heading-tiny text-xs">
        {t('resourceform.activity')}
      </h2>
      <p class="text-body mt-4">
        ↑ {props.votes} {t('resourceform.votes')}
      </p>
    </section>
  );
}
