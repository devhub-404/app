import { clearAccount } from "@/features/account/store/account-projection.store";
import { clearPersonalState } from "@/shared/runtime/personal-state";

export function clearSessionState() {
  clearAccount();
  clearPersonalState();
}
