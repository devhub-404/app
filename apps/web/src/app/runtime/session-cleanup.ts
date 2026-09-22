import { clearAppAccount } from "@/app/session/app-account.store";
import { clearAppCurrentSession } from "@/app/session/app-current-session.store";
import { clearPersonalState } from "@/shared/runtime/personal-state";

export function clearSessionState() {
  clearAppAccount();
  clearAppCurrentSession();
  clearPersonalState();
}
