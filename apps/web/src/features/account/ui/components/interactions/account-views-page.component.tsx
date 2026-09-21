import SectionCard, { SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
function AccountViewsPage() {
  const { t } = useI18n();
  return (
    <SectionCard>
      <SectionCardHeading
        title={t('accountviews.views')}
        description={t('accountviews.devhubUsesViewsHowMetricAggregatedContentNotKeepsHistory')}
      />
    </SectionCard>
  );
}

export default withLocale(AccountViewsPage);
