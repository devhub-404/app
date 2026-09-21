import { redirectTo } from '@/shared/utils/redirect.util.ts';
import { useAuth } from '@/features/auth/public';
import { routes } from '@/shared/navigation/routes';
import { useI18n } from '@/features/account/i18n';
import { withLocale } from '@/shared/i18n/core/solid';
import SectionCard, { SectionCardBody, SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import SettingsShortcutLink from '../widgets/settings/settings-shortcut-link.component.tsx';
import DangerSection from '../widgets/settings/sections/danger-section.component.tsx';
import { useSettingsAccount } from '../../hooks/settings/use-settings-account.hook.ts';
import SettingsState from './settings-state.component.tsx';
import { LogOut } from 'lucide-solid';
function AccountSettings() {
  const { t } = useI18n();
  const account = useSettingsAccount();
  const { logout } = useAuth();
  const signOut = async () => {
    if (await logout()) redirectTo(routes.auth.signIn);
  };

  return (
    <SettingsState loading={account.loading()} failed={account.failed()}>
      <div class="flex flex-col gap-4">
        <SectionCard>
          <SectionCardHeading
            title={t('usermenu.account')}
            description={t('accountsection.actionsQuickShortcutsMainSettings')}
          />
          <SectionCardBody>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-muted">{t('accountsection.tipUseMenuUserNavigateBetweenProfileSettings')}</p>
              <button type="button" onClick={() => void signOut()} class="action action-secondary">
                <LogOut class="size-4" />
                {t('accountsection.signOut')}
              </button>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <SettingsShortcutLink href={routes.account.sessions}>
                {t('accountsection.sessionsDevices')}
              </SettingsShortcutLink>
              <SettingsShortcutLink href={routes.account.emails}>{t('constants.emails')}</SettingsShortcutLink>
              <SettingsShortcutLink href={routes.account.providers}>
                {t('accountsection.connectionsOauth')}
              </SettingsShortcutLink>
              <SettingsShortcutLink href={routes.account.password}>{t('constants.password')}</SettingsShortcutLink>
              <SettingsShortcutLink href={routes.account.security}>
                {t('accountsection.securityMfa')}
              </SettingsShortcutLink>
            </div>
          </SectionCardBody>
        </SectionCard>
        <DangerSection />
      </div>
    </SettingsState>
  );
}

export default withLocale(AccountSettings);
