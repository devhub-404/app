import { Inject, Injectable } from '@nestjs/common';
import {
  ACCOUNT_SERVICE,
  AccountServicePort,
  type AccountAuthenticationView,
} from '@/modules/account/public/account.service.port';

@Injectable()
export class GetAccountAuthenticationViewQuery {
  constructor(@Inject(ACCOUNT_SERVICE) private readonly accountService: AccountServicePort) {}

  execute(userId: string): Promise<AccountAuthenticationView | null> {
    return this.accountService.getAuthenticationView(userId);
  }
}
