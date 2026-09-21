import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { Role } from '@/shared/kernel/auth/role';

export class AuthenticatedPrincipalDTO {
  @IsUUID()
  @ApiProperty()
  sub!: string;

  @IsUUID()
  @ApiProperty()
  sid!: string;

  @IsIn(['session'])
  @ApiProperty({ enum: ['session'] })
  type!: 'session';

  @IsOptional()
  @IsIn(Object.values(Role))
  @ApiProperty({ enum: Role, nullable: true })
  role!: Role | null;
}
