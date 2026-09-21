import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsUUID } from 'class-validator';
import { ORGANIZATION_ROLES, type OrganizationRole } from './organization.constants';

export class AddOrganizationMemberDTO {
  @ApiProperty() @IsUUID() accountId!: string;
  @ApiProperty({ enum: ORGANIZATION_ROLES }) @IsIn(ORGANIZATION_ROLES) role!: OrganizationRole;
}
