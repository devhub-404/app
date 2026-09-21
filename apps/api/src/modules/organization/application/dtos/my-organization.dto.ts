import { ApiProperty } from '@nestjs/swagger';
import { ORGANIZATION_ROLES, type OrganizationRole } from './organization.constants';
import { OrganizationDTO } from './organization.dto';

/** Organization accompanied by the authenticated account's membership projection. */
export class MyOrganizationDTO extends OrganizationDTO {
  @ApiProperty({ enum: ORGANIZATION_ROLES }) membershipRole!: OrganizationRole;
}
