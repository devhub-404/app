import type { Account } from '@/modules/account/domain/entities/account';

export abstract class AccountWriteRepository {
  abstract findAggregateById(accountId: string): Promise<Account | null>;
  abstract saveAggregate(account: Account): Promise<boolean>;
}
