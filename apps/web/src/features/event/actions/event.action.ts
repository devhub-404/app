import { EventsApi } from '@/features/event/api/event.api.ts';
import type { Event, EventSuggestionView, ListEventsQuery } from '@/features/event/types/event.type.ts';
import { isClientAccessAllowed } from '@/features/auth/public/access';
import {
  canDeleteEvent,
  canEditEvent,
  canReviewEventSuggestions,
  canViewEventManagement,
} from '@/features/event/access/event.access.ts';
import type { Actor } from '@/features/auth/public/access';
import type { ApiClient } from '@/shared/api';
import { notifyError, notifySuccess } from '@/shared/ui/feedback/notifications';

const canUse = (predicate: (actor: Actor) => boolean) => isClientAccessAllowed(predicate);

export type EventMutationResult = { kind: 'success'; code?: string } | { kind: 'failure'; code?: string };

function responseCode(data: unknown): string | undefined {
  return typeof data === 'object' && data !== null && 'code' in data && typeof data.code === 'string'
    ? data.code
    : undefined;
}

async function mutationResult(
  request: () => Promise<{ data?: unknown; error?: { code?: string } }>,
): Promise<EventMutationResult> {
  try {
    const { data, error } = await request();
    if (error) {
      notifyError(error.code);
      return { kind: 'failure', code: error.code };
    }
    const code = responseCode(data);
    notifySuccess(code);
    return { kind: 'success', code };
  } catch {
    notifyError('NETWORK_REQUEST_FAILED');
    return { kind: 'failure', code: 'NETWORK_REQUEST_FAILED' };
  }
}

function normalizeEventSuggestions(input: unknown): EventSuggestionView[] {
  const payload = input && typeof input === 'object' && 'data' in input ? (input as { data?: unknown }).data : input;
  const source = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: unknown[] }).items
      : [];
  return source.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const value = entry as Record<string, unknown>;
    const id = typeof value['id'] === 'string' ? value['id'] : null;
    const url = typeof value['url'] === 'string' ? value['url'] : null;
    if (!id || !url) return [];
    return [
      {
        id,
        url,
        status: typeof value['status'] === 'string' ? value['status'] : 'pending',
        createdAt: typeof value['createdAt'] === 'string' ? value['createdAt'] : '',
        submittedByAccountId: typeof value['submittedByAccountId'] === 'string' ? value['submittedByAccountId'] : null,
      },
    ];
  });
}

function pageResult<T>(
  data: { data?: { items: T[]; page?: number; pageSize?: number; total?: number } } | undefined,
  error: unknown,
) {
  return {
    items: data?.data?.items ?? [],
    page: data?.data?.page ?? 1,
    pageSize: data?.data?.pageSize ?? 0,
    total: data?.data?.total ?? 0,
    error,
  };
}

export function submitEventSuggestion(payload: Parameters<typeof EventsApi.submitSuggestion>[0]) {
  return mutationResult(() => EventsApi.submitSuggestion(payload));
}

export function createEvent(payload: Parameters<typeof EventsApi.create>[0]): Promise<EventMutationResult> {
  if (!canUse((actor) => canEditEvent(actor)))
    return Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' });
  return mutationResult(() => EventsApi.create(payload));
}

export async function listEventsQuery(query: ListEventsQuery = {}, client?: ApiClient) {
  const { data, error } = await EventsApi.list(query, client);
  return pageResult(data, error);
}

export async function getEventQuery(slug: string, client?: ApiClient) {
  const { data, error, response } = await EventsApi.get(slug, client);
  return { item: data?.data ?? null, error, response };
}

export async function listMyEventSuggestionsQuery() {
  const { data, error } = await EventsApi.listMine();
  return { items: normalizeEventSuggestions((data as { data?: unknown } | undefined)?.data), error };
}

export async function listPendingEventSuggestionsQuery() {
  if (!canUse(canReviewEventSuggestions)) return { items: [], error: { code: 'AUTHORIZATION_REQUIRED' } };
  const { data, error } = await EventsApi.listPendingSuggestions();
  return { items: normalizeEventSuggestions((data as { data?: unknown } | undefined)?.data), error };
}

export function acceptEventSuggestion(id: string, body: Parameters<typeof EventsApi.acceptSuggestion>[1]) {
  if (!canUse(canReviewEventSuggestions))
    return Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' } as EventMutationResult);
  return mutationResult(() => EventsApi.acceptSuggestion(id, body));
}

export function rejectEventSuggestion(id: string, reason: string) {
  if (!canUse(canReviewEventSuggestions))
    return Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' } as EventMutationResult);
  return mutationResult(() => EventsApi.rejectSuggestion(id, { reason }));
}

export async function listEventsManagementQuery(query: ListEventsQuery = {}) {
  if (!canUse(canViewEventManagement)) return pageResult<Event>(undefined, { code: 'AUTHORIZATION_REQUIRED' });
  const { data, error } = await EventsApi.listForManagement(query);
  return pageResult(data, error);
}
export function reviewEvent(id: string, body: Parameters<typeof EventsApi.review>[1]) {
  if (!canUse(canReviewEventSuggestions))
    return Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' } as EventMutationResult);
  return mutationResult(() => EventsApi.review(id, body));
}

export function updateEvent(id: string, body: Parameters<typeof EventsApi.update>[1]): Promise<EventMutationResult> {
  if (!canUse((actor) => canEditEvent(actor)))
    return Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' });
  return mutationResult(() => EventsApi.update(id, body));
}

export function deleteEvent(id: string): Promise<EventMutationResult> {
  if (!canUse(canDeleteEvent)) return Promise.resolve({ kind: 'failure', code: 'AUTHORIZATION_REQUIRED' });
  return mutationResult(() => EventsApi.delete(id));
}
