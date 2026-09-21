import { ChevronLeft, ChevronRight, Eye, RefreshCw } from 'lucide-solid';
import { createMemo, For, onMount, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { UserListItemDTO } from '@/features/panel/types/panel.type.ts';
import { useAdminUsers } from '@/features/panel/ui/hooks/use-admin-users.hook.ts';
import { routes } from '@/shared/navigation/routes';
import { formatPublicDate } from '@/shared/utils/format-public-date.util.ts';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/panel/i18n';
import ListPanel from '@/shared/ui/components/surfaces/list-panel.component.tsx';
import LoadingState from '@/shared/ui/components/feedback/loading-state.component.tsx';
import ListPanelList from '@/shared/ui/components/surfaces/list-panel-list.component.tsx';
import ManagementListItem from '@/shared/ui/components/surfaces/management-list-item.component.tsx';
import StatusBadge from '@/shared/ui/components/feedback/status-badge.component.tsx';

const PAGE_SIZE = 20;

function identityText(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value;
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  for (const key of ['username', 'email', 'address', 'value', 'name']) {
    const candidate = record[key];
    if (typeof candidate === 'string' && candidate.trim()) return candidate;
  }
  return null;
}

function UsersList() {
  const { t, locale } = useI18n();
  const { listUsers } = useAdminUsers();
  const [state, setState] = createStore({
    loading: true,
    items: [] as UserListItemDTO[],
    page: 1,
    total: 0,
  });
  const pageCount = createMemo(() => Math.max(1, Math.ceil(state.total / PAGE_SIZE)));

  const load = async (nextPage = state.page) => {
    setState('loading', true);
    try {
      const result = await listUsers({ page: nextPage, pageSize: PAGE_SIZE });
      setState({ items: result.items, page: result.page, total: result.total });
    } finally {
      setState('loading', false);
    }
  };

  onMount(() => void load(1));

  return (
    <ListPanel>
      <header class="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div class="grid gap-1">
          <p class="text-strong">{t('userslist.users')}</p>
          <p class="text-muted">{t('userslist.openRecordAccountReviewStatusPermissions')}</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={state.loading} class="action action-secondary">
          <RefreshCw class="size-4" aria-hidden="true" />
          {state.loading ? t('common.refreshing') : t('common.refresh')}
        </button>
      </header>

      <Show when={!state.loading} fallback={<LoadingState>{t('rolesadminpanel.loadingUsers')}</LoadingState>}>
        <ListPanelList>
          <For
            each={state.items}
            fallback={
              <li class="px-6 py-12 text-center">
                <p class="text-strong">{t('rolesadminpanel.noUserFound')}</p>
              </li>
            }
          >
            {(user) => {
              const username = identityText(user.username);
              const email = identityText(user.email);
              const primary = username ? `@${username}` : (email ?? user.id);
              return (
                <li>
                  <ManagementListItem
                    status={
                      <>
                        <StatusBadge>{user.voluntaryStatus}</StatusBadge>
                        <StatusBadge>{user.moderationStatus}</StatusBadge>
                        <Show when={user.role}>
                          <StatusBadge>{user.role}</StatusBadge>
                        </Show>
                        <Show when={user.deletionStatus === 'pending'}>
                          <StatusBadge status="warning">{t('userslist.deletionRequested')}</StatusBadge>
                        </Show>
                      </>
                    }
                    title={primary}
                    description={
                      <div class="grid gap-1">
                        <Show when={username && email}>
                          <p class="text-caption truncate">
                            {email}
                          </p>
                        </Show>
                        <p class="text-caption">
                          {t('userslist.created')} {formatPublicDate(user.createdAt, locale())} · {t('userslist.mfa')}{' '}
                          {user.mfaEnabled ? t('userslist.configured') : t('userslist.notConfigured')}
                        </p>
                      </div>
                    }
                    actions={
                      <a href={routes.panel.user(user.id)} class="action action-secondary">
                        <Eye class="size-3.5" aria-hidden="true" /> {t('userslist.viewRecord')}
                      </a>
                    }
                  />
                </li>
              );
            }}
          </For>
        </ListPanelList>
      </Show>

      <footer class="flex flex-col gap-3 border-t border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p class="text-caption">{t('userslist.pageValueOfValue', [state.page, pageCount(), state.total])}</p>
        <div class="flex gap-2">
          <button
            type="button"
           
            disabled={state.loading || state.page <= 1}
            onClick={() => void load(state.page - 1)} class="action action-secondary"
          >
            <ChevronLeft class="size-3.5" aria-hidden="true" />
            {t('userslist.previous')}
          </button>
          <button
            type="button"
           
            disabled={state.loading || state.page >= pageCount()}
            onClick={() => void load(state.page + 1)} class="action action-secondary"
          >
            <ChevronRight class="size-3.5" aria-hidden="true" />
            {t('userslist.next')}
          </button>
        </div>
      </footer>
    </ListPanel>
  );
}

export default withLocale(UsersList);
