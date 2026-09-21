import { createStore } from 'solid-js/store';
import { useAuth } from '@/features/auth/public';
import { useI18n } from '@/features/account/i18n';
import { createPasswordCredentialSchema } from '@/features/account/ui/schemas/security.schema.ts';
import { preloadPasswordAuthentication } from '@/features/auth/public/authentication';

export function useCreatePassword(onAfterChange: () => Promise<void>) {
  preloadPasswordAuthentication();
  const { t, locale } = useI18n();
  const { createPasswordCredential, startPossessionProof, completePossessionProof } = useAuth();
  const [state, setState] = createStore({
    busy: false,
    error: null as string | null,
    proofSent: false,
    proofCode: '',
    proofAccepted: false,
    reauthRequired: false,
  });

  const clearError = () => setState('error', null);
  const run = async (operation: () => Promise<void>) => {
    if (state.busy) return;
    setState('busy', true);
    setState('error', null);
    try {
      await operation();
    } finally {
      setState('busy', false);
    }
  };

  const requestProof = async () =>
    run(async () => {
      const result = await startPossessionProof();
      const data = result.data?.data;
      if (result.error) setState('error', t('passwordsection.couldNotStartProofRecent'));
      else if (data?.sent) {
        setState('proofSent', true);
        setState('reauthRequired', false);
      } else if (data?.mfaRequired) {
        setState('proofSent', false);
        setState('reauthRequired', true);
      }
    });

  const confirmProof = async () => {
    if (!state.proofCode.trim()) return;
    await run(async () => {
      const result = await completePossessionProof(state.proofCode.trim());
      if (result.error || !result.data?.data?.accepted) {
        setState('error', t('passwordsection.codeProofNotWasAccepted'));
        return;
      }
      setState('proofAccepted', true);
      setState('proofCode', '');
    });
  };

  const submit = async (values: { newPassword: string; confirmPassword: string }) => {
    if (state.busy || !state.proofAccepted) return false;
    setState('error', null);
    const parsed = createPasswordCredentialSchema(locale()).safeParse({
      ...values,
    });
    if (!parsed.success) {
      setState(
        'error',
        parsed.error.issues[0]?.message ?? t('passwordsection.couldNotChangeCredentialVerifyProofExigidatryAgain'),
      );
      return false;
    }
    setState('busy', true);
    try {
      const ok = await createPasswordCredential(values.newPassword);
      if (!ok) {
        setState('error', t('passwordsection.couldNotChangeCredentialVerifyProofExigidatryAgain'));
        return false;
      }
      await onAfterChange();
      return true;
    } finally {
      setState('busy', false);
    }
  };

  return {
    busy: () => state.busy,
    error: () => state.error,
    clearError,
    proofSent: () => state.proofSent,
    proofCode: () => state.proofCode,
    setProofCode: (value: string) => setState('proofCode', value),
    proofAccepted: () => state.proofAccepted,
    reauthRequired: () => state.reauthRequired,
    requestProof,
    confirmProof,
    submit,
  };
}
