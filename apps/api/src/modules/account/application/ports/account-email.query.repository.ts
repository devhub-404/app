import type { AccountEmailDetails } from '@/modules/account/public/account-access.ports';

export abstract class AccountEmailQueryRepository {
  abstract listByUserId(userId: string): Promise<AccountEmailDetails[]>;
}
