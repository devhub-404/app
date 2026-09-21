import { ArrowRight, BookOpen, Eye } from 'lucide-solid';
import { For } from 'solid-js';
import type { ArticleItem } from '@/features/article/types/article.type.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/article/i18n';
interface Props {
  items: ArticleItem[];
}

function TrendingArticles(props: Props) {
  const { t, locale } = useI18n();
  const href = (item: ArticleItem) => `/articles/${encodeURIComponent(item.slug)}`;
  const metric = (value: number) =>
    new Intl.NumberFormat(locale(), { notation: 'compact', maximumFractionDigits: 1 }).format(value);

  return (
    <div class="px-[1.3rem] py-[1.1rem] max-[700px]:p-[.8rem]">
      <div class="flex items-center justify-between">
        <h2 class="heading-dense-card-inline m-0 flex items-center gap-[.55rem]">
          <BookOpen size={18} class="text-content-accent" />
          {t('listing.trending')}
        </h2>
        <a
          href="/articles?sort=views#articles"
          class="flex items-center gap-[.3rem] rounded-sm text-xs text-content-muted outline-none hover:text-content-accent focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated"
        >
          {t('listing.viewAll')}
          <ArrowRight size={15} />
        </a>
      </div>
      <ol class="mt-[.45rem] list-none p-0">
        <For
          each={props.items}
          fallback={<li class="py-3 text-xs text-content-muted">{t('article.noArticlesInSelection')}</li>}
        >
          {(item, index) => (
            <li class="grid grid-cols-[2rem_1fr_auto] items-center gap-[.7rem] border-t border-line py-[.68rem] text-[.76rem] max-[700px]:grid-cols-[1.4rem_1fr_auto] max-[700px]:text-[.7rem]!">
              <b
                class={`grid size-8 place-items-center rounded-full text-[.9rem] max-[700px]:size-[1.4rem] max-[700px]:text-[.72rem] ${index() === 3 ? 'border border-line text-content-muted' : 'bg-action-deep text-content-inverse'}`}
              >
                {index() + 1}
              </b>
              <a
                href={href(item)}
                class="rounded-sm outline-none hover:text-content-accent focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated"
              >
                {item.title}
              </a>
              <small class="flex items-center gap-1 whitespace-nowrap text-content-muted">
                <Eye size={15} />
                {metric(item.views)}
              </small>
            </li>
          )}
        </For>
      </ol>
    </div>
  );
}

export default withLocale(TrendingArticles);
