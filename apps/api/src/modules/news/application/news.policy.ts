import { Injectable } from '@nestjs/common';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { hasEditorialAuthority, hasRole, Role } from '@/shared/kernel/auth/role';
import { AppError } from '@/shared/errors/app-error';

@Injectable()
export class NewsPolicy {
  canManage(user: User): void {
    if (!hasEditorialAuthority(user.role)) {
      throw new AppError('FORBIDDEN');
    }
  }

  canDelete(user: User): void {
    if (!hasRole(user.role, Role.ADMIN)) {
      throw new AppError('FORBIDDEN');
    }
  }
}
