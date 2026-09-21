import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AppError } from '@/shared/errors/app-error';
import { EventSuggestion } from '@/modules/event/domain/event-suggestion';
import { EventSuggestionRepository } from '../ports/event-suggestion.repository';
import type { SubmitEventSuggestionDTO } from '../dtos';

@Injectable()
export class SubmitEventSuggestionCommand {
  constructor(private readonly suggestions: EventSuggestionRepository) {}
  async execute(accountId: string, input: SubmitEventSuggestionDTO) {
    const suggestion = EventSuggestion.create(randomUUID(), input.url, accountId);
    if (await this.suggestions.hasPendingUrl(suggestion.snapshot().url)) throw new AppError('EVENT_ALREADY_EXISTS');
    await this.suggestions.create(suggestion);

    return suggestion.snapshot();
  }
}
