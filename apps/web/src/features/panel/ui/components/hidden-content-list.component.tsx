import { Eye, RotateCcw } from 'lucide-solid';
import { createSignal, For, onMount, Show } from 'solid-js';
import { listHiddenContent, restoreHiddenItem, type HiddenContentItem } from '@/features/moderation/public';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';

function HiddenContentList() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<HiddenContentItem[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [busy, setBusy] = createSignal<string | null>(null);
  const load = async () => {
    setLoading(true);
    const result = await listHiddenContent();
    setItems(result.items);
    setLoading(false);
  };
  onMount(() => void load());
  const restore = async (item: HiddenContentItem) => {
    setBusy(item.id);
    const ok = await restoreHiddenItem(item);
    setBusy(null);
    if (ok) await load();
  };
  return (
    <ListPanel>
      <header class="grid gap-1 border-b border-line px-5 py-5 sm:px-6">
        <h2 class="heading-callout flex items-center gap-2 text-sm">
          <Eye class="size-4 text-content-accent" />
          {t('hiddencontent.title')}
        </h2>
        <p class="text-muted">{t('hiddencontent.description')}</p>
      </header>
      <Show when={!loading()} fallback={<LoadingState>{t('hiddencontent.loading')}</LoadingState>}>
        <ListPanelList>
          <For
            each={items()}
            fallback={<li class="px-6 py-10 text-sm text-content-muted">{t('hiddencontent.empty')}</li>}
          >
            {(item) => (
              <li class="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div class="min-w-0">
                  <p class="text-strong truncate">
                    {item.title}
                  </p>
                  <p class="text-subtle mt-1">
                    {item.kind}
                    {item.hiddenAt ? ` · ${item.hiddenAt}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                 
                  disabled={busy() === item.id}
                  onClick={() => void restore(item)} class="action action-secondary"
                >
                  <RotateCcw class="size-3.5" />
                  {t('hiddencontent.restore')}
                </button>
              </li>
            )}
          </For>
        </ListPanelList>
      </Show>
    </ListPanel>
  );
}
export default withLocale(HiddenContentList);
