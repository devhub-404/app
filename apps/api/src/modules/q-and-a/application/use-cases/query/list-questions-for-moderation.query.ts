import { Injectable } from '@nestjs/common';
import { ListQuestionsQuery } from './list-questions.query';
import type { ListQuestionsDTO } from '../../dtos';

@Injectable()
export class ListQuestionsForModerationQuery {
  constructor(private readonly listQuestions: ListQuestionsQuery) {}
  execute(input: ListQuestionsDTO) {
    return this.listQuestions.execute(input);
  }
}
