import { useStore } from "@nanostores/solid";
import { createMemo } from "solid-js";
import { $auth } from "@/features/auth/store/auth.store.ts";
import { authCoordinator } from "@/features/auth/runtime/auth-runtime";
import {
  changePassword as changePasswordAction,
  completeAccountRecovery as completeAccountRecoveryAction,
  completeMagicLink,
  completePossessionProof,
  completeTotpEnrollment,
  createPasswordCredential as createPasswordCredentialAction,
  deleteCredential as deleteCredentialAction,
  disableTotp as disableTotpAction,
  getMfaConfiguration,
  handleOAuthCallback,
  listPasskeyDevices,
  login as loginAction,
  loginPasskey,
  register as registerAction,
  registerPasskey,
  regenerateRecoveryCodes,
  requestMagicLink,
  requestPasswordReset as requestPasswordResetAction,
  resendVerification as resendVerificationAction,
  resetPassword as resetPasswordAction,
  startAccountRecovery as startAccountRecoveryAction,
  startOAuth,
  startPossessionProof,
  startTotpEnrollment,
  updatePasskeyDeviceName as updatePasskeyDeviceNameAction,
  verifyEmail as verifyEmailAction,
  verifyMfaRecoveryCode,
  verifyMfaTotp,
  type AuthCommandResult,
} from "@/features/auth/actions/auth.action.ts";
import { notifyError, notifySuccess } from "@/shared/ui/feedback/notifications";

async function withMutationFeedback(
  operation: () => Promise<AuthCommandResult>,
): Promise<boolean> {
  const result = await operation();
  if (!result.ok) {
    notifyError(result.code);
    return false;
  }
  notifySuccess(result.code);
  return true;
}

export function useAuth() {
  const auth = useStore($auth);
  const authenticated = createMemo(() => auth().status === "authenticated");
  const session = createMemo(() => ({
    status: authenticated() ? ("authenticated" as const) : ("unauthenticated" as const),
    me: null,
  }));
  return {
    session,
    authenticated,
    sessionId: createMemo(() => {
      const state = auth();
      return authenticated() && state.status === "authenticated"
        ? state.session.id
        : null;
    }),
    role: createMemo(() => null),
    login: async (...args: Parameters<typeof loginAction>) => {
      const result = await loginAction(...args);
      if (result.error)
        notifyError(result.error.code ?? "NETWORK_REQUEST_FAILED");
      return result;
    },
    loginPasskey,
    verifyMfaTotp,
    verifyMfaRecoveryCode,
    startTotpEnrollment,
    getMfaConfiguration,
    startPossessionProof,
    completePossessionProof,
    completeTotpEnrollment,
    disableTotp: (...args: Parameters<typeof disableTotpAction>) =>
      withMutationFeedback(() => disableTotpAction(...args)),
    regenerateRecoveryCodes,
    listPasskeyDevices,
    registerPasskey,
    updatePasskeyDeviceName: (
      ...args: Parameters<typeof updatePasskeyDeviceNameAction>
    ) => withMutationFeedback(() => updatePasskeyDeviceNameAction(...args)),
    deleteCredential: (...args: Parameters<typeof deleteCredentialAction>) =>
      withMutationFeedback(() => deleteCredentialAction(...args)),
    requestMagicLink,
    completeMagicLink,
    register: (...args: Parameters<typeof registerAction>) =>
      withMutationFeedback(() => registerAction(...args)),
    logout: async () => {
      const result = await authCoordinator.logoutCurrent();
      if (!result.ok) {
        notifyError(result.code);
        return false;
      }
      if (!result.alreadyInvalidated) notifySuccess("AUTH_LOGGED_OUT");
      return true;
    },
    requestPasswordReset: (
      ...args: Parameters<typeof requestPasswordResetAction>
    ) => withMutationFeedback(() => requestPasswordResetAction(...args)),
    startAccountRecovery: (
      ...args: Parameters<typeof startAccountRecoveryAction>
    ) => withMutationFeedback(() => startAccountRecoveryAction(...args)),
    completeAccountRecovery: (
      ...args: Parameters<typeof completeAccountRecoveryAction>
    ) => withMutationFeedback(() => completeAccountRecoveryAction(...args)),
    resetPassword: (...args: Parameters<typeof resetPasswordAction>) =>
      withMutationFeedback(() => resetPasswordAction(...args)),
    changePassword: (...args: Parameters<typeof changePasswordAction>) =>
      withMutationFeedback(() => changePasswordAction(...args)),
    createPasswordCredential: (
      ...args: Parameters<typeof createPasswordCredentialAction>
    ) => withMutationFeedback(() => createPasswordCredentialAction(...args)),
    verifyEmail: (...args: Parameters<typeof verifyEmailAction>) =>
      withMutationFeedback(() => verifyEmailAction(...args)),
    resendVerification: (
      ...args: Parameters<typeof resendVerificationAction>
    ) => withMutationFeedback(() => resendVerificationAction(...args)),
    handleOAuthCallback,
    startOAuth,
  };
}
