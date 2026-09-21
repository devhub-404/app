import { Module } from '@nestjs/common';
import { AccountAuthenticationQueryRepository } from '@/modules/account/application/account/ports/account-authentication.query.repository';
import { ProfileQueryRepository } from '@/modules/account/application/profile/ports/profile.query.repository';
import { DrizzleAccountAuthenticationQueryRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/account-authentication.query.repository';
import { DrizzleProfileQueryRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/profile.query.repository';
import { AccountShellQueryRepository } from '@/modules/account/application/account/ports/account-shell.query.repository';
import { DrizzleAccountShellQueryRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/account-shell.query.repository';

@Module({
  providers: [
    { provide: AccountAuthenticationQueryRepository, useClass: DrizzleAccountAuthenticationQueryRepository },
    { provide: ProfileQueryRepository, useClass: DrizzleProfileQueryRepository },
    { provide: AccountShellQueryRepository, useClass: DrizzleAccountShellQueryRepository },
  ],
  exports: [AccountAuthenticationQueryRepository, ProfileQueryRepository, AccountShellQueryRepository],
})
export class AccountReadRepositoriesModule {}
