import { Show, type JSX } from 'solid-js';
import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { routes } from '@/shared/navigation/routes';
import { useI18n } from '@/features/account/i18n';
import { withLocale } from '@/shared/i18n/core/solid';
import { useUserMenuState } from '@/features/account/ui/hooks/use-user-menu-state.hook.ts';
import UserAvatar from './user-avatar.component.tsx';
import { Menu } from '@ark-ui/solid/menu';
import { ChevronDown, CircleUserRound, FolderKanban, LayoutDashboard, LogIn, LogOut, Settings, ShieldCheck, User } from 'lucide-solid';
type Props = { location: 'header' | 'sidebar' };

type ItemProps = {
  value: string;
  onSelect: () => void;
  children: JSX.Element;
  danger?: boolean;
};

function MenuItem(props: ItemProps) {
  return (
    <Menu.Item
      value={props.value}
      onSelect={props.onSelect}
      class={
        props.danger
          ? 'flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm font-semibold text-danger transition duration-standard ease-standard hover:bg-surface-subtle'
          : 'flex cursor-pointer items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-content transition duration-standard ease-standard hover:bg-surface-subtle'
      }
    >
      {props.children}
    </Menu.Item>
  );
}

function UserMenu(props: Props) {
  const { t } = useI18n();
  const state = useUserMenuState();
  const sidebar = () => props.location === 'sidebar';

  return (
    <Show
      when={state.session().status === 'authenticated'}
      fallback={
        <div class={sidebar() ? 'w-full space-y-2' : 'flex items-center gap-2'}>
          <a
            href={state.loginHref()}
            class={
              sidebar()
                ? 'flex w-full items-center justify-center gap-2 rounded-2xl bg-action px-2 py-1.5 text-sm font-semibold text-content-on-accent shadow-sm transition duration-standard ease-standard hover:bg-action-hover md:justify-start md:px-3 group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-2'
                : 'inline-flex items-center gap-2 rounded-full bg-action px-4 py-2 text-sm font-semibold text-content-on-accent shadow-sm transition duration-standard ease-standard hover:bg-action-hover'
            }
          >
            <LogIn class="size-4" />
            <span class={sidebar() ? 'group-data-[collapsed=true]:hidden' : undefined}>{t('shell.login')}</span>
          </a>
        </div>
      }
    >
      <div class="relative z-[1001]">
        <Menu.Root positioning={{ placement: sidebar() ? 'top-start' : 'top-end' }}>
          <Menu.Trigger
            type="button"
            class={
              sidebar()
                ? 'flex w-full items-center gap-2 rounded-2xl border border-line bg-surface-elevated px-2 py-2 text-sm font-semibold text-content transition duration-standard ease-standard hover:border-action-border md:gap-3 md:justify-start md:px-3 group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-2'
                : 'flex items-center gap-2 rounded-full border border-line bg-surface-subtle px-2 py-2 text-sm font-semibold text-content transition duration-standard ease-standard hover:border-action-border md:gap-3 md:px-3'
            }
            aria-label={t('shell.userMenu')}
          >
            <UserAvatar
              src={state.avatarUrl()}
              name={state.displayName() ?? state.username()}
              fallback={state.avatarFallback()}
              alt={state.displayName() ?? t('userMenu.avatarAlt')}
              class="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-action-muted text-xs font-extrabold text-content"
            />
            <span
              class={
                sidebar()
                  ? 'hidden max-w-40 truncate text-xs font-semibold md:block group-data-[collapsed=true]:hidden'
                  : 'hidden max-w-40 truncate text-xs font-semibold md:block'
              }
            >
              {state.displayName() ?? t('usermenu.myAccount')}
            </span>
            <ChevronDown
              size={16}
              class={
                sidebar() ? 'ml-auto hidden md:block group-data-[collapsed=true]:hidden' : 'ml-auto hidden md:block'
              }
            />
          </Menu.Trigger>

          <Menu.Positioner class="z-[1000]">
            <Menu.Content class="w-[min(280px,85vw)] rounded-3xl border border-line bg-surface-overlay p-2 shadow-ui-overlay backdrop-blur">
              <div class="px-3 py-2">
                <p class="text-strong">{state.displayName() ?? t('usermenu.myAccount')}</p>
                <Show when={state.username()}>
                  {(username) => (
                    <p class="text-caption mt-0.5">
                      @{username()}
                    </p>
                  )}
                </Show>
              </div>

              <Menu.Separator class="my-2 h-px bg-line" />

              <div class="flex flex-col gap-1 p-1" aria-label={t('usermenu.account')}>
                <MenuItem value="account" onSelect={() => redirectTo(routes.account.root)}>
                  <User class="size-4" />
                  {t('shell.myAccount')}
                </MenuItem>
                <MenuItem value="profile" onSelect={() => redirectTo(state.publicProfileHref())}>
                  <CircleUserRound class="size-4" />
                  {t('shell.publicProfile')}
                </MenuItem>
                <MenuItem value="activity" onSelect={() => redirectTo(routes.account.activity)}>
                  <FolderKanban class="size-4" />
                  {t('shell.activity')}
                </MenuItem>
                <MenuItem value="security" onSelect={() => redirectTo(routes.account.security)}>
                  <ShieldCheck class="size-4" />
                  {t('shell.security')}
                </MenuItem>
                <Show when={state.hasPanelAccess()}>
                  <MenuItem value="panel" onSelect={() => redirectTo(routes.panel.root)}>
                    <LayoutDashboard class="size-4" />
                    {t('shell.panel')}
                  </MenuItem>
                </Show>
                <MenuItem value="preferences" onSelect={() => redirectTo(routes.account.preferences)}>
                  <Settings class="size-4" />
                  {t('shell.preferences')}
                </MenuItem>
              </div>

              <Menu.Separator class="my-2 h-px bg-line" />
              <MenuItem value="logout" danger onSelect={state.handleLogout}>
                <LogOut class="size-4" />
                {t('shell.logout')}
              </MenuItem>
            </Menu.Content>
          </Menu.Positioner>
        </Menu.Root>
      </div>
    </Show>
  );
}

export default withLocale(UserMenu);
