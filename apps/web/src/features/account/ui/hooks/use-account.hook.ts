import { useStore } from "@nanostores/solid";
import { $appAccount as $account } from "@/app/session/app-account.store";
import {
  bootstrapAccount,
  deleteAccount,
  disableAccount,
  linkOAuthProvider,
  logoutAllSessions,
  logoutOtherSessions,
  refreshAccount,
  refreshOAuthLinks,
  refreshSessions,
  removeBackupEmail,
  requestAddEmail,
  requestPrimaryEmailChange,
  completePrimaryEmailChange,
  resendAddEmailVerification,
  startEmailVerification,
  revokeSession,
  unlinkOAuthProvider,
  updatePreferences,
  getPreferences,
  verifyAddEmail,
} from "@/features/account/actions/account.action.ts";

export {
  $appAccount as $account,
  clearAppAccount as clearAccount,
  setAccountDetails,
  setAccountShell,
} from "@/app/session/app-account.store";

export function useAccount() {
  return {
    state: useStore($account),
    bootstrapAccount,
    refreshAccount,
    refreshSessions,
    revokeSession,
    logoutAllSessions,
    logoutOtherSessions,
    refreshOAuthLinks,
    linkOAuthProvider,
    unlinkOAuthProvider,
    requestAddEmail,
    requestPrimaryEmailChange,
    completePrimaryEmailChange,
    resendAddEmailVerification,
    startEmailVerification,
    verifyAddEmail,
    removeBackupEmail,
    updatePreferences,
    getPreferences,
    disableAccount,
    deleteAccount,
  };
}
