import { ApiProperty } from '@nestjs/swagger';
import { ORGANIZATION_ROLES, type OrganizationRole } from './organization.constants';

export class OrganizationMembershipDTO {
  @ApiProperty() organizationId!: string;
  @ApiProperty() accountId!: string;
  @ApiProperty({ enum: ORGANIZATION_ROLES }) role!: OrganizationRole;
  @ApiProperty({ type: String, nullable: true }) username!: string | null;
  @ApiProperty({ type: String, nullable: true }) displayName!: string | null;
  @ApiProperty({ type: String, nullable: true }) avatarUrl!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
}
