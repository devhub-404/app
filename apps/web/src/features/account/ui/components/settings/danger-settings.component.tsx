import { withLocale } from '@/shared/i18n/core/solid';
import DangerSection from '../widgets/settings/sections/danger-section.component.tsx';
import { useSettingsAccount } from '../../hooks/settings/use-settings-account.hook.ts';
import SettingsState from './settings-state.component.tsx';

function DangerSettings() {
  const account = useSettingsAccount();
  return (
    <SettingsState loading={account.loading()} failed={account.failed()}>
      <DangerSection />
    </SettingsState>
  );
}

export default withLocale(DangerSettings);
