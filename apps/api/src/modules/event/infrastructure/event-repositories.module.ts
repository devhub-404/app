import { Module } from '@nestjs/common';
import { EventRepository } from '../application/ports/event.repository';
import { EventSuggestionRepository } from '../application/ports/event-suggestion.repository';
import { DrizzleEventSuggestionRepository } from './repositories/event-suggestion.repository';
import { DrizzleEventRepository } from './repositories/event.repository';

@Module({
  providers: [
    { provide: EventRepository, useClass: DrizzleEventRepository },
    { provide: EventSuggestionRepository, useClass: DrizzleEventSuggestionRepository },
  ],
  exports: [EventRepository, EventSuggestionRepository],
})
export class EventRepositoriesModule {}
