import { loadMyNewsSuggestions } from '@/features/news/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import SuggestionHistory from './suggestion-history.component.tsx';

function MyNewsSuggestionsPage() {
  const { t } = useI18n();
  return (
    <SuggestionHistory
      title={t('mynewssuggestions.suggestionsNews')}
      description={t('mynewssuggestions.trackUrlsYouSentReviewEditorial')}
      refreshLabel={t('myeventsuggestions.update')}
      loadingLabel={t('mynewssuggestions.loadingSuggestions')}
      errorMessage={t('mynewssuggestions.couldNotLoadSuggestions')}
      retryLabel={t('myeventsuggestions.tryAgain')}
      emptyLabel={t('mynewssuggestions.suggestSourceRelevantFeedCommunity')}
      loadItems={async () => {
        const result = await loadMyNewsSuggestions();
        if (result.error) throw new Error('news suggestions unavailable');
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

export default withLocale(MyNewsSuggestionsPage);
