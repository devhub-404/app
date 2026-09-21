import { ApiProperty } from '@nestjs/swagger';
import {
  PLATFORM_ROLE_NAMES,
  type AccountRoleName,
} from '@/modules/account/application/admin/types/account-role-name.type';

export class AccountRoleAssignmentResultDTO {
  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: PLATFORM_ROLE_NAMES, nullable: true })
  role!: AccountRoleName | null;
}
