import { createStore } from 'solid-js/store';
import { For, onMount, Show } from 'solid-js';
import { Eye, Newspaper } from 'lucide-solid';
import ShareButton from '@/shared/ui/components/actions/share-button.component.tsx';
import { listNews } from '@/features/news/actions/news.action.ts';
import type { NewsItem } from '@/features/news/types/news.dto.type.ts';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import { routes } from '@/shared/navigation/routes';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/news/i18n';
import type { NewsListingState } from './news-listing.component.tsx';
import { toNewsQuery } from '../utils/news-listing-query.util.ts';

function NewsHighlights(props: { initialState: NewsListingState; pageSize: number }) {
  const { t, locale } = useI18n();
  const [state, setState] = createStore({ featured: null as NewsItem | null, popular: [] as NewsItem[] });

  onMount(() => {
    void Promise.all([
      listNews(toNewsQuery(props.initialState, props.pageSize)),
      listNews({ page: 1, pageSize: 4, sort: 'views' }),
    ]).then(([featuredResult, popularResult]) => {
      setState({
        featured: featuredResult.items[0] ?? null,
        popular: [...popularResult.items].sort((a, b) => b.views - a.views).slice(0, 4),
      });
    });
  });

  return (
    <Show when={state.featured}>
      {(news) => {
        const href = () => routes.newsDetail(news().slug);
        const views = () =>
          new Intl.NumberFormat(locale(), { notation: 'compact', maximumFractionDigits: 1 }).format(news().views);
        return (
          <div class="grid grid-cols-[minmax(0,1fr)_31%] overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-ui-surface max-[1100px]:grid-cols-1">
            <article class="grid min-h-72 grid-cols-[42%_minmax(0,1fr)] overflow-hidden max-[760px]:grid-cols-1">
              <a href={href()} class="relative min-h-56 overflow-hidden bg-accent-gradient" aria-label={news().title}>
                <Show when={news().coverImageUrl}>
                  {(cover) => (
                    <img src={cover()} alt="" loading="eager" class="absolute inset-0 size-full object-cover" />
                  )}
                </Show>
              </a>
              <div class="flex flex-col p-5 sm:p-6">
                <p class="text-accent-label flex items-center gap-2">
                  <Newspaper size={15} /> {t('news.featured')}
                </p>
                <h2 class="heading-strong-section mt-2">
                  <a href={href()} class="hover:text-content-accent">
                    {news().title}
                  </a>
                </h2>
                <p class="text-muted-body mt-2 line-clamp-4">
                  {news().description}
                </p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <For each={news().tags.slice(0, 5)}>
                    {(tag) => (
                      <a
                        href={routes.searchByTag(tag.slug)}
                        class="rounded-full border border-line px-2.5 py-1 text-xs text-content-muted hover:border-action-border hover:text-content-accent"
                      >
                        #{tag.name}
                      </a>
                    )}
                  </For>
                </div>
                <div class="mt-auto flex flex-wrap items-center gap-3 border-t border-line pt-4 text-xs text-content-muted">
                  <span>{formatPublicDate(news().publishedAt ?? news().updatedAt, locale())}</span>
                  <span class="inline-flex items-center gap-1">
                    <Eye size={15} />
                    {views()}
                  </span>
                  <span class="ml-auto">
                    <ShareButton
                      title={news().title}
                      url={href()}
                      label={t('newsdetail.shareNews')}
                      copiedLabel={t('newsdetail.linkCopied')}
                    />
                  </span>
                </div>
              </div>
            </article>
            <aside class="border-l border-line p-5 max-[1100px]:border-t max-[1100px]:border-l-0">
              <div class="flex items-center justify-between">
                <h2 class="heading-callout">
                  {t('news.mostRead')}
                </h2>
                <a href="#news" class="text-xs text-content-accent">
                  {t('news.viewAll')}
                </a>
              </div>
              <ol class="grid">
                <For each={state.popular}>
                  {(item, index) => (
                    <li class="grid grid-cols-[2rem_1fr] items-center gap-3 border-t border-line py-3 text-xs">
                      <b class="grid size-8 place-items-center rounded-full bg-action-deep text-content-inverse">
                        {index() + 1}
                      </b>
                      <a href={routes.newsDetail(item.slug)} class="hover:text-content-accent">
                        {item.title}
                      </a>
                    </li>
                  )}
                </For>
              </ol>
            </aside>
          </div>
        );
      }}
    </Show>
  );
}

export default withLocale(NewsHighlights);
