import { For, Show } from 'solid-js';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import { formatLocalizedDate } from '@/shared/i18n/core';
import EmptyState from '@/shared/ui/components/feedback/empty-state.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import { ArrowUpRight, CircleCheck, CircleX, Clock3 } from 'lucide-solid';
export type SuggestionListItem = {
  id: string;
  label: string;
  status: string;
  createdAt: string;
  resolvedAt?: string | null;
  href?: string;
};

function SuggestionList(props: { items: SuggestionListItem[]; empty: string }) {
  const { t, locale } = useI18n();
  const statusMeta = (status: string) => {
    const normalized = status.toLowerCase();
    if (['approved', 'published', 'accepted'].includes(normalized))
      return { label: t('suggestion.approved'), tone: 'bg-success-bg text-success', icon: CircleCheck };
    if (['rejected', 'declined', 'archived'].includes(normalized))
      return { label: t('suggestionlist.notApproved'), tone: 'bg-danger-bg text-danger', icon: CircleX };
    if (['pending', 'submitted', 'under_review', 'review'].includes(normalized))
      return { label: t('suggestionlist.review'), tone: 'bg-warning-bg text-warning', icon: Clock3 };
    return { label: status, tone: 'bg-surface-subtle text-content-muted', icon: Clock3 };
  };
  return (
    <Show
      when={props.items.length}
      fallback={
        <EmptyState>
          <p class="text-strong">{t('suggestionlist.noSuggestionsYet')}</p>
          <p class="text-muted-body mx-auto mt-2 max-w-md">
            {props.empty}
          </p>
        </EmptyState>
      }
    >
      <ListPanelList>
        <For each={props.items}>
          {(item) => {
            const status = statusMeta(item.status);
            const Icon = status.icon;
            return (
              <li class="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div class="min-w-0">
                  <p class="text-strong truncate">
                    {item.label}
                  </p>
                  <p class="text-caption mt-1">
                    {' '}
                    {t('suggestionlist.sent')} {formatLocalizedDate(item.createdAt, locale())}
                  </p>
                </div>
                <div class="flex shrink-0 items-center gap-3">
                  <span
                    class={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}
                  >
                    <Icon class="size-3" aria-hidden="true" />
                    {status.label}
                  </span>
                  <Show when={item.href}>
                    <a
                      href={item.href}
                      class="inline-flex items-center gap-1 text-xs font-semibold text-content-accent hover:text-action-hover"
                    >
                      {' '}
                      {t('myqandacontributions.open')} <ArrowUpRight class="size-3" aria-hidden="true" />
                    </a>
                  </Show>
                </div>
              </li>
            );
          }}
        </For>
      </ListPanelList>
    </Show>
  );
}

export default withLocale(SuggestionList);
