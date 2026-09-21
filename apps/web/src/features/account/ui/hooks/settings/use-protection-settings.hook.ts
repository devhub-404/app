import { onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { useAuth } from '@/features/auth/public';
import type { PossessionProofStarted, TotpEnrollment } from '@/features/auth/public/mfa';
import { useI18n } from '@/features/account/i18n';
import type { DisableMfaFormInput, TotpEnrollmentFormInput } from '@/features/account/ui/schemas/mfa.schema.ts';
import type { PossessionProofInput } from '@/features/account/ui/hooks/use-possession-proof-flow.hook.ts';

export type DisableMfaMethod = 'totp' | 'recovery_code';

export function useProtectionSettings(initialEnabled: boolean, onRefresh: () => Promise<unknown>) {
  const { t } = useI18n();
  const genericFailure = t('securitysection.operationNotCanBeConcluidatryAgain');
  const {
    startTotpEnrollment,
    completeTotpEnrollment,
    disableTotp,
    regenerateRecoveryCodes,
    getMfaConfiguration,
    startPossessionProof,
    completePossessionProof,
  } = useAuth();

  const [state, setState] = createStore({
    enrollment: null as TotpEnrollment | null,
    recoveryCodes: [] as string[],
    busy: false,
    mfaEnabled: initialEnabled,
    disableOpen: false,
    possessionProofSent: false,
    possessionProofRequired: false,
    reauthRequired: false,
    error: null as string | null,
  });

  const fail = (message = genericFailure) => setState('error', message);
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

  onMount(async () => {
    const result = await getMfaConfiguration();
    if (result.data?.data) setState('mfaEnabled', result.data.data.enabled);
    else if (result.error) fail(t('securitysection.couldNotLoadConfigurationMfa'));
  });

  const startEnrollment = async () =>
    run(async () => {
      const result = await startTotpEnrollment();
      const data = result.data?.data;
      if (result.error || !data) {
        if (result.error?.code === 'AUTH_REQUIRED') {
          setState('possessionProofRequired', true);
          setState('possessionProofSent', true);
        }
        fail(t('securitysection.couldNotStartConfigurationTotp'));
      } else setState('enrollment', data);
    });

  const completeEnrollment = async (input: TotpEnrollmentFormInput) =>
    run(async () => {
      const result = await completeTotpEnrollment({ code: input.code.trim() });
      const data = result.data?.data;
      if (result.error || !data?.recoveryCodes) {
        fail(t('securitysection.codeTotpNotWasAccepted'));
        return;
      }
      setState('recoveryCodes', data.recoveryCodes);
      setState('enrollment', null);
      setState('mfaEnabled', true);
      await onRefresh();
    });

  const openDisable = () => {
    setState('error', null);
    setState('disableOpen', true);
  };

  const closeDisable = () => setState('disableOpen', false);

  const disableMfa = async (input: DisableMfaFormInput) =>
    run(async () => {
      const ok = await disableTotp({ method: input.method, code: input.code.trim() });
      if (!ok) {
        fail(t('securitysection.couldNotDisableTotp'));
        return;
      }
      setState('mfaEnabled', false);
      closeDisable();
      await onRefresh();
    });

  const regenerate = async () =>
    run(async () => {
      const result = await regenerateRecoveryCodes();
      const data = result.data?.data;
      if (result.error || !data?.recoveryCodes) {
        if (result.error?.code === 'AUTH_REQUIRED') {
          setState('possessionProofRequired', true);
          setState('possessionProofSent', false);
        }
        fail(t('securitysection.couldNotRegenerateRecoveryCodes'));
      } else setState('recoveryCodes', data.recoveryCodes);
    });

  const requestPossessionProof = async () =>
    run(async () => {
      const result = await startPossessionProof();
      const data: PossessionProofStarted | undefined = result.data?.data;
      if (result.error) fail(t('securitysection.couldNotStartProofRecentPossession'));
      else if (data?.sent) {
        setState('possessionProofSent', true);
        setState('possessionProofRequired', true);
        setState('reauthRequired', false);
      } else if (data?.mfaRequired) {
        setState('possessionProofSent', false);
        setState('possessionProofRequired', true);
        setState('reauthRequired', true);
      }
    });

  const confirmPossessionProof = async (input: PossessionProofInput) =>
    run(async () => {
      const result = await completePossessionProof(
        state.reauthRequired ? { mfaMethod: input.method, mfaCode: input.code.trim() } : input.code.trim(),
      );
      if (result.error || !result.data?.data?.accepted) {
        fail(t('passwordsection.codeProofNotWasAccepted'));
        return;
      }
      setState('possessionProofSent', false);
      setState('possessionProofRequired', false);
      setState('reauthRequired', false);
    });

  const dismissPossessionProof = () => {
    setState('possessionProofSent', false);
    setState('possessionProofRequired', false);
    setState('reauthRequired', false);
  };

  return {
    enrollment: () => state.enrollment,
    recoveryCodes: () => state.recoveryCodes,
    busy: () => state.busy,
    mfaEnabled: () => state.mfaEnabled,
    disableOpen: () => state.disableOpen,
    possessionProofSent: () => state.possessionProofSent,
    possessionProofRequired: () => state.possessionProofRequired,
    reauthRequired: () => state.reauthRequired,
    error: () => state.error,
    startEnrollment,
    completeEnrollment,
    openDisable,
    closeDisable,
    disableMfa,
    regenerate,
    requestPossessionProof,
    confirmPossessionProof,
    dismissPossessionProof,
  };
}
