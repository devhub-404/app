import { Show } from 'solid-js';
import { withLocale } from '@/shared/i18n/core/solid';
import SectionCard, { SectionCardBody, SectionCardHeading } from '@/shared/ui/components/surfaces/section-card.component.tsx';
import { useI18n } from '@/features/account/i18n';
import { useSettingsAccount } from '@/features/account/ui/hooks/settings/use-settings-account.hook.ts';
import { useEmailSettings } from '@/features/account/ui/hooks/settings/use-email-settings.hook.ts';
import EmailVerificationSettings from '../widgets/settings/emails/email-verification-settings.component.tsx';
import RegisteredEmails from '../widgets/settings/emails/registered-emails.component.tsx';
import SettingsState from './settings-state.component.tsx';
function EmailSettings() {
  const { t } = useI18n();
  const account = useSettingsAccount();
  const settings = useEmailSettings(account.emails, account.refreshAccount);

  return (
    <SettingsState loading={account.loading()} failed={account.failed()}>
      <SectionCard>
        <SectionCardHeading
          title={t('constants.emails')}
          description={t('emailssection.manageEmailPrimaryEmailBackupFlowsVerifiedIndependent')}
        />
        <SectionCardBody>
          <div class="flex flex-col gap-6">
            <EmailVerificationSettings
              title={t('accountoverview.emailPrimary')}
              description={`${t('emailssection.current')} ${settings.primaryEmail() ?? '—'}${t('emailssection.changeOnlyCompletedAfterProofSubmittedNewAddress')}`}
              emailLabel={t('emailssection.newEmail')}
              emailPlaceholder={t('emailssection.newExample')}
              tokenLabel={t('emailssection.tokenReceived')}
              tokenPlaceholder={t('emailssection.pasteToken')}
              requestLabel={t('emailssection.sendProof')}
              completeLabel={t('emailssection.completeChange')}
              inputId="primary-email-change"
              tokenId="primary-email-token"
              busy={settings.busy()}
              onRequest={(email) => void settings.requestPrimaryChange(email)}
              onComplete={(token) => void settings.completePrimaryChange(token)}
            />
            <EmailVerificationSettings
              title={t('emailssection.emailBackup')}
              description={t('emailssection.canBeReplacedOrRemovedWithoutChangeEmailPrimary')}
              emailLabel={t('emailssection.newBackup')}
              emailPlaceholder={t('emailssection.backupExample')}
              tokenLabel={t('emailssection.tokenReceived')}
              tokenPlaceholder={t('emailssection.pasteToken')}
              requestLabel={t('emailssection.sendVerification')}
              completeLabel={t('emailssection.confirmBackup')}
              inputId="backup-email-change"
              tokenId="backup-email-token"
              busy={settings.busy()}
              onRequest={(email) => void settings.requestBackup(email)}
              onComplete={(token) => void settings.completeBackup(token)}
            />
            <Show when={settings.message()}>
              {(message) => (
                <p role="status" class="text-muted rounded-2xl border border-line bg-surface px-4 py-3">
                  {message()}
                </p>
              )}
            </Show>
            <RegisteredEmails
              emails={account.emails()}
              busy={settings.busy()}
              removeCandidate={settings.removeCandidate()}
              onVerifyPrimary={() => void settings.startPrimaryVerification()}
              onResendBackup={(email) => void settings.resendBackupVerification(email)}
              onRequestRemove={settings.setRemoveCandidate}
              onCancelRemove={() => settings.setRemoveCandidate(null)}
              onConfirmRemove={(email) => void settings.removeBackup(email)}
            />
          </div>
        </SectionCardBody>
      </SectionCard>
    </SettingsState>
  );
}

export default withLocale(EmailSettings);
