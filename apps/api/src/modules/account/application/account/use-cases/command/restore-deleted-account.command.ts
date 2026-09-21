import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';
import { isWithinAccountDeletionRetention } from '@/modules/account/application/account/account-deletion.policy';

@Injectable()
export class RestoreDeletedAccountCommand {
  constructor(private readonly accounts: AccountWriteRepository) {}

  async execute(accountId: string, now = new Date()): Promise<void> {
    const account = await this.accounts.findAggregateById(accountId);
    if (!account) throw new AppError('USER_NOT_FOUND');
    if (
      account.deletionStatus !== 'pending' ||
      !account.deletionRequestedAt ||
      !isWithinAccountDeletionRetention(account.deletionRequestedAt, now)
    ) {
      throw new AppError('USER_INVALID_STATUS');
    }

    account.cancelDeletion();
    const restored = await this.accounts.saveAggregate(account);
    if (restored) return;

    // The state changed between eligibility read and CAS. Do not reinterpret a
    // lost race as success: callers must re-evaluate the current authoritative state.
    throw new AppError('USER_INVALID_STATUS');
  }
}

/** Contract name for the user-facing cancellation flow. */
@Injectable()
export class CancelAccountDeletionCommand extends RestoreDeletedAccountCommand {}
