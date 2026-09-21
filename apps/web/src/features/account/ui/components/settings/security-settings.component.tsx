import { withLocale } from '@/shared/i18n/core/solid';
import { Show } from 'solid-js';
import { useI18n } from '@/features/account/i18n';
import SectionCard, { SectionCardBody, SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import { useSettingsAccount } from '../../hooks/settings/use-settings-account.hook.ts';
import { useProtectionSettings } from '../../hooks/settings/use-protection-settings.hook.ts';
import TotpProtectionSettings from '../widgets/settings/security/totp-protection-settings.component.tsx';
import PossessionProofStep from '../widgets/settings/security/possession-proof-step.component.tsx';
import RecoveryCodesNotice from '../widgets/settings/security/recovery-codes-notice.component.tsx';
import SettingsState from './settings-state.component.tsx';
import Alert from '@/shared/ui/components/feedback/alert.component.tsx';

function SecuritySettings() {
  const { t } = useI18n();
  const account = useSettingsAccount();
  const protection = useProtectionSettings(
    account.state().details?.account.mfaEnabled ?? false,
    account.refreshAccount,
  );

  return (
    <SettingsState loading={account.loading()} failed={account.failed()}>
      <SectionCard>
        <SectionCardHeading title={t('securitysection.protection')} description={t('security.description')} />
        <SectionCardBody>
          <div class="flex flex-col gap-4" aria-busy={protection.busy()}>
            <Show when={protection.error()}>{(message) => <Alert status="danger">{message()}</Alert>}</Show>
            <TotpProtectionSettings
              enabled={protection.mfaEnabled()}
              enrollment={protection.enrollment()}
              busy={protection.busy()}
              disableOpen={protection.disableOpen()}
              onStart={() => void protection.startEnrollment()}
              onComplete={(input) => void protection.completeEnrollment(input)}
              onOpenDisable={protection.openDisable}
              onCloseDisable={protection.closeDisable}
              onDisable={(input) => void protection.disableMfa(input)}
              onRegenerate={() => void protection.regenerate()}
            />
            <Show when={protection.possessionProofRequired()}>
              <PossessionProofStep
                busy={protection.busy()}
                proofSent={protection.possessionProofSent()}
                reauthRequired={protection.reauthRequired()}
                mfaRequired={protection.reauthRequired()}
                onRequest={() => void protection.requestPossessionProof()}
                onConfirm={(input) => void protection.confirmPossessionProof(input)}
                onClose={protection.dismissPossessionProof}
              />
            </Show>
            <RecoveryCodesNotice codes={protection.recoveryCodes()} />
          </div>
        </SectionCardBody>
      </SectionCard>
    </SettingsState>
  );
}

export default withLocale(SecuritySettings);
