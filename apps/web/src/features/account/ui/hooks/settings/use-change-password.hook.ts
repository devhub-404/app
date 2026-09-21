import { createSignal } from 'solid-js';
import { useAuth } from '@/features/auth/public';
import { useI18n } from '@/features/account/i18n';
import { createChangePasswordSchema } from '@/features/account/ui/schemas/security.schema.ts';
import { preloadPasswordAuthentication } from '@/features/auth/public/authentication';

export function useChangePassword(email: () => string, onAfterChange: () => Promise<void>) {
  preloadPasswordAuthentication();
  const { t, locale } = useI18n();
  const { changePassword } = useAuth();
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const clearError = () => setError(null);

  const submit = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    if (busy()) return false;
    setError(null);
    const parsed = createChangePasswordSchema(locale()).safeParse({
      email: email(),
      ...values,
    });
    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? t('passwordsection.couldNotChangeCredentialVerifyProofExigidatryAgain'),
      );
      return false;
    }

    setBusy(true);
    try {
      const ok = await changePassword({
        currentPassword: values.currentPassword,
        email: email(),
        newPassword: values.newPassword,
      });
      if (!ok) {
        setError(t('passwordsection.couldNotChangeCredentialVerifyProofExigidatryAgain'));
        return false;
      }
      await onAfterChange();
      return true;
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    error,
    clearError,
    submit,
  };
}
