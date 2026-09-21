import { forwardRef, Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { AccountEligibilityModule } from '@/modules/account/public/account-eligibility.module';
import { OrganizationRepositoriesModule } from './infrastructure/organization-repositories.module';
import { OrganizationPublicModule } from './public/organization-public.module';
import { OrganizationController } from './presentation/organization.controller';
import {
  AddOrganizationMemberCommand,
  ArchiveOrganizationCommand,
  ChangeOrganizationMemberRoleCommand,
  CreateOrganizationCommand,
  DeleteOrganizationCommand,
  LeaveOrganizationCommand,
  RemoveOrganizationMemberCommand,
  UnarchiveOrganizationCommand,
  UpdateOrganizationCommand,
} from './application/use-cases/command';
import {
  GetOrganizationBySlugQuery,
  ListMyOrganizationsQuery,
  ListOrganizationMembersQuery,
  ListOrganizationsQuery,
} from './application/use-cases/query';

@Module({
  imports: [
    AccountEligibilityModule,
    OrganizationRepositoriesModule,
    OrganizationPublicModule,
    forwardRef(() => AuthPublicModule),
  ],
  controllers: [OrganizationController],
  providers: [
    CreateOrganizationCommand,
    DeleteOrganizationCommand,
    UpdateOrganizationCommand,
    ArchiveOrganizationCommand,
    UnarchiveOrganizationCommand,
    AddOrganizationMemberCommand,
    ChangeOrganizationMemberRoleCommand,
    RemoveOrganizationMemberCommand,
    LeaveOrganizationCommand,
    ListOrganizationsQuery,
    GetOrganizationBySlugQuery,
    ListMyOrganizationsQuery,
    ListOrganizationMembersQuery,
  ],
})
export class OrganizationModule {}
