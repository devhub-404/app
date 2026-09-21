import { Injectable } from '@nestjs/common';
import { FeedbackRepository } from '../../ports/feedback.repository';
import type { ListFeedbackDTO } from '../../dtos';

@Injectable()
export class ListFeedbackForTriageQuery {
  constructor(private readonly feedback: FeedbackRepository) {}

  execute(query: ListFeedbackDTO) {
    return this.feedback.listForAdministration(query);
  }
}
