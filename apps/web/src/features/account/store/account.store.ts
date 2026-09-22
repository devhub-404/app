/**
 * Compatibility surface for account feature consumers.
 * The canonical store lives in the application session runtime.
 */
export type {
  AccountState,
  AccountStateStatus,
} from "@/app/session/app-account.store";
export {
  $appAccount as $account,
  clearAppAccount as clearAccount,
  setAccountDetails,
  setAccountError,
  setAccountLoading,
  setAccountShell,
  setAccountUnavailable,
} from "@/app/session/app-account.store";
