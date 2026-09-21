import { Injectable } from '@nestjs/common';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { AppError } from '@/shared/errors/app-error';
import { Role } from '@/shared/kernel/auth/role';

@Injectable()
export class CommentsPolicy {
  canUpdateComment(user: User, authorId: string): void {
    if (user.sub !== authorId) throw new AppError('FORBIDDEN');
  }

  canDeleteComment(user: User, authorId: string): void {
    if (user.sub !== authorId) throw new AppError('FORBIDDEN');
  }

  canModerateComment(user: User): void {
    if (user.role !== Role.MODERATOR && user.role !== Role.ADMIN) {
      throw new AppError('FORBIDDEN');
    }
  }
}
