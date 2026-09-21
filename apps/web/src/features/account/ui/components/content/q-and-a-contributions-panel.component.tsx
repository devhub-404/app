import { For, Show } from 'solid-js';
import { useI18n } from '@/features/account/i18n';
import { formatLocalizedDate } from '@/shared/i18n/core';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import ListPanelHeader from '@/shared/ui/components/surfaces/list-panel-header.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import PanelHeading from '@/shared/ui/components/surfaces/panel-heading.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';
export interface QAndAContributionViewItem {
  id: string;
  title: string;
  occurredAt: string | Date;
  hiddenAt?: string | Date | null;
  href: string;
}

export default function QAndAContributionsPanel(props: {
  title: string;
  singularTitle: string;
  items: QAndAContributionViewItem[];
  loading: boolean;
  error: boolean;
}) {
  const { t, locale } = useI18n();

  return (
    <ListPanel>
      <ListPanelHeader>
        <PanelHeading
          title={props.title}
          description={t('myqandacontributions.contentCreatedYouIncludingItemsHiddenByModeration')}
        />
      </ListPanelHeader>
      <Show when={!props.loading} fallback={<LoadingState>{t('myqandacontributions.loading')}</LoadingState>}>
        <Show
          when={!props.error}
          fallback={
            <p class="text-danger px-6 py-8">
              {t('myqandacontributions.couldNotLoad')} {props.title}.
            </p>
          }
        >
          <Show
            when={props.items.length}
            fallback={
              <p class="text-muted px-6 py-10">
                {t('myqandacontributions.youHaveNotCreatedAnyYet')} {props.singularTitle}.
              </p>
            }
          >
            <ListPanelList>
              <For each={props.items}>
                {(item) => (
                  <li class="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div class="min-w-0">
                      <p class="text-strong truncate">
                        {item.title}
                      </p>
                      <p class="text-caption mt-1">
                        {formatLocalizedDate(item.occurredAt, locale())}
                      </p>
                    </div>
                    <div class="flex items-center gap-3">
                      <Show when={item.hiddenAt}>
                        <StatusBadge status="warning" class="min-h-6 px-2 py-0.5 text-[11px]">
                          {t('myqandacontributions.hidden')}
                        </StatusBadge>
                      </Show>
                      <a href={item.href} class="text-xs font-semibold text-content-accent hover:underline">
                        {t('myqandacontributions.open')}
                      </a>
                    </div>
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
