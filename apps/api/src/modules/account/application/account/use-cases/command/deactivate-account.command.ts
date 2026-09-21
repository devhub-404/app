import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';
import { ACCOUNT_DEACTIVATED_EVENT, AccountDeactivatedEvent } from '@/modules/account/public/events';

@Injectable()
export class DeactivateAccountCommand {
  constructor(
    private readonly userRepository: AccountWriteRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string): Promise<void> {
    const account = await this.userRepository.findAggregateById(userId);
    if (!account) return;
    if (account.voluntaryStatus === 'deactivated') return;
    account.deactivate();
    if (!(await this.userRepository.saveAggregate(account))) return;

    // Session revocation is idempotent. Await it so a serverless invocation
    // cannot finish before every active session credential is made unusable.
    await this.eventEmitter.emitAsync(ACCOUNT_DEACTIVATED_EVENT, new AccountDeactivatedEvent(userId));
  }
}
