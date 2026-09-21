import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { AccountReadRepositoriesModule } from '@/modules/account/infrastructure/account-read-repositories.module';
import { MediaPublicModule } from '@/modules/media/public/media-public.module';
import { AccountService } from '@/modules/account/public/account.service';
import { ACCOUNT_SERVICE } from '@/modules/account/public/account.service.port';
import { ProfilesController } from '@/modules/account/presentation/account/profiles.controller';
import { MePreferencesController } from '@/modules/account/presentation/account/preferences.controller';
import { AccountController } from '@/modules/account/presentation/account/account.controller';
import { AccountAdminController } from '@/modules/account/presentation/admin/admin.controller';
import { EmailAvailabilityQueryRepository } from '@/modules/account/application/account/ports/email-availability.query.repository';
import { AccountRepository } from '@/modules/account/application/ports/account.repository';
import { AccountWriteRepository } from '@/modules/account/application/account/ports/account.write.repository';
import { AccountEmailRepository } from '@/modules/account/application/ports/account-email.repository';
import { AccountQueryRepository } from '@/modules/account/application/ports/account.query.repository';
import { RoleRepository } from '@/modules/account/application/admin/ports/role.repository';
import { AccountListQueryRepository } from '@/modules/account/application/admin/ports/account-list.query.repository';
import { ProfileRepository } from '@/modules/account/application/profile/ports/profile.repository';
import { PreferencesRepository } from '@/modules/account/application/preferences/ports/preferences.repository';
import { PreferencesQueryRepository } from '@/modules/account/application/preferences/ports/preferences.query.repository';
import { DrizzleEmailAvailabilityQueryRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/email-availability.query.repository';
import { DrizzleAccountRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/account.repository';
import { DrizzleAccountEmailRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/account-email.repository';
import { AccountEmailQueryRepository } from '@/modules/account/application/ports/account-email.query.repository';
import { DrizzleAccountQueryRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/account.query.repository';
import { DrizzleRoleRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/role.repository';
import { DrizzleAccountListQueryRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/account-list.query.repository';
import { DrizzleProfileRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/profile.repository';
import { DrizzlePreferencesRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/preferences.repository';
import { DrizzlePreferencesQueryRepository } from '@/modules/account/infrastructure/database/drizzle/repositories/preferences.query.repository';
import { CheckEmailAvailabilityQuery } from '@/modules/account/application/account/use-cases/query/check-email-availability.query';
import { GetAccountAuthenticationViewQuery } from '@/modules/account/application/account/use-cases/query/get-account-authentication-view.query';
import { GetMyAccountQuery } from '@/modules/account/application/account/use-cases/query/get-my-account.query';
import { GetMyAccountShellQuery } from '@/modules/account/application/account/use-cases/query/get-my-account-shell.query';
import { CreateAccountCommand } from '@/modules/account/application/account/use-cases/command/create-account.command';
import {
  RestoreDeletedAccountCommand,
  CancelAccountDeletionCommand,
} from '@/modules/account/application/account/use-cases/command/restore-deleted-account.command';
import { DeactivateAccountCommand } from '@/modules/account/application/account/use-cases/command/deactivate-account.command';
import { ReactivateAccountCommand } from '@/modules/account/application/account/use-cases/command/reactivate-account.command';
import { CheckUsernameAvailabilityQuery } from '@/modules/account/application/account/use-cases/query/check-username-availability.query';
import { RequestAccountDeletionCommand } from '@/modules/account/application/account/use-cases/command/request-account-deletion.command';
import { PurgeDeletedAccountsCommand } from '@/modules/account/application/account/use-cases/command/purge-deleted-accounts.command';
import { SuspendAccountCommand } from '@/modules/account/application/admin/use-cases/command/suspend-account.command';
import { UnsuspendAccountCommand } from '@/modules/account/application/admin/use-cases/command/unsuspend-account.command';
import { BanAccountCommand } from '@/modules/account/application/admin/use-cases/command/ban-account.command';
import { UnbanAccountCommand } from '@/modules/account/application/admin/use-cases/command/unban-account.command';
import { AssignAccountRolesCommand } from '@/modules/account/application/admin/use-cases/command/assign-user-roles.command';
import {
  ListAccountsQuery,
  GetAccountByIdQuery,
} from '@/modules/account/application/admin/use-cases/query/list-users.query';
import { CreateDefaultProfileCommand } from '@/modules/account/application/profile/use-cases/command/create-default-profile.command';
import { GetMyProfileQuery } from '@/modules/account/application/profile/use-cases/query/get-my-profile.query';
import { GetProfileByUsernameQuery } from '@/modules/account/application/profile/use-cases/query/get-profile-by-username.query';
import { UpdateMyProfileCommand } from '@/modules/account/application/profile/use-cases/command/update-my-profile.command';
import { CreateDefaultPreferencesCommand } from '@/modules/account/application/preferences/use-cases/command/create-default-preferences.command';
import { GetMyPreferencesQuery } from '@/modules/account/application/preferences/use-cases/query/get-my-preferences.query';
import { UpdateMyPreferencesCommand } from '@/modules/account/application/preferences/use-cases/command/update-my-preferences.command';
import { AccountAdminService } from '@/modules/account/public/account-admin.service';
import { ACCOUNT_ADMIN_SERVICE } from '@/modules/account/public/account-admin.service.port';
import { AccountAdminServicePort } from '@/modules/account/public/account-admin.service.port';
import { ArticlePublicModule } from '@/modules/article/public/article-public.module';
import { QAndAPublicModule } from '@/modules/q-and-a/public/q-and-a-public.module';
import { ExternalResourcePublicModule } from '@/modules/external-resource/public/resource-public.module';
import { JobPublicModule } from '@/modules/job/public/job-public.module';
import { ProjectPublicModule } from '@/modules/project/public/project-public.module';
import { OrganizationPublicModule } from '@/modules/organization/public/organization-public.module';
import { ImportOAuthAvatarOnAccountCreatedListener } from '@/modules/account/application/profile/listeners/import-oauth-avatar-on-account-created.listener';

@Module({
  imports: [
    forwardRef(() => AuthPublicModule),
    AccountReadRepositoriesModule,
    MediaPublicModule,
    ArticlePublicModule,
    QAndAPublicModule,
    ExternalResourcePublicModule,
    JobPublicModule,
    ProjectPublicModule,
    OrganizationPublicModule,
  ],
  controllers: [AccountController, ProfilesController, MePreferencesController, AccountAdminController],
  providers: [
    { provide: EmailAvailabilityQueryRepository, useClass: DrizzleEmailAvailabilityQueryRepository },
    { provide: AccountRepository, useClass: DrizzleAccountRepository },
    { provide: AccountWriteRepository, useExisting: AccountRepository },
    { provide: AccountEmailRepository, useClass: DrizzleAccountEmailRepository },
    { provide: AccountEmailQueryRepository, useExisting: AccountEmailRepository },
    { provide: AccountQueryRepository, useClass: DrizzleAccountQueryRepository },
    { provide: RoleRepository, useClass: DrizzleRoleRepository },
    { provide: AccountListQueryRepository, useClass: DrizzleAccountListQueryRepository },
    { provide: ProfileRepository, useClass: DrizzleProfileRepository },
    { provide: PreferencesRepository, useClass: DrizzlePreferencesRepository },
    { provide: PreferencesQueryRepository, useClass: DrizzlePreferencesQueryRepository },
    CheckEmailAvailabilityQuery,
    CheckUsernameAvailabilityQuery,
    GetAccountAuthenticationViewQuery,
    GetMyAccountQuery,
    GetMyAccountShellQuery,
    CreateAccountCommand,
    RestoreDeletedAccountCommand,
    CancelAccountDeletionCommand,
    DeactivateAccountCommand,
    ReactivateAccountCommand,
    RequestAccountDeletionCommand,
    PurgeDeletedAccountsCommand,
    SuspendAccountCommand,
    UnsuspendAccountCommand,
    BanAccountCommand,
    UnbanAccountCommand,
    AssignAccountRolesCommand,
    ListAccountsQuery,
    GetAccountByIdQuery,
    CreateDefaultProfileCommand,
    GetMyProfileQuery,
    GetProfileByUsernameQuery,
    UpdateMyProfileCommand,
    CreateDefaultPreferencesCommand,
    GetMyPreferencesQuery,
    UpdateMyPreferencesCommand,
    ImportOAuthAvatarOnAccountCreatedListener,
    AccountService,
    AccountAdminService,
    { provide: ACCOUNT_SERVICE, useExisting: AccountService },
    { provide: ACCOUNT_ADMIN_SERVICE, useExisting: AccountAdminService },
    { provide: AccountAdminServicePort, useExisting: AccountAdminService },
  ],
  exports: [
    ACCOUNT_SERVICE,
    AccountService,
    AccountRepository,
    AccountEmailRepository,
    AccountEmailQueryRepository,
    AccountQueryRepository,
    SuspendAccountCommand,
    UnsuspendAccountCommand,
    BanAccountCommand,
    UnbanAccountCommand,
    AssignAccountRolesCommand,
    ListAccountsQuery,
    ACCOUNT_ADMIN_SERVICE,
    AccountAdminServicePort,
    PurgeDeletedAccountsCommand,
  ],
})
export class AccountModule {}
