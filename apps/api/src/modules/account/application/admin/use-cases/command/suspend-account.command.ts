import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppError } from '@/shared/errors/app-error';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';
import { ACCOUNT_SUSPENDED_EVENT, AccountSuspendedEvent } from '@/modules/account/public/events';

@Injectable()
export class SuspendAccountCommand {
  constructor(
    private readonly userRepository: AccountWriteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, lockedUntil?: string): Promise<void> {
    const account = await this.userRepository.findAggregateById(userId);
    if (!account) throw new AppError('USER_NOT_FOUND');
    const normalizedLockedUntil = lockedUntil ? new Date(lockedUntil) : null;
    const alreadySuspended =
      account.moderationStatus === 'suspended' &&
      (account.lockedUntil?.getTime() ?? null) === (normalizedLockedUntil?.getTime() ?? null);

    if (!alreadySuspended) {
      account.suspend(normalizedLockedUntil);
      if (!(await this.userRepository.saveAggregate(account))) throw new AppError('USER_NOT_FOUND');
    }

    await this.eventEmitter.emitAsync(
      ACCOUNT_SUSPENDED_EVENT,
      new AccountSuspendedEvent(userId, normalizedLockedUntil?.toISOString() ?? null),
    );
  }
}
