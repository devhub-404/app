import { onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { editorialArticlesQuery } from '@/features/article/actions/article.action.ts';
import type { ArticleItem } from '@/features/article/types/article.type.ts';
import ArticleListingCard from './article-listing-card.component.tsx';
import TrendingArticles from './trending-articles.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';

type EditorialState = {
  loading: boolean;
  featured?: ArticleItem;
  mostViewed: ArticleItem[];
};

function ArticleEditorial() {
  const [state, setState] = createStore<EditorialState>({ loading: true, mostViewed: [] });

  onMount(async () => {
    try {
      const result = await editorialArticlesQuery(undefined, 'all');
      setState({ featured: result.featured, mostViewed: result.mostViewed });
    } finally {
      setState('loading', false);
    }
  });

  return (
    <Show
      when={!state.loading}
      fallback={
        <section class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_31%]" aria-busy="true">
          <div class="h-56 rounded-2xl border border-line bg-surface-elevated" />
          <div class="hidden h-56 rounded-2xl border border-line bg-surface-elevated lg:block" />
        </section>
      }
    >
      <Show when={state.featured}>
        {(featured) => (
          <div class="grid grid-cols-[minmax(0,1fr)_31%] gap-4 max-[1100px]:grid-cols-1">
            <ArticleListingCard article={featured()} view="list" />
            <aside class="rounded-2xl border border-line bg-surface-elevated">
              <TrendingArticles items={state.mostViewed} />
            </aside>
          </div>
        )}
      </Show>
    </Show>
  );
}

export default withLocale(ArticleEditorial);
