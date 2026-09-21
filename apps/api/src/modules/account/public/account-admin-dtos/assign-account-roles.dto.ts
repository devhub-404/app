import { IsIn } from 'class-validator';
import { PLATFORM_ROLE_NAMES, type AccountRoleName } from '@/modules/account/public/account-admin.service.port';
import { ApiProperty } from '@nestjs/swagger';

export class AssignAccountRolesDTO {
  @ApiProperty({ enum: PLATFORM_ROLE_NAMES, nullable: true })
  @IsIn([...PLATFORM_ROLE_NAMES, null])
  role!: AccountRoleName | null;
}
