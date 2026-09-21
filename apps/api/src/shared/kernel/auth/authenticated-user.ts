import { Role } from '@/shared/kernel/auth/role';

export interface User {
  sub: string;
  role: Role | null;
}
