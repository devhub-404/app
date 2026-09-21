import { listMyEventSuggestionsQuery } from '@/features/event/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import SuggestionHistory from './suggestion-history.component.tsx';

function MyEventSuggestions() {
  const { t } = useI18n();
  return (
    <SuggestionHistory
      title={t('myeventsuggestions.eventSuggestions')}
      description={t('myeventsuggestions.trackEventsYouSubmittedPublication')}
      refreshLabel={t('myeventsuggestions.update')}
      loadingLabel={t('myeventsuggestions.loadingSuggestions')}
      errorMessage={t('myeventsuggestions.couldNotLoadSuggestions')}
      retryLabel={t('myeventsuggestions.tryAgain')}
      emptyLabel={t('myeventsuggestions.sendEventWorthWhileTrackCommunity')}
      loadItems={async () => {
        const result = await listMyEventSuggestionsQuery();
        if (result.error) throw new Error('event suggestions unavailable');
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

export default withLocale(MyEventSuggestions);
