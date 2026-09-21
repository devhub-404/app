import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { EventSuggestionRepository } from '../ports/event-suggestion.repository';
import { EventRepository } from '../ports/event.repository';
import { EventCreationService } from '../services/event-creation.service';
import type { AcceptEventSuggestionDTO, RejectEventDTO } from '../dtos';

@Injectable()
export class AcceptEventSuggestionCommand {
  constructor(
    private readonly suggestions: EventSuggestionRepository,
    private readonly events: EventRepository,
    private readonly creation: EventCreationService,
  ) {}

  execute(id: string, reviewerId: string, input: AcceptEventSuggestionDTO) {
    return this.events.transaction(async (context) => {
      const suggestion = await this.suggestions.findById(id, context);
      if (!suggestion) throw new AppError('CONTENT_NOT_FOUND');
      const expected = suggestion.snapshot().status;
      if (expected !== 'pending') throw new AppError('CONTENT_INTERACTION_NOT_ALLOWED');
      const event = await this.creation.create(input, context);
      suggestion.accept(event.id, reviewerId);
      if (!(await this.suggestions.save(suggestion, expected, context))) throw new AppError('CONTENT_UPDATE_CONFLICT');

      return suggestion.snapshot();
    });
  }
}

@Injectable()
export class RejectEventSuggestionCommand {
  constructor(private readonly suggestions: EventSuggestionRepository) {}
  async execute(id: string, reviewerId: string, input: RejectEventDTO) {
    const suggestion = await this.suggestions.findById(id);
    if (!suggestion) throw new AppError('CONTENT_NOT_FOUND');
    const expected = suggestion.snapshot().status;
    suggestion.reject(reviewerId, input.reason);
    if (!(await this.suggestions.save(suggestion, expected))) throw new AppError('CONTENT_UPDATE_CONFLICT');

    return suggestion.snapshot();
  }
}
