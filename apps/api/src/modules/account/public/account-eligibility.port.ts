import type { AccountAccessEligibilityView } from './account.service.port';

/** Narrow cross-owner contract for checking whether an Account may participate in a new relationship. */
export abstract class AccountEligibilityPort {
  abstract getAccessEligibility(userId: string): Promise<AccountAccessEligibilityView | null>;
}
