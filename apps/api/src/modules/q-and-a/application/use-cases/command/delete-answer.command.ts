import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { hasRole, Role } from '@/shared/kernel/auth/role';
import type { User } from '@/shared/kernel/auth/authenticated-user';
import { QAndARepository } from '@/modules/q-and-a/application/ports/repositories';

@Injectable()
export class DeleteAnswerCommand {
  constructor(private readonly repository: QAndARepository) {}
  async execute(user: User, questionId: string, answerId: string) {
    if (!(await this.repository.deleteAnswer(questionId, answerId, user.sub, hasRole(user.role, Role.ADMIN))))
      throw new AppError('CONTENT_NOT_FOUND');
  }
}
