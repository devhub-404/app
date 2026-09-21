import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppError } from '@/shared/errors/app-error';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';
import { ACCOUNT_BANNED_EVENT, AccountBannedEvent } from '@/modules/account/public/events';

@Injectable()
export class BanAccountCommand {
  constructor(
    private readonly userRepository: AccountWriteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<void> {
    const account = await this.userRepository.findAggregateById(userId);
    if (!account) throw new AppError('USER_NOT_FOUND');
    if (account.moderationStatus !== 'banned') {
      account.ban();
      if (!(await this.userRepository.saveAggregate(account))) throw new AppError('USER_NOT_FOUND');
    }

    await this.eventEmitter.emitAsync(ACCOUNT_BANNED_EVENT, new AccountBannedEvent(userId));
  }
}
