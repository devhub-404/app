import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { For, Show } from 'solid-js';
import type { ArticleItem } from '@/features/article/types/article.type.ts';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import TagLink from '@/shared/ui/components/navigation/tag-link.component.tsx';
import { useI18n } from '@/features/article/i18n';
import { ArrowUp, BookOpen, Bookmark, Clock3, Eye, MessageCircle, Pencil, Share2 } from 'lucide-solid';
export default function ArticleSummaryCard(props: {
  item: ArticleItem;
  voted: boolean;
  bookmarked: boolean;
  pending: boolean;
  votes: number;
  message?: string;
  manageHref?: string;
  onVote: () => void;
  onBookmark: () => void;
  onShare: () => void;
}) {
  const { t, locale } = useI18n();
  const date = () => formatPublicDate(props.item.publishedAt ?? props.item.updatedAt, locale());
  const href = () => `/articles/${encodeURIComponent(props.item.slug)}`;

  return (
    <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-sm transition duration-standard ease-standard hover:-translate-y-0.5 hover:border-action-border hover:shadow-md">
      <div class="relative aspect-[16/9] shrink-0 overflow-hidden bg-surface-subtle">
        {props.item.coverImageUrl ? (
          <img
            src={props.item.coverImageUrl}
            alt=""
            class="size-full object-cover transition duration-slow ease-standard group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div class="flex size-full min-h-32 items-center justify-center bg-accent-gradient">
            <BookOpen class="size-10 text-content-accent" aria-hidden="true" />
          </div>
        )}
      </div>
      <div class="flex min-w-0 flex-1 flex-col p-4">
        <p class="text-eyebrow min-h-5">
          {props.item.readingTimeMinutes <= 8
            ? t('articlecard.readingQuick')
            : props.item.readingTimeMinutes >= 12
              ? t('articlecard.readingDeep')
              : t('articlecard.readingGuided')}
        </p>
        <h2 class="heading-card mt-2 line-clamp-2 text-lg">
          <a
            href={href()}
            class="transition duration-standard ease-standard hover:text-content-accent active:opacity-80"
          >
            {props.item.title}
          </a>
        </h2>
        <p class="text-muted-compact mt-1 line-clamp-3">
          {props.item.description}
        </p>
        <div class="mt-2 flex flex-wrap content-start gap-2">
          <For each={props.item.tags.slice(0, 4)}>{(tag) => <TagLink slug={tag.slug} label={tag.name} />}</For>
        </div>
        <div class="mt-3 flex min-h-5 flex-wrap items-center gap-x-3 gap-y-2 text-xs text-content-muted">
          <Show when={props.item.author} fallback={<span>{t('articledetail.authorUnavailable')}</span>}>
            {(author) => (
              <a
                href={`/profile/${encodeURIComponent(author().username)}`}
                class="transition duration-standard ease-standard hover:text-content-accent"
              >
                {author().displayName || author().username}
              </a>
            )}
          </Show>
          <span class="text-content-subtle">•</span>
          <span
            class="inline-flex items-center gap-1"
            title={t('articlecard.value0MinutesReading', [props.item.readingTimeMinutes])}
          >
            <Clock3 class="size-3.5" aria-hidden="true" />
            {props.item.readingTimeMinutes} {t('articledetail.min')}
          </span>
          <span class="text-content-subtle">•</span>
          <span>{date()}</span>
        </div>
        <div class="mt-3 grid grid-cols-5 items-center gap-2 border-t border-line pt-3">
          <ToggleButton
            type="button"
            disabled={props.pending}
            onClick={props.onVote}
            aria-label={props.voted ? t('articledetail.removeVoteArticle') : t('articledetail.markArticleHowUseful')}
            pressed={props.voted}
            size="sm"
            title={props.voted ? t('articledetail.removeVoteArticle') : t('articledetail.markArticleHowUseful')}
          >
            <ArrowUp class="size-4" aria-hidden="true" />
            <span>{props.votes}</span>
          </ToggleButton>
          <ToggleButton
            type="button"
            disabled={props.pending}
            onClick={props.onBookmark}
            aria-label={props.bookmarked ? t('articledetail.removeArticleSaved') : t('articledetail.saveArticle')}
            pressed={props.bookmarked}
            size="sm"
            title={props.bookmarked ? t('articledetail.removeArticleSaved') : t('articledetail.saveArticle')}
          >
            <Bookmark class={`size-4 ${props.bookmarked ? 'fill-current' : ''}`} aria-hidden="true" />
          </ToggleButton>
          <button
            type="button"
            onClick={props.onShare}
            aria-label={t('articledetail.shareArticle')}
            title={t('articledetail.shareArticle')} class="action action-ghost"
           
          >
            <Share2 class="size-4" aria-hidden="true" />
          </button>
          <span
            class="flex min-w-0 items-center justify-center gap-1.5 py-2 text-xs text-content-muted"
            title={t('articledetail.views')}
          >
            <Eye class="size-4" aria-hidden="true" />
            <span>{props.item.views}</span>
          </span>
          <span
            class="flex min-w-0 items-center justify-center gap-1.5 py-2 text-xs text-content-muted"
            title={t('articledetail.comments')}
          >
            <MessageCircle class="size-4" aria-hidden="true" />
            <span>{props.item.commentCount}</span>
          </span>
        </div>
        <Show when={props.manageHref}>
          {(manageHref) => (
            <a
              href={manageHref()}
              title={t('articledetail.editArticle')}
              aria-label={t('articledetail.editArticle')}
              class="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-content-muted hover:text-content-accent"
            >
              <Pencil class="size-3.5" aria-hidden="true" /> {t('articlecard.edit')}
            </a>
          )}
        </Show>
        <Show when={props.message}>
          <p role="status" aria-live="polite" class="text-caption mt-2">
            {props.message}
          </p>
        </Show>
      </div>
    </article>
  );
}
