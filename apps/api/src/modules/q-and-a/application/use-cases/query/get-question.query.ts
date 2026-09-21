import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { QAndAQueryRepository } from '@/modules/q-and-a/application/ports/repositories';
import type { QuestionDTO } from '../../dtos';
import type { QAndAViewer } from '../../ports/repositories/q-and-a.repository';

@Injectable()
export class GetQuestionQuery {
  constructor(private readonly repository: QAndAQueryRepository) {}

  async execute(id: string, viewer?: QAndAViewer): Promise<QuestionDTO> {
    const question = await this.repository.findQuestion(id, viewer);
    if (!question) throw new AppError('CONTENT_NOT_FOUND');

    return question;
  }
}
