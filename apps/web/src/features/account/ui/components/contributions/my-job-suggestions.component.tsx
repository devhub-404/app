import { listMyJobSuggestions } from '@/features/job/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import SuggestionHistory from './suggestion-history.component.tsx';

function MyJobSuggestions() {
  const { t } = useI18n();
  return (
    <SuggestionHistory
      title={t('myjobsuggestions.jobSuggestions')}
      description={t('myjobsuggestions.trackSuggestions')}
      refreshLabel={t('myeventsuggestions.update')}
      loadingLabel={t('myeventsuggestions.loadingSuggestions')}
      errorMessage={t('myeventsuggestions.couldNotLoadSuggestions')}
      retryLabel={t('myeventsuggestions.tryAgain')}
      emptyLabel={t('myjobsuggestions.empty')}
      loadItems={async () => {
        const result = await listMyJobSuggestions();
        if (result.error) throw new Error('job suggestions unavailable');
        return result.items.map((item) => ({
          id: item.id,
          label: item.label,
          status: item.status,
          createdAt: item.createdAt,
          href: item.url,
        }));
      }}
    />
  );
}

export default withLocale(MyJobSuggestions);
