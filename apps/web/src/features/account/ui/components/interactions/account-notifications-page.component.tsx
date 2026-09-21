import { For, Show } from 'solid-js';
import { useI18n } from '@/features/account/i18n';
import { formatLocalizedDate } from '@/shared/i18n/core';
import { withLocale } from '@/shared/i18n/core/solid';
import { $notifications } from '@/features/account/store/notification.store';
import type { NotificationItem } from '@/features/account/types/notification.type.ts';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import { useStore } from '@nanostores/solid';
function AccountNotificationsPage() {
  const { t, locale } = useI18n();
  const state = useStore($notifications);
  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading
          title={t('accountnotifications.notifications')}
          description={t('accountnotifications.updatesRelevantAboutAccountContributions')}
        />
      </ListPanelHeader>
      <Show when={!state().loading} fallback={<LoadingState>{t('myqandacontributions.loading')}</LoadingState>}>
        <Show
          when={state().items.length}
          fallback={
            <p class="text-muted px-6 py-10">
              {t('accountnotifications.noNotification')}
            </p>
          }
        >
          <ListPanelList>
            <For each={state().items}>
              {(item: NotificationItem) => (
                <li class={`px-5 py-5 sm:px-6 ${item.readAt ? '' : 'bg-action-subtle'}`}>
                  <p class="text-strong">{item.type}</p>
                  <p class="text-caption mt-1">
                    {formatLocalizedDate(item.createdAt, locale())}
                  </p>
                </li>
              )}
            </For>
          </ListPanelList>
        </Show>
      </Show>
    </ListPanel>
  );
}

export default withLocale(AccountNotificationsPage);
