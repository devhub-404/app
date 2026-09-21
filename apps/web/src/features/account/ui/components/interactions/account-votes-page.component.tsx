import { createSignal, For, onMount, Show } from 'solid-js';
import type { SyncedVote } from '@/shared/interactions/vote/types/vote.type.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import { getPersonalVotes } from '@/shared/runtime/personal-state';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
function AccountVotesPage() {
  const { t } = useI18n();
  const [items, setItems] = createSignal<SyncedVote[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(false);

  onMount(async () => {
    const result = await getPersonalVotes();
    if (result) setItems(result.filter((item) => item.active));
    else setError(true);
    setLoading(false);
  });

  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading title={t('accountvotes.votes')} description={t('accountvotes.statusVotesSynchronized')} />
      </ListPanelHeader>
      <Show when={!loading()} fallback={<LoadingState>{t('myqandacontributions.loading')}</LoadingState>}>
        <Show
          when={!error()}
          fallback={
            <p class="text-danger px-6 py-8">
              {t('accountvotes.couldNotLoadVotes')}
            </p>
          }
        >
          <Show
            when={items().length}
            fallback={
              <p class="text-muted px-6 py-10">
                {t('accountvotes.noVoteActive')}
              </p>
            }
          >
            <ListPanelList>
              <For each={items()}>
                {(item) => (
                  <li class="flex items-center justify-between px-5 py-5 sm:px-6">
                    <span class="text-sm font-semibold text-content">{t('bookmarks.typeResource')}</span>
                    <span class="text-xs text-content-muted">{item.resourceId}</span>
                  </li>
                )}
              </For>
            </ListPanelList>
          </Show>
        </Show>
      </Show>
    </ListPanel>
  );
}

export default withLocale(AccountVotesPage);
