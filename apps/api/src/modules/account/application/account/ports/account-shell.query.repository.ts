import type { AccountShellDTO } from '@/modules/account/application/account/dtos/out/account-shell.dto';

export abstract class AccountShellQueryRepository {
  abstract findByUserId(userId: string): Promise<AccountShellDTO | null>;
}
