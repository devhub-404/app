import { Injectable } from '@nestjs/common';
import { JobSuggestionRepository } from '@/modules/job/application/ports/repositories/job-suggestion.repository';
@Injectable()
export class ListMyJobSuggestionsQuery {
  constructor(private readonly r: JobSuggestionRepository) {}
  async execute(accountId: string) {
    return (await this.r.listBySubmitter(accountId)).map((s) => s.snapshot());
  }
}
