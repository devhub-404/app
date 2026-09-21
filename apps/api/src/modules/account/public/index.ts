export { AccountService } from '@/modules/account/public/account.service';
export { AccountServicePort, ACCOUNT_SERVICE } from '@/modules/account/public/account.service.port';
export { AccountAdminService } from '@/modules/account/public/account-admin.service';
export { AccountAdminServicePort, ACCOUNT_ADMIN_SERVICE } from '@/modules/account/public/account-admin.service.port';
export { PLATFORM_ROLE_NAMES } from '@/modules/account/public/account-admin.service.port';
export {
  AssignAccountRolesDTO,
  SuspendAccountDTO,
  ListAccountsQueryDTO,
} from '@/modules/account/public/account-admin.dto';
export {
  AccountUsernameAvailabilityDTO,
  AccountUsernameAvailabilityQueryDTO,
} from '@/modules/account/public/username-availability.dto';
export {
  AccountAccessPort,
  AccountEmailAccessPort,
  AccountUserQueryPort,
} from '@/modules/account/public/account-access.ports';
export { AUTH_RESPONSES, SESSION_RESPONSES, USER_RESPONSES } from '@/modules/account/presentation/responses';

export { AccountPublicModule } from './account-public.module';
export { AccountProfileReadPort } from './account-profile-read.port';
export type { AccountProfileSummary } from './account-profile-read.port';
export { AccountProfileSummaryDTO } from './account-profile-summary.dto';
export { PurgeDeletedAccountsCommand } from '@/modules/account/application/account/use-cases/command/purge-deleted-accounts.command';

export * from './account-admin-dtos';

export { AccountProfileReadModule } from './account-profile-read.module';
export { AuthorDTO } from './author.dto';
export { canonicalizeEmailAddress } from '@/modules/account/application/shared/email-address';
export * from './account-eligibility.port';
export * from './account-eligibility.module';
