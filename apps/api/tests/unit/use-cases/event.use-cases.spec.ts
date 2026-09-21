import { describe, expect, it, vi } from 'vitest';
import { CreateEventCommand } from '@/modules/event/application/use-cases/create-event.command';
import { ReviewEventCommand } from '@/modules/event/application/use-cases/review-event.command';
import { AcceptEventSuggestionCommand } from '@/modules/event/application/use-cases/review-event-suggestion.command';
import { Event, EventFormat, EventStatus } from '@/modules/event/domain/event';
import { EventSuggestion } from '@/modules/event/domain/event-suggestion';

describe('Event commands', () => {
  const input = {
    title: 'Dev tools meetup',
    description: 'A sufficiently detailed event description for the editorial catalog.',
    url: 'https://example.com/event#fragment',
    startsAt: '2030-01-01T10:00:00.000Z',
    endsAt: '2030-01-01T12:00:00.000Z',
    format: 'online' as const,
    location: null,
  };

  it('creates an Event through one owner transaction', async () => {
    const context = { transaction: true };
    const repository = {
      transaction: vi.fn(async (work: (context: unknown) => Promise<unknown>) => work(context)),
    };
    const creation = { create: vi.fn(async () => ({ id: 'event-1', status: EventStatus.Draft })) };

    await expect(new CreateEventCommand(repository as never, creation as never).execute(input)).resolves.toMatchObject({
      id: 'event-1',
      status: EventStatus.Draft,
    });
    expect(creation.create).toHaveBeenCalledWith(input, context);
  });

  it('EVT-RF-004 — Curator publishes a draft Event through the editorial workflow', async () => {
    const event = Event.create('event-1', {
      ...input,
      slug: 'dev-tools-meetup',
      coverMediaId: null,
      location: null,
      format: EventFormat.Online,
    });
    const repository = {
      findAggregateById: vi.fn(async () => event),
      saveAggregate: vi.fn(async () => true),
      getForManagement: vi.fn(async () => ({ id: event.value.id, status: event.value.status })),
    };

    await expect(
      new ReviewEventCommand(repository as never).execute('event-1', { status: 'published' }),
    ).resolves.toMatchObject({
      status: EventStatus.Published,
    });
    expect(event.value.status).toBe(EventStatus.Published);
  });

  it('EVT-RF-003/EVT-RF-004 — Curator accepts a suggestion and creates the Event in the same transaction', async () => {
    const context = { transaction: true };
    const suggestion = EventSuggestion.create('suggestion-1', 'https://example.com/event#fragment', 'account-1');
    const suggestions = {
      findById: vi.fn(async () => suggestion),
      save: vi.fn(async () => true),
    };
    const events = {
      transaction: vi.fn(async (work: (context: unknown) => Promise<unknown>) => work(context)),
    };
    const creation = { create: vi.fn(async () => ({ id: 'event-1', status: EventStatus.Draft })) };

    await expect(
      new AcceptEventSuggestionCommand(suggestions as never, events as never, creation as never).execute(
        'suggestion-1',
        'curator-1',
        input,
      ),
    ).resolves.toMatchObject({ status: 'accepted', acceptedEventId: 'event-1' });

    expect(creation.create).toHaveBeenCalledWith(input, context);
    expect(suggestions.save).toHaveBeenCalledWith(suggestion, 'pending', context);
  });
});
