import { Injectable } from '@nestjs/common';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { AppError } from '@/shared/errors/app-error';
import { hasRole, Role } from '@/shared/kernel/auth/role';
import type { ArticleDetailReadModel } from '@/modules/article/application/ports/repositories/article.query.repository';
import type { ArticleContentReadModel } from '@/modules/article/application/ports/repositories/article.query.repository';

@Injectable()
export class ArticlePolicy {
  canUpdate(user: User, authorId: string): void {
    if (user.sub !== authorId) throw new AppError('FORBIDDEN');
  }

  canDelete(user: User, authorId: string): void {
    if (user.sub !== authorId && !hasRole(user.role, Role.ADMIN)) throw new AppError('FORBIDDEN');
  }

  canRead(user: User, article: ArticleDetailReadModel): void {
    const isPublic = article.status === 'published' && article.hiddenAt === null && article.deletedAt === null;
    const isModerator = hasRole(user.role, Role.MODERATOR) || hasRole(user.role, Role.ADMIN);
    const isOwner = article.authorId === user.sub;

    if (!isPublic && !isOwner && !isModerator) throw new AppError('FORBIDDEN');
  }

  canReadContent(user: User, article: ArticleContentReadModel): void {
    const isPublic = article.status === 'published' && article.hiddenAt === null && article.deletedAt === null;
    const isPrivileged = hasRole(user.role, Role.MODERATOR) || hasRole(user.role, Role.ADMIN);
    const isOwner = article.authorId === user.sub;

    if (!isPublic && !isOwner && !isPrivileged) throw new AppError('FORBIDDEN');
  }
}
