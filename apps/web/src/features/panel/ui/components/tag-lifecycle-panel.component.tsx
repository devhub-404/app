import { createSignal, For, onMount, Show } from 'solid-js';
import { archiveTag, listTags, unarchiveTag, type TagDTO } from '@/shared/taxonomy/public';

import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import ListPanelRows from '@/shared/ui/components/surfaces/list-panel-rows.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
function TagLifecyclePanel() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<TagDTO[]>([]);
  const [busy, setBusy] = createSignal<string | null>(null);
  const [message, setMessage] = createSignal('');
  const load = async () => setItems(await listTags());
  onMount(() => void load());
  const change = async (tag: TagDTO) => {
    setBusy(tag.id);
    setMessage('');
    const ok = tag.status === 'active' ? await archiveTag(tag.id) : await unarchiveTag(tag.id);
    if (ok) {
      setMessage(t('taglifecyclepanel.statusTagUpdated'));
      await load();
    } else setMessage(t('taglifecyclepanel.couldNotUpdateStatusTag'));
    setBusy(null);
  };
  return (
    <ListPanel>
      <ListPanelHeader>
        <div class="grid gap-1">
          <h2 class="heading-callout text-sm">
            {t('taglifecyclepanel.lifecycleTags')}
          </h2>
          <p class="text-muted">{t('taglifecyclepanel.onlyTagsActiveCanBeUsedNewClassifications')}</p>
          <Show when={message()}>
            <p role="status" class="text-caption">
              {message()}
            </p>
          </Show>
        </div>
      </ListPanelHeader>
      <ListPanelRows>
        <For
          each={items()}
          fallback={
            <p class="text-muted px-5 py-5">
              {t('taglifecyclepanel.noTagFound')}
            </p>
          }
        >
          {(tag) => (
            <div class="flex items-center justify-between gap-3 px-5 py-3 sm:px-6">
              <div>
                <p class="text-strong">{tag.name}</p>
                <p class="text-caption">
                  /{tag.slug} · {tag.status === 'active' ? t('tagLifecycle.active') : t('tagLifecycle.archived')}
                </p>
              </div>
              <button type="button" disabled={busy() === tag.id} onClick={() => void change(tag)} class="action action-secondary">
                {busy() === tag.id
                  ? t('tagLifecycle.applying')
                  : tag.status === 'active'
                    ? t('resourceadmindetail.archive')
                    : t('resourceadmindetail.unarchive')}
              </button>
            </div>
          )}
        </For>
      </ListPanelRows>
    </ListPanel>
  );
}

export default withLocale(TagLifecyclePanel);
