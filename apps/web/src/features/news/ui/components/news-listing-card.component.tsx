import { Eye } from 'lucide-solid';
import type { NewsItem } from '@/features/news/types/news.dto.type.ts';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import ShareButton from '@/shared/ui/components/actions/share-button.component.tsx';
import { translate as translateShared } from '@/shared/i18n';
import { useI18n } from '@/features/news/i18n';
import { routes } from '@/shared/navigation/routes';

type Props = { news: NewsItem; view: 'grid' | 'list' };

export default function NewsListingCard(props: Props) {
  const { t, locale } = useI18n();
  const news = () => props.news;
  const href = () => `/news/${encodeURIComponent(news().slug)}`;
  const horizontal = () => props.view === 'list';
  const count = () =>
    new Intl.NumberFormat(locale(), { notation: 'compact', maximumFractionDigits: 1 }).format(news().views);
  const coverImageUrl = () => news().coverImageUrl ?? undefined;

  return (
    <article
      class={`group h-full overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-sm transition hover:-translate-y-0.5 hover:border-action-border hover:shadow-md ${horizontal() ? 'grid grid-cols-[32%_minmax(0,1fr)] max-[700px]:grid-cols-[38%_minmax(0,1fr)]' : 'flex flex-col'}`}
    >
      <a
        href={href()}
        class={`relative block overflow-hidden bg-accent-gradient ${horizontal() ? 'min-h-36' : 'aspect-[16/9]'}`}
        aria-label={news().title}
      >
        {coverImageUrl() && (
          <img src={coverImageUrl()} alt="" loading="lazy" class="absolute inset-0 size-full object-cover" />
        )}
      </a>
      <div class="flex min-w-0 flex-1 flex-col p-4">
        <h2 class="heading-card line-clamp-2 text-lg">
          <a href={href()} class="hover:text-content-accent">
            {news().title}
          </a>
        </h2>
        <p class="text-muted-compact mt-1 line-clamp-3">
          {news().description}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          {news()
            .tags.slice(0, 4)
            .map((tag) => (
              <a
                href={routes.searchByTag(tag.slug)}
                class="rounded-full border border-line px-2.5 py-1 text-xs text-content-muted hover:border-action-border hover:text-content-accent"
                aria-label={translateShared(locale(), 'taglink.searchContentTagValue0', [tag.name])}
              >
                #{tag.name}
              </a>
            ))}
        </div>
        <div class="mt-auto flex flex-wrap items-center gap-3 border-t border-line pt-3 text-xs text-content-muted">
          <span>{formatPublicDate(news().publishedAt ?? news().updatedAt, locale())}</span>
          <span class="inline-flex items-center gap-1">
            <Eye class="size-[15px]" aria-hidden="true" />
            {count()}
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
  );
}
