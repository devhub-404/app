import type {
  AccountAuthenticationView,
  AccountAccessEligibilityView,
  VerifiedPrimaryEmailAccount,
} from '@/modules/account/public/account.service.port';

export type AccountAuthenticationViewResult = AccountAuthenticationView;
export type AccountAccessEligibilityViewResult = AccountAccessEligibilityView;
export type VerifiedPrimaryEmailAccountResult = VerifiedPrimaryEmailAccount;

export abstract class AccountAuthenticationQueryRepository {
  abstract getAuthenticationView(userId: string): Promise<AccountAuthenticationViewResult | null>;
  abstract getAccessEligibility(userId: string): Promise<AccountAccessEligibilityViewResult | null>;
  abstract findVerifiedPrimaryEmailAccount(email: string): Promise<VerifiedPrimaryEmailAccountResult | null>;
}
