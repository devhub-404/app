import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { QAndARepository } from '@/modules/q-and-a/application/ports/repositories';

@Injectable()
export class AcceptAnswerCommand {
  constructor(private readonly repository: QAndARepository) {}

  async execute(authorAccountId: string, questionId: string, answerId: string) {
    const result = await this.repository.acceptAnswer(questionId, authorAccountId, answerId);
    if (!result) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

    return result;
  }
}
