import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppError } from '@/shared/errors/app-error';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';
import { ACCOUNT_DELETION_REQUESTED_EVENT, AccountDeletionRequestedEvent } from '@/modules/account/public/events';

@Injectable()
export class RequestAccountDeletionCommand {
  constructor(
    private readonly userRepository: AccountWriteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<void> {
    const account = await this.userRepository.findAggregateById(userId);
    if (!account) return;
    const requestedAt = account.deletionRequestedAt ?? new Date();
    if (account.deletionStatus === 'none') {
      account.requestDeletion(requestedAt);
      if (!(await this.userRepository.saveAggregate(account))) throw new AppError('USER_INVALID_STATUS');
    } else if (account.deletionStatus !== 'pending') {
      throw new AppError('USER_INVALID_STATUS');
    }

    await this.eventEmitter.emitAsync(
      ACCOUNT_DELETION_REQUESTED_EVENT,
      new AccountDeletionRequestedEvent(userId, requestedAt.toISOString()),
    );
  }
}
