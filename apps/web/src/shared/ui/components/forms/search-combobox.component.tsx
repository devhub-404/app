import { Combobox, createListCollection } from '@ark-ui/solid';
import { ChevronDown, Search } from 'lucide-solid';
import { createMemo, For, Show } from 'solid-js';
import { useI18n } from '@/shared/i18n';

export type SearchOption = {
  value: string;
  label: string;
  description?: string;
};

interface Props {
  id: string;
  label: string;
  options: SearchOption[];
  value?: string;
  inputValue?: string;
  placeholder?: string;
  emptyLabel?: string;
  onInputValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
}

/** Search/select facade. Filtering, keyboard navigation and selection belong to Ark Combobox. */
export default function SearchCombobox(props: Props) {
  const { t } = useI18n();
  const collection = createMemo(() => createListCollection({ items: props.options }));

  return (
    <Combobox.Root
      id={props.id}
      collection={collection()}
      value={props.value ? [props.value] : []}
      inputValue={props.inputValue}
      onInputValueChange={(details) => props.onInputValueChange?.(details.inputValue)}
      onValueChange={(details) => {
        const next = details.value[0];
        if (next) props.onChange?.(next);
      }}
      positioning={{ sameWidth: true }}
      class="relative grid w-full gap-2"
    >
      <Combobox.Label class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted">
        {props.label}
      </Combobox.Label>
      <Combobox.Control class="relative flex items-center">
        <Search class="pointer-events-none absolute left-3 size-4 text-content-muted" aria-hidden="true" />
        <Combobox.Input
          placeholder={props.placeholder ?? t('searchcombobox.search')}
          class="h-10 w-full rounded-xl border border-line bg-surface px-10 text-sm text-content outline-none transition duration-standard ease-standard placeholder:text-content-muted focus:border-action-border focus:ring-2 focus:ring-action/20"
        />
        <Combobox.Trigger
          type="button"
          aria-label={t('searchcombobox.openResults')}
          class="absolute right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-content-muted hover:bg-surface-subtle hover:text-content"
        >
          <ChevronDown class="size-4" aria-hidden="true" />
        </Combobox.Trigger>
      </Combobox.Control>
      <Combobox.Positioner class="z-[1000]">
        <Combobox.Content class="mt-2 w-full rounded-2xl border border-line bg-surface-overlay p-2 shadow-ui-overlay">
          <Combobox.Empty class="px-3 py-4 text-sm text-content-muted">
            {props.emptyLabel ?? t('searchcombobox.empty')}
          </Combobox.Empty>
          <Combobox.List class="grid max-h-64 gap-1 overflow-auto">
            <For each={collection().items}>
              {(item) => (
                <Combobox.Item
                  item={item}
                  class="grid cursor-pointer gap-0.5 rounded-xl px-3 py-2 text-sm text-content outline-none hover:bg-surface-subtle data-[highlighted]:bg-surface-subtle data-[state=checked]:bg-action data-[state=checked]:text-content-on-accent"
                >
                  <Combobox.ItemText>{item.label}</Combobox.ItemText>
                  <Show when={item.description}>
                    <span class="text-xs text-content-muted">{item.description}</span>
                  </Show>
                </Combobox.Item>
              )}
            </For>
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Root>
  );
}
