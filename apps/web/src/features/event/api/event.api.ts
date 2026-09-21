import { privateClient } from '@/shared/api';
import { publicClient } from '@/shared/api';
import type { ApiClient, ApiResult } from '@/shared/api';
import type {
  CreateEventDTO,
  Event,
  ListEventsQuery,
  SubmitEventSuggestionDTO,
  ReviewEventDTO,
  UpdateEventDTO,
  AcceptEventSuggestionDTO,
  RejectEventDTO,
} from '@/features/event/types/event.type.ts';

export class EventsApi {
  static create(body: CreateEventDTO) {
    return privateClient.POST('/api/v1/events', { body });
  }
  static submitSuggestion(body: SubmitEventSuggestionDTO) {
    return privateClient.POST('/api/v1/events/suggestions', {
      body,
    });
  }
  static list(
    query?: ListEventsQuery,
    client: ApiClient = publicClient,
  ): Promise<ApiResult<{ items: Event[]; page: number; pageSize: number; total: number }>> {
    return client.GET('/api/v1/events', { params: { query } }) as Promise<
      ApiResult<{
        items: Event[];
        page: number;
        pageSize: number;
        total: number;
      }>
    >;
  }
  static get(slug: string, client: ApiClient = publicClient): Promise<ApiResult<Event>> {
    return client.GET('/api/v1/events/{slug}', {
      params: { path: { slug } },
    }) as Promise<ApiResult<Event>>;
  }
  static getById(id: string): Promise<ApiResult<Event>> {
    return privateClient.GET('/api/v1/events/id/{id}', { params: { path: { id } } }) as Promise<ApiResult<Event>>;
  }
  static update(id: string, body: UpdateEventDTO) {
    return privateClient.PATCH('/api/v1/events/{id}', { params: { path: { id } }, body });
  }
  static delete(id: string) {
    return privateClient.DELETE('/api/v1/events/{id}', { params: { path: { id } } });
  }
  static listMine() {
    return privateClient.GET('/api/v1/events/suggestions/me');
  }
  static listPendingSuggestions() {
    return privateClient.GET('/api/v1/events/suggestions/pending');
  }
  static acceptSuggestion(id: string, body: AcceptEventSuggestionDTO) {
    return privateClient.POST('/api/v1/events/suggestions/{id}/accept', {
      params: { path: { id } },
      body,
    });
  }
  static rejectSuggestion(id: string, body: RejectEventDTO) {
    return privateClient.POST('/api/v1/events/suggestions/{id}/reject', {
      params: { path: { id } },
      body,
    });
  }
  static listForManagement(
    query?: ListEventsQuery,
  ): Promise<ApiResult<{ items: Event[]; page: number; pageSize: number; total: number }>> {
    return privateClient.GET('/api/v1/events/administration', {
      params: { query },
    }) as Promise<
      ApiResult<{
        items: Event[];
        page: number;
        pageSize: number;
        total: number;
      }>
    >;
  }
  static review(id: string, body: ReviewEventDTO) {
    return privateClient.PATCH('/api/v1/events/{id}/status', {
      params: { path: { id } },
      body,
    });
  }
}
