import { Module } from '@nestjs/common';
import { OrganizationRepositoriesModule } from '../infrastructure/organization-repositories.module';
import { OrganizationAccessPort, OrganizationAccessService } from './organization-access.port';
import { OrganizationPublicService, OrganizationPublicServicePort } from './organization-public.service';

@Module({
  imports: [OrganizationRepositoriesModule],
  providers: [
    { provide: OrganizationAccessPort, useClass: OrganizationAccessService },
    { provide: OrganizationPublicServicePort, useClass: OrganizationPublicService },
  ],
  exports: [OrganizationAccessPort, OrganizationPublicServicePort],
})
export class OrganizationPublicModule {}
