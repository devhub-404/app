import { Injectable } from '@nestjs/common';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { hasEditorialAuthority, hasRole, Role } from '@/shared/kernel/auth/role';
import { AppError } from '@/shared/errors/app-error';

@Injectable()
export class ExternalResourcePolicy {
  canCreate(user: User): void {
    if (hasEditorialAuthority(user.role)) return;

    throw new AppError('FORBIDDEN');
  }

  canUpdate(user: User): void {
    if (hasEditorialAuthority(user.role)) return;

    throw new AppError('FORBIDDEN');
  }

  canDelete(user: User): void {
    if (hasRole(user.role, Role.ADMIN)) return;

    throw new AppError('FORBIDDEN');
  }

  canArchive(user: User): void {
    if (hasEditorialAuthority(user.role)) return;

    throw new AppError('FORBIDDEN');
  }

  canRestore(user: User): void {
    if (hasEditorialAuthority(user.role)) return;

    throw new AppError('FORBIDDEN');
  }

  canReview(user: User): void {
    if (hasEditorialAuthority(user.role)) return;

    throw new AppError('FORBIDDEN');
  }
}
