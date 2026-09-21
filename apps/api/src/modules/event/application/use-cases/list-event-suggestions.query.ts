import { Injectable } from '@nestjs/common';
import { EventSuggestionRepository } from '../ports/event-suggestion.repository';

@Injectable()
export class ListMyEventSuggestionsQuery {
  constructor(private readonly suggestions: EventSuggestionRepository) {}
  async execute(accountId: string) {
    return (await this.suggestions.listBySubmitter(accountId)).map((s) => s.snapshot());
  }
}

@Injectable()
export class ListPendingEventSuggestionsQuery {
  constructor(private readonly suggestions: EventSuggestionRepository) {}
  async execute() {
    return (await this.suggestions.listPending()).map((s) => s.snapshot());
  }
}
