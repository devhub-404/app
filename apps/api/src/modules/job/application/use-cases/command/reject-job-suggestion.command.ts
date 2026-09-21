import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { JobSuggestionRepository } from '@/modules/job/application/ports/repositories/job-suggestion.repository';

@Injectable()
export class RejectJobSuggestionCommand {
  constructor(private readonly suggestions: JobSuggestionRepository) {}
  async execute(reviewerId: string, suggestionId: string, note?: string): Promise<void> {
    const suggestion = await this.suggestions.findById(suggestionId);
    if (!suggestion) throw new AppError('CONTENT_NOT_FOUND');
    suggestion.reject(reviewerId, note);
    if (!(await this.suggestions.save(suggestion, 'pending'))) throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
  }
}
