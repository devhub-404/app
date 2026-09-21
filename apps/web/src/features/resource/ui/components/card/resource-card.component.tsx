import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { Bookmark, ExternalLink, Share2, ThumbsUp } from 'lucide-solid';
import { createMemo, For, Show } from 'solid-js';
import type { ResourceItem } from '@/features/resource/types/resource.type.ts';
import TagLink from '@/shared/ui/components/navigation/tag-link.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/resource/i18n';
import { useResourceInteractions } from '../../hooks/use-resource-interactions.hook.ts';
import { ReportButton } from '@/features/report/public';

function ResourceCard(props: { item: ResourceItem }) {
  const { t, locale } = useI18n();
  const items = () => [props.item];
  const interactions = useResourceInteractions(items);
  const personal = () => interactions.personal()[props.item.id] ?? { voted: false, bookmarked: false };
  const domain = createMemo(() => {
    try {
      return new URL(props.item.url).hostname;
    } catch {
      return null;
    }
  });
  const favicon = createMemo(
    () => `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(props.item.url)}&sz=64`,
  );
  const pending = () => Boolean(interactions.pending()[props.item.id]) || interactions.personalLoading();

  return (
    <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-elevated shadow-sm transition duration-standard ease-standard hover:-translate-y-0.5 hover:border-action-border hover:shadow-md">
      <div class="flex min-w-0 flex-1 flex-col p-4">
        <div class="flex items-center gap-3">
          <img
            src={favicon()}
            alt=""
            width="32"
            height="32"
            loading="lazy"
            referrerpolicy="no-referrer"
            class="size-8 rounded-lg border border-line bg-surface-elevated p-1"
          />
          <Show when={domain()}>
            <span class="text-xs text-content-muted">{domain()}</span>
          </Show>
        </div>
        <h2 class="heading-card mt-2 line-clamp-2 text-lg">
          <a
            href={props.item.url}
            target="_blank"
            rel="noreferrer"
            class="inline-flex items-start gap-2 hover:text-content-accent"
          >
            {props.item.title}
            <ExternalLink class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          </a>
        </h2>
        <p class="text-muted-compact mt-1 line-clamp-3">
          {props.item.description}
        </p>
        <div class="mt-2 flex flex-wrap gap-2">
          <For each={props.item.tags.slice(0, 4)}>{(tag) => <TagLink slug={tag.slug} label={tag.name} />}</For>
        </div>
        <div class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <div class="flex items-center gap-2">
            <ToggleButton
              type="button"
              disabled={pending()}
              onClick={() => void interactions.vote(props.item)}
              aria-label={personal().voted ? t('resourcecard.unselectHowUseful') : t('resourcecard.markHowUseful')}
              pressed={personal().voted}
              size="sm"
            >
              <ThumbsUp class="size-4" aria-hidden="true" />
              {interactions.votesFor(props.item)}
            </ToggleButton>
            <ToggleButton
              type="button"
              disabled={pending()}
              onClick={() => void interactions.bookmark(props.item)}
              aria-label={personal().bookmarked ? t('resourcecard.removeSaved') : t('resourcecard.saveResource')}
              pressed={personal().bookmarked}
              size="sm"
            >
              <Bookmark class="size-4" aria-hidden="true" />
            </ToggleButton>
            <ReportButton target="resource" id={props.item.id} locale={locale()} />
            <button
              type="button"
              onClick={() => void interactions.share(props.item)}
              aria-label={t('resourcecard.shareResource')} class="action action-secondary"
             
            >
              <Share2 class="size-4" aria-hidden="true" />
            </button>
          </div>
          <a
            href={props.item.url}
            target="_blank"
            rel="noreferrer"
            class="ml-auto inline-flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-content transition hover:border-action-border hover:text-content-accent"
          >
            {t('resourcecard.access')} <ExternalLink class="size-3" aria-hidden="true" />
          </a>
          <Show when={interactions.messages()[props.item.id]}>
            <span class="basis-full text-right text-xs text-content-muted" role="status" aria-live="polite">
              {interactions.messages()[props.item.id]}
            </span>
          </Show>
        </div>
      </div>
    </article>
  );
}

export default withLocale(ResourceCard);
