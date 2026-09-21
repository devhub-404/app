import TagLink from '@/shared/ui/components/navigation/tag-link.component.tsx';
import { createMemo, For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { listPopularArticleTagsQuery } from '@/features/article/public';
import { loadRecent, loadTrending } from '@/features/discovery/actions/discovery.action.ts';
import type { DiscoveryItem } from '@/features/discovery/types/discovery.type.ts';
import { feedItemHref, feedItemLabelKey } from './feed-item-utils.component.ts';
import { routes } from '@/shared/navigation/routes';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/discovery/i18n';

type Props = {
  mode: 'recent' | 'trending';
  tags: string[];
};

function FeedCard(props: { item: DiscoveryItem; featured?: boolean }) {
  const { t } = useI18n();
  const href = () => feedItemHref(props.item);
  return (
    <Show
      when={props.featured}
      fallback={
        <article class="group border-b border-line py-5 first:pt-0 last:border-b-0">
          <a href={href()} class="block outline-offset-4">
            <div class="flex items-center justify-between gap-3">
              <p class="text-micro-accent">{t(feedItemLabelKey(props.item.type))}</p>
              <span class="text-xs text-content-subtle">
                {props.item.publishedAt ? t('feedcontent.publishedRecently') : t('feed.now')}
              </span>
            </div>
            <h2 class="heading-card mt-1 text-lg group-hover:text-content-accent">
              {props.item.title}
            </h2>
            <p class="text-muted-body mt-1 line-clamp-2">
              {props.item.summary}
            </p>
            <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-subtle">
              <span>{t('feedcontent.viewContent')}</span>
              <span>
                {props.item.relevanceScore > 0
                  ? t('feed.interestSignals', [Math.round(props.item.relevanceScore)])
                  : t('feedcontent.publishedRecently')}
              </span>
            </div>
          </a>
        </article>
      }
    >
      <a
        href={href()}
        class="group grid gap-4 rounded-2xl border border-action-border bg-surface-elevated p-4 outline-offset-4 md:grid-cols-[.42fr_1.58fr]"
      >
        <div
          class="grid min-h-28 place-items-center rounded-xl border border-action-border bg-action-subtle text-4xl text-content-accent"
          aria-hidden="true"
        >
          ✦
        </div>
        <div>
          <p class="text-micro-accent">{t('feedcontent.featured')}</p>
          <h2 class="heading-subsection mt-1 text-xl group-hover:text-content-accent">
            {props.item.title}
          </h2>
          <p class="text-muted-body mt-2 line-clamp-2">
            {props.item.summary}
          </p>
          <p class="text-subtle mt-3">
            {t(feedItemLabelKey(props.item.type))} {t('feedcontent.selectedByRelevance')}
          </p>
        </div>
      </a>
    </Show>
  );
}

function FeedClient(props: Props) {
  const { t } = useI18n();
  const [state, setState] = createStore({
    loading: true,
    failed: false,
    items: [] as DiscoveryItem[],
    trending: [] as DiscoveryItem[],
    popularTags: [] as Array<{ slug: string; name: string }>,
  });

  const query = createMemo(() => ({
    page: 1,
    pageSize: 20,
    tags: props.tags.length ? props.tags.join(',') : undefined,
  }));

  onMount(async () => {
    setState({ loading: true, failed: false });
    const [main, trending, popularTags] = await Promise.allSettled([
      props.mode === 'trending' ? loadTrending(query()) : loadRecent(query()),
      loadTrending({ page: 1, pageSize: 5 }),
      listPopularArticleTagsQuery(),
    ]);

    setState({
      items: main.status === 'fulfilled' ? (main.value.items ?? []) : [],
      trending: trending.status === 'fulfilled' ? (trending.value.items ?? []) : [],
      popularTags: popularTags.status === 'fulfilled' ? popularTags.value.items.slice(0, 8) : [],
      failed: main.status === 'rejected',
      loading: false,
    });
  });

  return (
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div class="min-w-0 space-y-8">
        <form
          action={routes.search}
          method="get"
          class="flex gap-3 rounded-2xl border border-line bg-surface-elevated p-4"
        >
          <label class="min-w-0 flex-1">
            <span class="sr-only">{t('feedcontent.searchDevhub')}</span>
            <input name="q" placeholder={t('feedcontent.searchDevhubAlternative2')}  class="field-control"/>
          </label>
          <Show when={props.tags.length > 0}>
            <input type="hidden" name="tags" value={props.tags.join(',')} />
          </Show>
          <button type="submit" class="action action-primary">
            {t('feedcontent.searchDevhub')}
          </button>
        </form>

        <nav class="flex flex-wrap gap-2" aria-label={t('feedcontent.filtersFeed')}>
          <a
            href={props.tags.length ? `${routes.feed}?tags=${encodeURIComponent(props.tags.join(','))}` : routes.feed}
            class={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              props.mode === 'recent'
                ? 'border-action-border bg-action-subtle text-content-accent'
                : 'border-line text-content-muted'
            }`}
          >
            {t('feed.recent')}
          </a>
          <a
            href={`${routes.feed}?${new URLSearchParams({ mode: 'trending', ...(props.tags.length ? { tags: props.tags.join(',') } : {}) }).toString()}`}
            class={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              props.mode === 'trending'
                ? 'border-action-border bg-action-subtle text-content-accent'
                : 'border-line text-content-muted'
            }`}
          >
            {t('feed.trending')}
          </a>
        </nav>

        <Show when={!state.loading} fallback={<p class="text-muted">…</p>}>
          <Show
            when={!state.failed}
            fallback={
              <p class="text-danger rounded-xl border border-danger/30 bg-danger/5 p-4">
                {t('feedcontent.feedWillShowHereUpdatesMoreRelevantYouThusIfAnyContent')}
              </p>
            }
          >
            <Show
              when={state.items.length > 0}
              fallback={
                <p class="text-muted rounded-xl border border-line bg-surface-elevated p-6">
                  {t('feedcontent.feedWillShowHereUpdatesMoreRelevantYouThusIfAnyContent')}
                </p>
              }
            >
              <section>
                <h2 class="heading-section mb-4">
                  {t('feedcontent.featured')}
                </h2>
                <FeedCard item={state.items[0]!} featured />
              </section>
              <section>
                <div class="mb-4">
                  <h2 class="heading-section">
                    {t('feedcontent.updatesYou')}
                  </h2>
                  <p class="text-muted">
                    {Math.max(state.items.length - 1, 0)} {t('feedcontent.items')}
                  </p>
                </div>
                <div class="rounded-2xl border border-line bg-surface-elevated px-5">
                  <For each={state.items.slice(1)}>{(item) => <FeedCard item={item} />}</For>
                </div>
              </section>
              <section class="rounded-2xl border border-line bg-surface-elevated p-4">
                <p class="text-micro-accent">{t('feedcontent.actionTemporal')}</p>
                <h2 class="heading-callout mt-1 text-base">
                  {t('feedcontent.nextOpportunities')}
                </h2>
                <p class="text-muted-body mt-2">
                  {t('feedcontent.eventsJobsCanRequireActionSoon')}
                </p>
                <div class="mt-3 flex gap-3 text-xs font-semibold">
                  <a href={routes.events} class="text-content-accent">
                    {t('feedcontent.events')}
                  </a>
                  <a href={routes.jobs} class="text-content-accent">
                    {t('feedcontent.jobs')}
                  </a>
                </div>
              </section>
            </Show>
          </Show>
        </Show>
      </div>

      <aside class="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section class="rounded-2xl border border-line bg-surface-elevated p-4">
          <p class="text-micro-accent">{t('feedcontent.contribute')}</p>
          <h2 class="heading-callout mt-1">
            {t('feedcontent.shareYouKnow')}
          </h2>
          <p class="text-muted-body mt-2">
            {t('feedcontent.publishExplanationAnswerResourceOrProjectReturnValueCommunity')}
          </p>
          <a
            href={routes.contribute}
            class="mt-3 inline-flex rounded-lg bg-action px-3 py-2 text-xs font-semibold text-content-on-accent"
          >
            {t('feedcontent.writeContent')}
          </a>
        </section>

        <section class="rounded-2xl border border-line bg-surface-elevated p-4">
          <p class="text-micro-accent">{t('feedcontent.highNow')}</p>
          <h2 class="heading-callout mt-1">
            {t('feedcontent.trending')}
          </h2>
          <ol class="mt-3 space-y-2">
            <For each={state.trending}>
              {(item, index) => (
                <li>
                  <a href={feedItemHref(item)} class="flex gap-2 text-xs text-content-muted hover:text-content-accent">
                    <span class="font-semibold text-content-accent">{index() + 1}</span>
                    <span class="line-clamp-2">{item.title}</span>
                  </a>
                </li>
              )}
            </For>
          </ol>
          <a
            href={`${routes.search}?mode=trending`}
            class="mt-3 block text-right text-xs font-semibold text-content-accent"
          >
            {t('feedcontent.viewMoreTrending')}
          </a>
        </section>

        <section class="rounded-2xl border border-line bg-surface-elevated p-4">
          <p class="text-micro-accent">{t('feedcontent.discover')}</p>
          <h2 class="heading-callout mt-1">
            {t('feedcontent.tagsPopular')}
          </h2>
          <div class="mt-3 flex flex-wrap gap-2">
            <For each={state.popularTags}>{(tag) => <TagLink slug={tag.slug} label={tag.name} />}</For>
          </div>
        </section>
      </aside>
    </div>
  );
}

export default withLocale(FeedClient);
