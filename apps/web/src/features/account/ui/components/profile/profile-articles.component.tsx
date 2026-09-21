import { For, Show } from 'solid-js';
import type { ArticleItem } from '@/features/article/public';
import { ArticleSummaryCard } from '@/features/article/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import { useProfileArticles } from '@/features/account/ui/hooks/use-profile-articles.hook.ts';
import RetryErrorState from '@/shared/ui/components/feedback/retry-error-state.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import SectionCard from '@/shared/ui/components/surfaces/section-card.component.tsx';

type Props = {
  username: string;
  initialItems?: ArticleItem[];
  initialError?: boolean;
};

function ProfileArticles(props: Props) {
  const { t } = useI18n();
  const articles = useProfileArticles(props);

  return (
    <SectionCard>
      <Show when={!articles.loading()} fallback={<LoadingState>{t('profilearticles.loadingArticles')}</LoadingState>}>
        <Show
          when={!articles.error()}
          fallback={
            <RetryErrorState
              message={t('profilearticles.couldNotLoadArticlesThisProfile')}
              retryLabel={t('profilearticles.tryAgain')}
              onRetry={() => void articles.load()}
            />
          }
        >
          <Show
            when={articles.items().length > 0}
            fallback={<EmptyState>{t('profilearticles.noArticlesPublishedYet')}</EmptyState>}
          >
            <div class="grid gap-4 md:grid-cols-2">
              <For each={articles.items()}>
                {(item) => {
                  const personal = () => articles.personal()[item.id] ?? { voted: false, bookmarked: false };
                  return (
                    <ArticleSummaryCard
                      item={item}
                      voted={personal().voted}
                      bookmarked={personal().bookmarked}
                      pending={Boolean(articles.pending()[item.id]) || articles.personalLoading()}
                      votes={articles.votesFor(item)}
                      message={articles.messages()[item.id]}
                      onVote={() => void articles.vote(item)}
                      onBookmark={() => void articles.bookmark(item)}
                      onShare={() => void articles.share(item)}
                    />
                  );
                }}
              </For>
            </div>
          </Show>
        </Show>
      </Show>
    </SectionCard>
  );
}

export default withLocale(ProfileArticles);
