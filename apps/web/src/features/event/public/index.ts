export { default as NewEvent } from '../ui/components/new-event.component.tsx';
export { default as EventsPage } from '../ui/pages/events.page.astro';
export { default as EventPage } from '../ui/pages/event.page.astro';
export { default as EventNewPage } from '../ui/pages/event-new.page.astro';
export {
  submitEventSuggestion,
  listEventsQuery,
  getEventQuery,
  listMyEventSuggestionsQuery,
  listPendingEventSuggestionsQuery,
  acceptEventSuggestion,
  rejectEventSuggestion,
  listEventsManagementQuery,
  reviewEvent,
  updateEvent,
  deleteEvent,
} from '@/features/event/actions/event.action.ts';
export type {
  Event,
  SubmitEventSuggestionDTO,
  AcceptEventSuggestionDTO,
  RejectEventDTO,
  ReviewEventDTO,
  CreateEventDTO,
  UpdateEventDTO,
  ListEventsQuery,
  EventSuggestionView,
} from '@/features/event/types/event.type.ts';
export {
  canDeleteEvent,
  canEditEvent,
  canReviewEventSuggestions,
  canViewEventManagement,
} from '../access/event.access.ts';
