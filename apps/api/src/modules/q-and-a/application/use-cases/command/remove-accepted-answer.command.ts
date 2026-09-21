import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { QAndARepository } from '@/modules/q-and-a/application/ports/repositories';

@Injectable()
export class RemoveAcceptedAnswerCommand {
  constructor(private readonly repository: QAndARepository) {}

  async execute(authorAccountId: string, questionId: string) {
    const result = await this.repository.removeAcceptedAnswer(questionId, authorAccountId);
    if (!result) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');

    return result;
  }
}
