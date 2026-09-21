import { Injectable } from '@nestjs/common';
import { JobSuggestionRepository } from '@/modules/job/application/ports/repositories/job-suggestion.repository';
@Injectable()
export class ListPendingJobSuggestionsQuery {
  constructor(private readonly r: JobSuggestionRepository) {}
  async execute() {
    return (await this.r.listPending()).map((s) => s.snapshot());
  }
}
