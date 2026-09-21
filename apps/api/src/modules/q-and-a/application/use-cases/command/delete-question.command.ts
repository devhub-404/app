import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { hasRole, Role } from '@/shared/kernel/auth/role';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { QAndARepository } from '@/modules/q-and-a/application/ports/repositories';

@Injectable()
export class DeleteQuestionCommand {
  constructor(private readonly repository: QAndARepository) {}
  async execute(user: User, questionId: string) {
    if (!(await this.repository.deleteQuestion(questionId, user.sub, hasRole(user.role, Role.ADMIN))))
      throw new AppError('CONTENT_NOT_FOUND');
  }
}
