import { clearAccount } from '@/features/account/public/account-state';
import { clearPersonalState } from '@/shared/runtime/personal-state';

export function clearSessionState() {
  clearAccount();
  clearPersonalState();
}
