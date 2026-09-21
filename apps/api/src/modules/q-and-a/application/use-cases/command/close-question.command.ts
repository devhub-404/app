import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { QAndARepository } from '@/modules/q-and-a/application/ports/repositories';

@Injectable()
export class CloseQuestionCommand {
  constructor(private readonly repository: QAndARepository) {}
  async execute(questionId: string) {
    const result = await this.repository.closeQuestion(questionId);
    if (!result) throw new AppError('CONTENT_NOT_FOUND');

    return result;
  }
}
