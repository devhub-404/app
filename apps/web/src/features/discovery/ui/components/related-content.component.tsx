import { For, Show, createSignal, onCleanup, onMount, type JSX } from 'solid-js';
import { Carousel } from '@ark-ui/solid/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-solid';
import { routes } from '@/shared/navigation/routes';
import { loadRelated } from '@/features/discovery/actions/discovery.action.ts';
import type { DiscoveryItem, DiscoveryType } from '@/features/discovery/types/discovery.type.ts';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/discovery/i18n';
function hrefFor(item: DiscoveryItem): string {
  switch (item.type) {
    case 'article':
      return routes.article(item.slug);
    case 'news':
      return `${routes.news}/${encodeURIComponent(item.slug)}`;
    case 'resource':
      return item.slug || routes.resources;
    case 'question':
      return routes.question(item.id);
    case 'project':
      return routes.project(item.slug || item.id);
    case 'job':
      return routes.job(item.id);
    case 'event':
      return routes.event(item.slug || item.id);
  }
}

function RelatedContent(props: {
  targetId: string;
  limit?: number;
  title?: string;
  itemType?: DiscoveryType;
  renderItem?: (item: DiscoveryItem) => JSX.Element;
}) {
  const { t } = useI18n();
  const [items, setItems] = createSignal<DiscoveryItem[]>([]);
  const [slidesPerPage, setSlidesPerPage] = createSignal(1);
  onMount(async () => {
    const updateSlidesPerPage = () =>
      setSlidesPerPage(window.innerWidth >= 1280 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    updateSlidesPerPage();
    window.addEventListener('resize', updateSlidesPerPage);
    onCleanup(() => window.removeEventListener('resize', updateSlidesPerPage));
    try {
      const page = await loadRelated(props.targetId, props.limit ?? 4);
      setItems((page.items ?? []).filter((item) => !props.itemType || item.type === props.itemType));
    } catch {
      setItems([]);
    }
  });

  return (
    <Show when={items().length > 0}>
      <aside class="rounded-3xl border border-line bg-surface-subtle p-6">
        <Carousel.Root
          class="mt-4 overflow-hidden"
          slideCount={items().length}
          slidesPerPage={slidesPerPage()}
          spacing="1rem"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="heading-tiny text-xs">
              {props.title ?? t('discovery.related')}
            </h2>
            <Show when={items().length > 1}>
              <Carousel.Control class="flex items-center gap-2">
                <Carousel.PrevTrigger
                  aria-label={t('relatedcontent.contentRelatedPrevious')}
                  class="grid size-9 place-items-center rounded-xl border border-line text-content transition duration-standard ease-standard hover:border-action-border disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft class="size-4" aria-hidden="true" />
                </Carousel.PrevTrigger>
                <Carousel.NextTrigger
                  aria-label={t('relatedcontent.nextContentRelated')}
                  class="grid size-9 place-items-center rounded-xl border border-line text-content transition duration-standard ease-standard hover:border-action-border disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight class="size-4" aria-hidden="true" />
                </Carousel.NextTrigger>
              </Carousel.Control>
            </Show>
          </div>
          <Carousel.ItemGroup class="mt-4 flex">
            <For each={items()}>
              {(item, index) => (
                <Carousel.Item index={index()} class="min-w-0 basis-full shrink-0 sm:basis-1/2 xl:basis-1/3">
                  {props.renderItem ? (
                    props.renderItem(item)
                  ) : (
                    <a
                      href={hrefFor(item)}
                      class="block h-full rounded-2xl border border-line bg-surface p-4 transition duration-standard ease-standard hover:border-action-border"
                    >
                      <p class="text-field-heading">{item.type}</p>
                      <h3 class="heading-callout mt-1 line-clamp-2">
                        {item.title}
                      </h3>
                      <Show when={item.summary}>
                        <p class="text-muted mt-2 line-clamp-2">
                          {item.summary}
                        </p>
                      </Show>
                    </a>
                  )}
                </Carousel.Item>
              )}
            </For>
          </Carousel.ItemGroup>
        </Carousel.Root>
      </aside>
    </Show>
  );
}

export default withLocale(RelatedContent);
