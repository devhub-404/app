import { listMyResourceSuggestions } from '@/features/resource/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import SuggestionHistory from './suggestion-history.component.tsx';

function MyResourceSuggestions() {
  const { t } = useI18n();
  return (
    <SuggestionHistory
      title={t('myresourcesuggestions.resourceSuggestions')}
      description={t('myresourcesuggestions.trackUrlsSubmittedResultReview')}
      refreshLabel={t('myeventsuggestions.update')}
      loadingLabel={t('myeventsuggestions.loadingSuggestions')}
      errorMessage={t('myeventsuggestions.couldNotLoadSuggestions')}
      retryLabel={t('myeventsuggestions.tryAgain')}
      emptyLabel={t('myresourcesuggestions.submitUsefulReferenceToHelpOthers')}
      loadItems={async () => {
        const result = await listMyResourceSuggestions();
        if (result.error) throw new Error('resource suggestions unavailable');
        return result.items.map((item) => ({
          id: item.id,
          label: item.url,
          status: item.status,
          createdAt: item.createdAt,
        }));
      }}
    />
  );
}

export default withLocale(MyResourceSuggestions);
