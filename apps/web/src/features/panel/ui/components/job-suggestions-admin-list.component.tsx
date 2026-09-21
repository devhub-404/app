import { Check, ExternalLink, X } from 'lucide-solid';
import { createSignal, For, onMount, Show } from 'solid-js';
import {
  acceptJobSuggestion,
  listPendingJobSuggestions,
  rejectJobSuggestion,
  type JobSuggestionSummary,
} from '@/features/job/public';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';

function JobSuggestionsAdminList() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<JobSuggestionSummary[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [busy, setBusy] = createSignal<string | null>(null);
  const load = async () => {
    setLoading(true);
    const result = await listPendingJobSuggestions();
    setItems(result.items);
    setLoading(false);
  };
  onMount(() => void load());
  const decide = async (id: string, accept: boolean) => {
    if (busy()) return;
    setBusy(id);
    const ok = accept ? await acceptJobSuggestion(id) : await rejectJobSuggestion(id);
    setBusy(null);
    if (ok.kind === 'success') await load();
  };
  return (
    <ListPanel>
      <header class="grid gap-1 border-b border-line px-5 py-5 sm:px-6">
        <h2 class="heading-callout text-sm">
          {t('jobsuggestions.title')}
        </h2>
        <p class="text-muted">{t('jobsuggestions.description')}</p>
      </header>
      <Show when={!loading()} fallback={<LoadingState>{t('jobsuggestions.loading')}</LoadingState>}>
        <ListPanelList>
          <For
            each={items()}
            fallback={<li class="px-6 py-10 text-sm text-content-muted">{t('jobsuggestions.empty')}</li>}
          >
            {(item) => (
              <li class="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div class="min-w-0">
                  <p class="text-strong truncate">
                    {item.label}
                  </p>
                  <Show when={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      class="mt-1 inline-flex items-center gap-1.5 text-xs text-content-accent hover:underline"
                    >
                      <ExternalLink class="size-3.5" />
                      {item.url}
                    </a>
                  </Show>
                  <p class="text-subtle mt-1">
                    {item.createdAt}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    type="button"
                   
                    disabled={busy() === item.id}
                    onClick={() => void decide(item.id, false)} class="action action-secondary"
                  >
                    <X class="size-3.5" />
                    {t('jobsuggestions.reject')}
                  </button>
                  <button type="button" disabled={busy() === item.id} onClick={() => void decide(item.id, true)} class="action action-secondary">
                    <Check class="size-3.5" />
                    {t('jobsuggestions.accept')}
                  </button>
                </div>
              </li>
            )}
          </For>
        </ListPanelList>
      </Show>
    </ListPanel>
  );
}
export default withLocale(JobSuggestionsAdminList);
