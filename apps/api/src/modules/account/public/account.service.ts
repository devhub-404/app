import { Injectable } from '@nestjs/common';
import { EmailAvailabilityQueryRepository } from '@/modules/account/application/account/ports/email-availability.query.repository';
import { AccountAuthenticationQueryRepository } from '@/modules/account/application/account/ports/account-authentication.query.repository';
import { DeactivateAccountCommand } from '@/modules/account/application/account/use-cases/command/deactivate-account.command';
import { ReactivateAccountCommand } from '@/modules/account/application/account/use-cases/command/reactivate-account.command';
import { CheckUsernameAvailabilityQuery } from '@/modules/account/application/account/use-cases/query/check-username-availability.query';
import { RequestAccountDeletionCommand } from '@/modules/account/application/account/use-cases/command/request-account-deletion.command';
import { RestoreDeletedAccountCommand } from '@/modules/account/application/account/use-cases/command/restore-deleted-account.command';
import {
  AccountServicePort,
  type AccountAuthenticationView,
  type AccountAccessEligibilityView,
  type VerifiedPrimaryEmailAccount,
} from '@/modules/account/public/account.service.port';

@Injectable()
export class AccountService implements AccountServicePort {
  constructor(
    private readonly accountAuthenticationQueryRepository: AccountAuthenticationQueryRepository,
    private readonly emailAvailabilityQueryRepository: EmailAvailabilityQueryRepository,
    private readonly deactivateMeCommand: DeactivateAccountCommand,
    private readonly reactivateMeCommand: ReactivateAccountCommand,
    private readonly checkUsernameAvailabilityQuery: CheckUsernameAvailabilityQuery,
    private readonly deleteMeCommand: RequestAccountDeletionCommand,
    private readonly restoreDeletedAccountCommand: RestoreDeletedAccountCommand,
  ) {}

  async checkEmailAvailability(email: string): Promise<boolean> {
    return await this.emailAvailabilityQueryRepository.isEmailAvailable(email);
  }
  async checkUsernameAvailability(username: string): Promise<boolean> {
    return await this.checkUsernameAvailabilityQuery.execute(username);
  }
  async deactivateMe(userId: string): Promise<void> {
    await this.deactivateMeCommand.execute(userId);
  }
  async reactivateMe(userId: string): Promise<void> {
    await this.reactivateMeCommand.execute(userId);
  }
  async deleteMe(userId: string): Promise<void> {
    await this.deleteMeCommand.execute(userId);
  }
  async restoreDeletedAccount(userId: string): Promise<void> {
    await this.restoreDeletedAccountCommand.execute(userId);
  }
  async getAuthenticationView(userId: string): Promise<AccountAuthenticationView | null> {
    return await this.accountAuthenticationQueryRepository.getAuthenticationView(userId);
  }
  async getAccessEligibility(userId: string): Promise<AccountAccessEligibilityView | null> {
    return await this.accountAuthenticationQueryRepository.getAccessEligibility(userId);
  }
  async findVerifiedPrimaryEmailAccount(email: string): Promise<VerifiedPrimaryEmailAccount | null> {
    return await this.accountAuthenticationQueryRepository.findVerifiedPrimaryEmailAccount(email);
  }
}
