import { Popover } from '@ark-ui/solid/popover';
import { children, createSignal } from 'solid-js';
import type { ParentProps } from 'solid-js';
import { SlidersHorizontal } from 'lucide-solid';
import { useI18n } from '@/shared/i18n';

function ListingFiltersMenu(props: ParentProps) {
  const { t } = useI18n();
  const [open, setOpen] = createSignal(false);
  const resolvedChildren = children(() => props.children);

  return (
    <div class="relative min-w-0">
      <Popover.Root
        open={open()}
        onOpenChange={(details) => setOpen(details.open)}
        positioning={{ placement: 'bottom-end', gutter: 8 }}
      >
        <Popover.Trigger
          type="button"
          class="grid size-10 place-items-center rounded-lg border border-line bg-surface text-content hover:bg-hover lg:hidden"
        >
          <SlidersHorizontal class="size-4" aria-hidden="true" />
          <span class="sr-only">{t('listing.filters')}</span>
        </Popover.Trigger>
        <Popover.Positioner class="!z-[1000] w-[min(24rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] !min-w-0 lg:!static lg:contents lg:!pointer-events-auto lg:!transform-none lg:w-auto lg:max-w-none">
          <Popover.Content
            id="listing-filters"
            hidden={false}
            class="relative box-border max-h-[min(70vh,32rem)] w-full max-w-full gap-3 overflow-y-auto rounded-xl border border-line bg-surface-elevated p-3 shadow-ui-surface lg:static lg:mt-0 lg:!flex lg:w-auto lg:max-w-none lg:items-center lg:gap-3 lg:overflow-visible lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none"
            classList={{ grid: open(), hidden: !open() }}
          >
            {resolvedChildren()}
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </div>
  );
}

export default ListingFiltersMenu;
