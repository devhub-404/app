import { Injectable } from '@nestjs/common';
import { AccountAuthenticationQueryRepository } from '../application/account/ports/account-authentication.query.repository';
import { AccountEligibilityPort } from './account-eligibility.port';
import type { AccountAccessEligibilityView } from './account.service.port';

@Injectable()
export class AccountEligibilityService implements AccountEligibilityPort {
  constructor(private readonly accounts: AccountAuthenticationQueryRepository) {}

  getAccessEligibility(userId: string): Promise<AccountAccessEligibilityView | null> {
    return this.accounts.getAccessEligibility(userId);
  }
}
