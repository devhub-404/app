import { createSignal, For, onMount } from 'solid-js';
import { listResources } from '@/features/resource/actions/resource.action.ts';
import type { ResourceItem } from '@/features/resource/types/resource.type.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/resource/i18n';

function ResourceRanking() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<ResourceItem[]>([]);
  onMount(() => {
    void listResources({ page: 1, pageSize: 4, sort: 'votes' }).then((result) => setItems(result.items.slice(0, 4)));
  });
  return (
    <section class="rounded-2xl border border-line bg-surface-elevated p-5" aria-labelledby="resources-ranking-heading">
      <h2 id="resources-ranking-heading" class="heading-tiny text-xs">
        {t('resources.moreVoted')}
      </h2>
      <ol class="mt-4 space-y-4">
        <For each={items()}>
          {(item, index) => (
            <li class="flex gap-3">
              <span class="font-semibold text-content-muted">{index() + 1}</span>
              <div class="min-w-0">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  class="line-clamp-1 text-sm font-semibold text-content hover:text-content-accent"
                >
                  {item.title}
                </a>
                <p class="text-caption mt-1">
                  ↑ {item.votes}
                </p>
              </div>
            </li>
          )}
        </For>
      </ol>
    </section>
  );
}
export default withLocale(ResourceRanking);
