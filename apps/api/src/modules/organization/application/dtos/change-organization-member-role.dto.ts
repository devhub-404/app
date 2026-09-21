import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ORGANIZATION_ROLES, type OrganizationRole } from './organization.constants';

export class ChangeOrganizationMemberRoleDTO {
  @ApiProperty({ enum: ORGANIZATION_ROLES }) @IsIn(ORGANIZATION_ROLES) role!: OrganizationRole;
}
