import { ApiProperty } from '@nestjs/swagger';
import type { AccountRoleName } from '../account-admin.service.port';

export class AccountRoleAssignmentDTO {
  @ApiProperty() userId!: string;
  @ApiProperty({ enum: ['curator', 'admin', 'moderator'], nullable: true }) role!: AccountRoleName | null;
}
