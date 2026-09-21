import Alert from '@/shared/ui/components/feedback/alert.component.tsx';
import SectionCard, { SectionCardBody, SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import Surface from '@/shared/ui/components/surfaces/surface.component.tsx';
import { withLocale } from '@/shared/i18n/core/solid';
import { useI18n } from '@/features/account/i18n';
import { usePasskeySettings } from '@/features/account/ui/hooks/settings/use-passkey-settings.hook.ts';
import PasskeyDeviceRow from '../widgets/settings/passkeys/passkey-device-row.component.tsx';
import RegisterPasskey from '../widgets/settings/passkeys/register-passkey.component.tsx';
import { For, Show } from 'solid-js';
function PasskeySettings() {
  const { t } = useI18n();
  const passkeys = usePasskeySettings();
  return (
    <SectionCard>
      <SectionCardHeading
        title={t('security.passkeys')}
        description={t('securitysection.useBiometricsPinOrKeySecurityWithoutMixTheseDevices')}
      />
      <SectionCardBody>
        <div class="flex flex-col gap-4" aria-busy={passkeys.busy()}>
          <Show when={passkeys.error()}>{(message) => <Alert status="danger">{message()}</Alert>}</Show>
          <Surface padding="sm" class="grid gap-4">
            <div class="grid gap-1">
              <p class="text-strong">{t('securitysection.passkeys')}</p>
              <p class="text-caption">
                {t('securitysection.useBiometricsPinOrKeySecurityRenameOrRemoveCredential')}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <For
                each={passkeys.passkeys()}
                fallback={<p class="text-muted">{t('securitysection.noPasskeyRegistered')}</p>}
              >
                {(device) => (
                  <PasskeyDeviceRow
                    device={device}
                    busy={passkeys.busy()}
                    editing={passkeys.editingCredentialId() === device.credentialId}
                    removing={passkeys.removingCredentialId() === device.credentialId}
                    onBeginRename={() => passkeys.beginRename(device)}
                    onCancelRename={passkeys.cancelRename}
                    onRename={(values) => void passkeys.rename(device, values)}
                    onBeginRemove={() => passkeys.beginRemove(device)}
                    onCancelRemove={passkeys.cancelRemove}
                    onRemove={() => void passkeys.remove(device)}
                  />
                )}
              </For>
            </div>
            <RegisterPasskey busy={passkeys.busy()} onRegister={(values) => void passkeys.register(values)} />
          </Surface>
        </div>
      </SectionCardBody>
    </SectionCard>
  );
}

export default withLocale(PasskeySettings);
