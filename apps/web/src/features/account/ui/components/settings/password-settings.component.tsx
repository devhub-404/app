import { withLocale } from '@/shared/i18n/core/solid';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { useSettingsAccount } from '../../hooks/settings/use-settings-account.hook.ts';
import { useSettingsProviders } from '../../hooks/settings/use-settings-providers.hook.ts';
import SettingsState from './settings-state.component.tsx';
import ChangePasswordSettings from '../widgets/settings/password/change-password-settings.component.tsx';
import CreatePasswordSettings from '../widgets/settings/password/create-password-settings.component.tsx';

function PasswordSettings() {
  const account = useSettingsAccount();
  const providers = useSettingsProviders();
  const [loaded, setLoaded] = createSignal(false);
  const hasLocal = createMemo(() => providers.identities().some((identity) => identity.provider === 'local'));
  const primaryEmail = createMemo(() => account.emails().find((email) => email.type === 'primary')?.email ?? '');

  createEffect(() => {
    if (account.loading() || account.failed() || loaded()) return;
    setLoaded(true);
    void providers.refreshProviders();
  });

  return (
    <SettingsState
      loading={account.loading() || !loaded() || providers.loading()}
      failed={account.failed() || providers.failed()}
    >
      <Show
        when={hasLocal()}
        fallback={
          <CreatePasswordSettings
            onAfterChange={async () => {
              await providers.refreshProviders();
            }}
          />
        }
      >
        <ChangePasswordSettings
          email={primaryEmail()}
          onAfterChange={async () => {
            await providers.refreshProviders();
          }}
        />
      </Show>
    </SettingsState>
  );
}

export default withLocale(PasswordSettings);
