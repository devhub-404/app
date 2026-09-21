import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { Role } from '@/shared/kernel/auth/role';

export class AuthenticatedPrincipal {
  @IsUUID()
  sub!: string;

  @IsUUID()
  sid!: string;

  @IsIn(['session'])
  type!: 'session';

  @IsOptional()
  @IsIn(Object.values(Role))
  role!: Role | null;
}
