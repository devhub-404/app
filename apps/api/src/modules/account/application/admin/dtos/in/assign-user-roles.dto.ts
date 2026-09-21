import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  PLATFORM_ROLE_NAMES,
  type AccountRoleName,
} from '@/modules/account/application/admin/types/account-role-name.type';

export class AssignUserRolesDTO {
  @ApiProperty({ enum: [...PLATFORM_ROLE_NAMES, null] })
  @IsIn([...PLATFORM_ROLE_NAMES, null])
  role!: AccountRoleName | null;
}
