import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AccountRepository } from '@/modules/account/application/ports/account.repository';
import { AccountPurgeInputDTO } from '@/modules/account/application/account/dtos/in';
import { AccountPurgeSummaryDTO } from '@/modules/account/application/account/dtos/out';
import { accountDeletionRetentionCutoff } from '@/modules/account/application/account/account-deletion.policy';
import { ACCOUNT_PURGE_REQUESTED_EVENT, AccountPurgeRequestedEvent } from '@/modules/account/public/events';
import { ResourceIdentityPort } from '@/shared/kernel/resource/resource-identity.port';

@Injectable()
export class PurgeDeletedAccountsCommand {
  constructor(
    private readonly userRepository: AccountRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly resources: ResourceIdentityPort,
  ) {}

  async execute(input: AccountPurgeInputDTO = {}): Promise<AccountPurgeSummaryDTO> {
    const now = input.now ?? new Date();
    const cutoff = accountDeletionRetentionCutoff(now);
    const candidates = await this.userRepository.listDeletionPurgeCandidateIds(cutoff);
    let purgedCount = 0;

    for (const accountId of candidates) {
      await this.eventEmitter.emitAsync(ACCOUNT_PURGE_REQUESTED_EVENT, new AccountPurgeRequestedEvent(accountId));
      await this.userRepository.deleteById(accountId);
      await this.resources.removeOrphans();
      purgedCount += 1;
    }

    return { purgedCount };
  }
}
