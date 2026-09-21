import { createListCollection, Select as ArkSelect } from '@ark-ui/solid';
import { ChevronDown } from 'lucide-solid';
import { createMemo, createSignal, For, Show, type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { useI18n } from '@/shared/i18n';

export type SelectOption<TValue extends string> = {
  value: TValue;
  label: string;
};

type Props<TValue extends string> = {
  id: string;
  value: TValue;
  options: SelectOption<TValue>[];
  onChange: (value: TValue) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  ariaLabel?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-labelledby'?: string;
  icon?: Component<{ class?: string }>;
  class?: string;
  triggerClass?: string;
};

export default function Select<TValue extends string>(props: Props<TValue>) {
  const { t } = useI18n();
  const collection = createMemo(() => createListCollection({ items: props.options }));
  const value = createMemo(() => (props.value ? [props.value] : []));
  const [open, setOpen] = createSignal(false);

  return (
    <ArkSelect.Root
      id={props.id}
      collection={collection()}
      value={value()}
      onValueChange={(details) => {
        const next = details.value[0];
        if (next) props.onChange(next as TValue);
      }}
      onOpenChange={(details) => setOpen(details.open)}
      positioning={{ sameWidth: true }}
      disabled={props.disabled}
      class={`relative grid w-full gap-2 ${props.class ?? ''}`}
      classList={{ 'z-[100]': open() }}
    >
      <Show when={props.label}>
        <ArkSelect.Label class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted">
          {props.label}
        </ArkSelect.Label>
      </Show>
      <ArkSelect.Control class="w-full">
        <ArkSelect.Trigger
          class={
            props.triggerClass ??
            'relative flex h-10 w-full items-center justify-center rounded-xl border border-line bg-surface px-10 text-center text-sm text-content outline-none transition duration-standard ease-standard hover:border-action-border focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface'
          }
          classList={{ 'cursor-not-allowed opacity-60 hover:border-line': Boolean(props.disabled) }}
          aria-label={props.ariaLabel ?? props.label ?? props.placeholder ?? t('dropdownselect.selectOption')}
          aria-describedby={props['aria-describedby']}
          aria-invalid={props['aria-invalid']}
          aria-labelledby={props['aria-labelledby']}
        >
          <Show when={props.icon}>
            <span
              class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
              aria-hidden="true"
            >
              <Dynamic component={props.icon!} class="size-4" />
            </span>
          </Show>
          <ArkSelect.ValueText
            class={props.icon ? 'truncate' : 'truncate text-center data-[placeholder]:text-xs'}
            placeholder={props.placeholder ?? t('dropdownselect.select')}
          />
          <ChevronDown class="absolute right-4" size={16} />
        </ArkSelect.Trigger>
      </ArkSelect.Control>
      <ArkSelect.Positioner class="!z-[1000]">
        <ArkSelect.Content class="mt-2 w-full max-h-72 overflow-hidden rounded-3xl border border-line bg-surface-overlay p-2 shadow-ui-overlay backdrop-blur">
          <ArkSelect.List class="flex max-h-64 flex-col gap-1 overflow-auto p-1">
            <For each={collection().items}>
              {(item) => (
                <ArkSelect.Item
                  item={item}
                  class="flex cursor-pointer items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-semibold text-content transition duration-standard ease-standard hover:bg-surface-subtle data-[highlighted]:bg-surface-subtle data-[state=checked]:bg-action data-[state=checked]:text-content-on-accent"
                >
                  <ArkSelect.ItemText>{item.label}</ArkSelect.ItemText>
                  <ArkSelect.ItemIndicator class="text-xs font-semibold">✓</ArkSelect.ItemIndicator>
                </ArkSelect.Item>
              )}
            </For>
          </ArkSelect.List>
        </ArkSelect.Content>
      </ArkSelect.Positioner>
      <ArkSelect.HiddenSelect />
    </ArkSelect.Root>
  );
}
