import { createResource, For, Show } from 'solid-js';
import { loadTrending, type DiscoveryItem } from '@/features/discovery/public';
import { routes } from '@/shared/navigation/routes';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/shared/i18n/app';
type Item = DiscoveryItem;
const href = (item: Item) =>
  item.type === 'article'
    ? routes.article(item.slug)
    : item.type === 'news'
      ? `/news/${encodeURIComponent(item.slug)}`
      : item.type === 'question'
        ? routes.question(item.id)
        : item.type === 'project'
          ? routes.project(item.slug)
          : item.type === 'job'
            ? routes.job(item.id)
            : item.type === 'resource'
              ? item.slug
              : routes.search;
async function load() {
  try {
    const result = await loadTrending({ page: 1, pageSize: 6 });
    return result.items ?? [];
  } catch {
    // Discovery is a supplementary recommendation on a 404 surface. A
    // transient API failure must preserve the not-found page and its recovery
    // actions instead of becoming an uncaught hydration/runtime error.
    return [];
  }
}
function NotFoundKnowledge() {
  const { t } = useI18n();
  const [items] = createResource(load);
  return (
    <section class="rounded-3xl border border-line bg-surface-elevated p-6 shadow-xl">
      <div class="flex items-end justify-between gap-4">
        <div>
          <p class="text-eyebrow">{t('notfoundknowledge.whileYouAreHere')}</p>
          <h2 class="heading-section mt-2">
            {t('notfoundknowledge.knowledgeCanBeWorthDetour')}
          </h2>
        </div>
        <a
          href={routes.search}
          class="rounded-full border border-line px-4 py-2 text-xs font-semibold text-content hover:border-action-border"
        >
          {t('notfoundknowledge.exploreAll')}
        </a>
      </div>
      <Show
        when={!items.loading}
        fallback={
          <p class="text-muted mt-5">
            {t('notfoundknowledge.searchingSomethingUseful')}
          </p>
        }
      >
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <For
            each={items() ?? []}
            fallback={<p class="text-muted">{t('notfoundknowledge.couldNotLoadHighlightsNow')}</p>}
          >
            {(item) => (
              <a href={href(item)} class="rounded-2xl border border-line bg-surface p-4 hover:border-action-border">
                <p class="text-eyebrow">{item.type}</p>
                <h3 class="heading-callout mt-2">
                  {item.title}
                </h3>
                <p class="text-caption mt-2 line-clamp-2">
                  {item.summary}
                </p>
              </a>
            )}
          </For>
        </div>
      </Show>
    </section>
  );
}

export default withLocale(NotFoundKnowledge);
