import type { components, paths } from '@devhub-404/api-contract';

export type Event = components['schemas']['EventDTO'];
export type SubmitEventSuggestionDTO = components['schemas']['SubmitEventSuggestionDTO'];
export type AcceptEventSuggestionDTO = components['schemas']['AcceptEventSuggestionDTO'];
export type RejectEventDTO = components['schemas']['RejectEventDTO'];
export type ReviewEventDTO = components['schemas']['ReviewEventDTO'];
export type CreateEventDTO = components['schemas']['CreateEventDTO'];
export type UpdateEventDTO = components['schemas']['UpdateEventDTO'];
export type ListEventsQuery = NonNullable<paths['/api/v1/events']['get']['parameters']['query']>;

export type EventSuggestionView = {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  submittedByAccountId?: string | null;
};
