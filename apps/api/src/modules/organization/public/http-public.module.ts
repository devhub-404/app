import { Module } from '@nestjs/common';
import { OrganizationModule } from '../organization.module';

@Module({ imports: [OrganizationModule], exports: [OrganizationModule] })
export class OrganizationHttpPublicModule {}
