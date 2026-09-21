import { Module } from '@nestjs/common';
import { AuthPublicModule } from '@/modules/auth/public/auth-public.module';
import { EventController } from './presentation/event.controller';
import {
  DeleteEventCommand,
  CreateEventCommand,
  GetEventByIdQuery,
  GetEventBySlugQuery,
  ListEventsForManagementQuery,
  ListEventsQuery,
  UpdateEventCommand,
  ReviewEventCommand,
  SubmitEventSuggestionCommand,
  AcceptEventSuggestionCommand,
  RejectEventSuggestionCommand,
  ListMyEventSuggestionsQuery,
  ListPendingEventSuggestionsQuery,
} from './application/use-cases';
import { EventRepositoriesModule } from './infrastructure/event-repositories.module';
import { EventCreationService } from './application/services/event-creation.service';

@Module({
  imports: [EventRepositoriesModule, AuthPublicModule],
  providers: [
    EventCreationService,
    CreateEventCommand,
    DeleteEventCommand,
    GetEventByIdQuery,
    GetEventBySlugQuery,
    ListEventsForManagementQuery,
    ListEventsQuery,
    UpdateEventCommand,
    ReviewEventCommand,
    SubmitEventSuggestionCommand,
    AcceptEventSuggestionCommand,
    RejectEventSuggestionCommand,
    ListMyEventSuggestionsQuery,
    ListPendingEventSuggestionsQuery,
  ],
  controllers: [EventController],
})
export class EventModule {}
