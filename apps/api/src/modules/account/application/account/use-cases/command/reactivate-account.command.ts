import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';
import { ACCOUNT_REACTIVATED_EVENT, AccountReactivatedEvent } from '@/modules/account/public/events';

@Injectable()
export class ReactivateAccountCommand {
  constructor(
    private readonly userRepository: AccountWriteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}
  async execute(userId: string): Promise<void> {
    const account = await this.userRepository.findAggregateById(userId);
    if (!account || account.voluntaryStatus === 'active') return;
    account.reactivate();
    if (!(await this.userRepository.saveAggregate(account))) return;
    this.eventEmitter.emit(ACCOUNT_REACTIVATED_EVENT, new AccountReactivatedEvent(userId));
  }
}
