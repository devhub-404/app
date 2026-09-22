export { useAccount } from "../ui/hooks/use-account.hook.ts";
export {
  $account,
  clearAccount,
  setAccountDetails,
  setAccountShell,
} from "@/features/account/store/account-projection.store";
export type { AccountDetailsView, AccountShellView } from "../types";
