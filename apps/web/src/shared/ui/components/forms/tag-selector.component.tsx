import ToggleButton from '@/shared/ui/components/actions/toggle-button.component.tsx';
import { listTags, type TagDTO } from '@/shared/taxonomy/public';
import { useI18n } from '@/shared/i18n';
import { withLocale } from '@/shared/i18n/core/solid';
import { debounce } from '@utilify/core';
import { Menu } from '@ark-ui/solid/menu';
import { Check, ChevronDown, Search, Tag, X } from 'lucide-solid';
import { createMemo, createResource, createSignal, For, onCleanup, Show } from 'solid-js';

export type TagSelectorOption = Pick<TagDTO, 'slug' | 'name'> & { id?: string };

type Props = {
  id?: string;
  value?: string[];
  defaultValue?: string[];
  onChange?: (tags: string[]) => void;
  name?: string;
  label?: string;
  max?: number;
  disabled?: boolean;
  initialOptions?: TagSelectorOption[];
  placeholder?: string;
  remote?: boolean;
  valueKey?: 'slug' | 'id';
  class?: string;
};

function TagSelector(props: Props) {
  const { t } = useI18n();
  const [localValue, setLocalValue] = createSignal([...(props.defaultValue ?? [])]);
  const [term, setTerm] = createSignal('');
  const [request, setRequest] = createSignal<string | undefined>();
  let activeController: AbortController | undefined;

  const [result] = createResource(
    () => (props.remote === false ? undefined : request()),
    (search) => {
      activeController?.abort();
      activeController = new AbortController();
      return listTags(search || undefined, undefined, { signal: activeController.signal });
    },
    {
      initialValue: props.initialOptions ?? [],
      ssrLoadFrom: 'initial',
    },
  );

  const requestTags = debounce((value: string) => setRequest(value.trim()), 300);
  const options = createMemo(() => {
    const query = term().trim().toLocaleLowerCase();
    const values = new Map<string, TagSelectorOption>();
    for (const tag of [...(props.initialOptions ?? []), ...(result() ?? [])]) {
      values.set(tag.slug, { id: tag.id, slug: tag.slug, name: tag.name });
    }
    return [...values.values()].filter(
      (tag) => !query || `${tag.name} ${tag.slug}`.toLocaleLowerCase().includes(query),
    );
  });

  const selected = () => props.value ?? localValue();
  const commit = (next: string[]) => {
    if (props.value === undefined) setLocalValue(next);
    props.onChange?.(next);
  };
  const optionValue = (tag: TagSelectorOption) => (props.valueKey === 'id' ? (tag.id ?? tag.slug) : tag.slug);
  const max = () => props.max ?? Number.POSITIVE_INFINITY;
  const toggle = (value: string) => {
    if (props.disabled) return;
    if (selected().includes(value)) {
      commit(selected().filter((tag) => tag !== value));
      return;
    }
    if (selected().length >= max()) return;
    commit([...selected(), value]);
  };

  onCleanup(() => {
    requestTags.cancel();
    activeController?.abort();
  });

  return (
    <div class={`grid gap-2 ${props.class ?? ''}`}>
      <Show when={props.label}>
        <label for={props.id} class="field-label">{props.label}</label>
      </Show>
      <Menu.Root
        onOpenChange={(details) => {
          if (details.open && props.remote !== false && request() === undefined) setRequest('');
        }}
        positioning={{ placement: 'bottom-start', gutter: 8 }}
      >
        <Menu.Trigger
          id={props.id}
          type="button"
          disabled={props.disabled}
          aria-label={props.label ?? t('listing.allTags')}
          class="flex min-h-10 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-line bg-surface px-3 text-left text-sm font-normal text-content transition duration-standard ease-standard hover:border-action-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span class="flex min-w-0 items-center gap-2 truncate">
            <Tag class="size-4 shrink-0" aria-hidden="true" />
            <Show when={selected().length > 0} fallback={t('listing.allTags')}>
              {t('listing.selectedTags', [selected().length])}
            </Show>
          </span>
          <ChevronDown class="size-4 shrink-0" aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Positioner class="!z-[1000]">
          <Menu.Content class="mt-2 grid w-[min(22rem,calc(100vw-2rem))] gap-2 rounded-xl border border-line bg-surface-elevated p-3 shadow-ui-surface">
            <label class="relative">
              <span class="sr-only">{t('listing.searchTags')}</span>
              <Search class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" aria-hidden="true" />
              <input
                value={term()}
                placeholder={props.placeholder ?? t('listing.searchTags')}
                onInput={(event) => {
                  setTerm(event.currentTarget.value);
                  if (props.remote !== false) requestTags(event.currentTarget.value);
                }}
                class="field-control min-h-9 w-full pl-9"
              />
            </label>
            <div class="max-h-64 overflow-y-auto" role="group" aria-label={t('listing.searchTags')}>
              <Show
                when={!result.loading}
                fallback={
                  <p class="text-caption p-2">
                    {t('listing.loadingTags')}
                  </p>
                }
              >
                <Show
                  when={options().length > 0}
                  fallback={
                    <p class="text-caption p-2">
                      {t('listing.emptyTags')}
                    </p>
                  }
                >
                  <div class="grid gap-1">
                    <For each={options()}>
                      {(tag) => {
                        const value = () => optionValue(tag);
                        const isSelected = () => selected().includes(value());
                        const limitReached = () => !isSelected() && selected().length >= max();
                        return (
                          <ToggleButton
                            type="button"
                            pressed={isSelected()}
                            size="sm"
                            class="w-full justify-start"
                            disabled={limitReached()}
                            onClick={() => toggle(value())}
                          >
                            {isSelected() ? (
                              <Check class="size-4" aria-hidden="true" />
                            ) : (
                              <Tag class="size-4" aria-hidden="true" />
                            )}
                            <span>#{tag.name}</span>
                            <Show when={isSelected()}>
                              <span aria-hidden="true">✓</span>
                            </Show>
                          </ToggleButton>
                        );
                      }}
                    </For>
                  </div>
                </Show>
              </Show>
            </div>
            <Show when={selected().length > 0}>
              <button type="button" onClick={() => commit([])} disabled={props.disabled} class="action action-secondary">
                <X class="size-3.5" aria-hidden="true" />
                {t('listing.clear')}
              </button>
            </Show>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={selected().join(',')} />
      </Show>
    </div>
  );
}

export default withLocale(TagSelector);
