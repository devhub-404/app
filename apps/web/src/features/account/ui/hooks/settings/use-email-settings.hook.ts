import { createMemo, createSignal, type Accessor } from 'solid-js';
import type { EmailDTO } from '@/features/account/types/account.type.ts';
import { useAccount } from '@/features/account/ui/hooks/use-account.hook.ts';
import { useI18n } from '@/features/account/i18n';
import { createEmailSettingsSchemas } from '@/features/account/ui/schemas/email.schema.ts';

export function useEmailSettings(emails: Accessor<EmailDTO[]>, onRefresh: () => Promise<unknown>) {
  const { t, locale } = useI18n();
  const schemas = () => createEmailSettingsSchemas(locale());
  const {
    requestPrimaryEmailChange,
    completePrimaryEmailChange,
    requestAddEmail,
    resendAddEmailVerification,
    startEmailVerification,
    verifyAddEmail,
    removeBackupEmail,
  } = useAccount();

  const [busy, setBusy] = createSignal(false);
  const [message, setMessage] = createSignal('');
  const [removeCandidate, setRemoveCandidate] = createSignal<string | null>(null);
  const primaryEmail = createMemo(() => emails().find((email) => email.type === 'primary')?.email ?? null);

  const run = async (operation: () => Promise<void>) => {
    if (busy()) return;
    setBusy(true);
    setMessage('');
    try {
      await operation();
    } finally {
      setBusy(false);
    }
  };

  const startPrimaryVerification = async () =>
    run(async () => {
      const result = await startEmailVerification();
      setMessage(
        !result
          ? t('emailssection.couldNotStartVerificationEmailPrimary')
          : t('emailssection.verificationEmailPrimarySubmitted'),
      );
    });

  const requestPrimaryChange = async (emailInput: string) => {
    const parsed = schemas().changeEmail.safeParse({ email: emailInput.trim().toLowerCase() });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? t('emailssection.couldNotStartChangeEmailPrimary'));
      return;
    }
    await run(async () => {
      const result = await requestPrimaryEmailChange(parsed.data);
      setMessage(
        !result
          ? t('emailssection.couldNotStartChangeEmailPrimary')
          : t('emailssection.verifyNewEmailUseTokenReceivedCompleteChange'),
      );
    });
  };

  const completePrimaryChange = async (tokenInput: string) => {
    const parsed = schemas().token.safeParse({ token: tokenInput });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? t('emailssection.tokenChangeEmailPrimaryInvalidOrExpired'));
      return;
    }
    await run(async () => {
      const result = await completePrimaryEmailChange(parsed.data);
      if (!result) {
        setMessage(t('emailssection.tokenChangeEmailPrimaryInvalidOrExpired'));
        return;
      }
      setMessage(t('emailssection.emailPrimaryUpdated'));
      await onRefresh();
    });
  };

  const requestBackup = async (emailInput: string) => {
    const parsed = schemas().changeEmail.safeParse({ email: emailInput.trim().toLowerCase() });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? t('emailssection.couldNotStartChangeEmailBackup'));
      return;
    }
    await run(async () => {
      const result = await requestAddEmail(parsed.data);
      if (!result) {
        setMessage(t('emailssection.couldNotStartChangeEmailBackup'));
        return;
      }
      setMessage(t('emailssection.verificationEmailBackupSubmitted'));
      await onRefresh();
    });
  };

  const completeBackup = async (tokenInput: string) => {
    const parsed = schemas().token.safeParse({ token: tokenInput });
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? t('emailssection.tokenVerificationBackupInvalidOrExpired'));
      return;
    }
    await run(async () => {
      const result = await verifyAddEmail(parsed.data);
      if (!result) {
        setMessage(t('emailssection.tokenVerificationBackupInvalidOrExpired'));
        return;
      }
      setMessage(t('emailssection.emailBackupUpdated'));
      await onRefresh();
    });
  };

  const resendBackupVerification = async (email: string) =>
    run(async () => {
      const parsed = schemas().changeEmail.safeParse({ email });
      if (!parsed.success) {
        setMessage(parsed.error.issues[0]?.message ?? t('emailssection.couldNotResendVerification'));
        return;
      }
      const result = await resendAddEmailVerification(parsed.data);
      setMessage(!result ? t('emailssection.couldNotResendVerification') : t('emailssection.verificationResent'));
    });

  const removeBackup = async (_email: string) =>
    run(async () => {
      const result = await removeBackupEmail();
      if (!result) {
        setMessage(t('emailssection.couldNotRemoveEmailBackup'));
        return;
      }
      setRemoveCandidate(null);
      await onRefresh();
    });

  return {
    busy,
    message,
    primaryEmail,
    removeCandidate,
    setRemoveCandidate,
    startPrimaryVerification,
    requestPrimaryChange,
    completePrimaryChange,
    requestBackup,
    completeBackup,
    resendBackupVerification,
    removeBackup,
  };
}
