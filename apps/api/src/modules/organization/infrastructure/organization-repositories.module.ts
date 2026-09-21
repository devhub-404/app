import { Module } from '@nestjs/common';
import { AccountProfileReadModule } from '@/modules/account/public/account-profile-read.module';
import { OrganizationRepository } from '../application/ports/organization.repository';
import { OrganizationQueryRepository } from '../application/ports/organization.query.repository';
import { DrizzleOrganizationRepository } from './repositories/organization.repository';

@Module({
  imports: [AccountProfileReadModule],
  providers: [
    { provide: OrganizationRepository, useClass: DrizzleOrganizationRepository },
    { provide: OrganizationQueryRepository, useExisting: OrganizationRepository },
  ],
  exports: [OrganizationRepository, OrganizationQueryRepository],
})
export class OrganizationRepositoriesModule {}
