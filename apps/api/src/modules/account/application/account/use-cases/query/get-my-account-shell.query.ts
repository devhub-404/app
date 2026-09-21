import { Inject, Injectable } from '@nestjs/common';
import { AccountShellDTO } from '@/modules/account/application/account/dtos/out/account-shell.dto';
import { AccountShellQueryRepository } from '@/modules/account/application/account/ports/account-shell.query.repository';

@Injectable()
export class GetMyAccountShellQuery {
  constructor(@Inject(AccountShellQueryRepository) private readonly accountShellQuery: AccountShellQueryRepository) {}

  async execute(userId: string): Promise<AccountShellDTO | null> {
    return this.accountShellQuery.findByUserId(userId);
  }
}
