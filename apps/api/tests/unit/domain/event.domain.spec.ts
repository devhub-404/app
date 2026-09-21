import { describe, expect, it } from 'vitest';
import { Event, EventFormat, EventStatus, EventTemporalState } from '@/modules/event/domain/event';
import { EventSuggestion } from '@/modules/event/domain/event-suggestion';

const baseEvent = () => ({
  title: 'Dev tools meetup',
  slug: 'dev-tools-meetup',
  description: 'A sufficiently detailed event description.',
  coverMediaId: null,
  url: 'https://example.com/event/#tracking',
  startsAt: '2030-01-01T10:00:00.000Z',
  endsAt: '2030-01-01T12:00:00.000Z',
  format: EventFormat.Online,
  location: null,
});

describe('Event domain', () => {
  it('validates chronology and stores canonical URL in url', () => {
    expect(() => Event.create('event-1', { ...baseEvent(), startsAt: '2030-01-01T13:00:00.000Z' })).toThrow(
      'EVENT_INVALID_DATES',
    );
    const event = Event.create('event-1', baseEvent());
    expect(event.value.url).toBe('https://example.com/event');
    expect(event.value.status).toBe(EventStatus.Draft);
  });
  it('derives temporal state only after publication', () => {
    const event = Event.create('event-1', baseEvent());
    expect(event.temporalState(new Date('2030-01-01T11:00:00.000Z'))).toBeNull();
    event.publish(new Date('2029-12-01T00:00:00.000Z').toISOString());
    expect(event.temporalState(new Date('2029-12-31T00:00:00.000Z'))).toBe(EventTemporalState.Upcoming);
    expect(event.temporalState(new Date('2030-01-01T11:00:00.000Z'))).toBe(EventTemporalState.Ongoing);
    expect(event.temporalState(new Date('2030-01-01T13:00:00.000Z'))).toBe(EventTemporalState.Ended);
  });
  it('EVT-RN-008 — has no Organization publisher or public Account author in the Event aggregate', () => {
    const event = Event.create('event-1', baseEvent());
    expect(event.value).not.toHaveProperty('organizationId');
    expect(event.value).not.toHaveProperty('publisherOrganizationId');
    expect(event.value).not.toHaveProperty('authorAccountId');
  });
  it('applies draft -> published -> archived lifecycle', () => {
    const event = Event.create('event-1', baseEvent());
    event.publish('2029-01-01T00:00:00.000Z');
    event.archive('2029-01-02T00:00:00.000Z');
    expect(event.value.status).toBe(EventStatus.Archived);
  });
  it('EVT-RN-006 — preserves the stable slug during updates', () => {
    const event = Event.create('event-1', baseEvent());
    event.update({ title: 'Updated meetup' });
    expect(event.value.slug).toBe('dev-tools-meetup');
  });
});

describe('EventSuggestion domain', () => {
  it('stores canonical URL and preserves its own pending workflow', () => {
    const suggestion = EventSuggestion.create(
      'suggestion-1',
      'https://example.com/event/#x',
      'account-1',
      new Date('2029-01-01T00:00:00.000Z'),
    );
    expect(suggestion.snapshot()).toMatchObject({
      url: 'https://example.com/event',
      status: 'pending',
      acceptedEventId: null,
      decidedAt: null,
    });
  });
  it('EVT-RN-009 — rehydrates Suggestion after submitter purge without losing provenance record', () => {
    const suggestion = EventSuggestion.rehydrate({
      id: 'suggestion-1',
      url: 'https://example.com/event',
      submittedByAccountId: null,
      status: 'pending',
      acceptedEventId: null,
      decidedByAccountId: null,
      decisionNote: null,
      createdAt: '2029-01-01T00:00:00.000Z',
      decidedAt: null,
    });
    expect(suggestion.snapshot()).toMatchObject({ submittedByAccountId: null, status: 'pending' });
  });
  it('accepts once and links resulting Event', () => {
    const suggestion = EventSuggestion.create('suggestion-1', 'https://example.com/event', 'account-1');
    suggestion.accept('event-1', 'curator-1', new Date('2029-01-02T00:00:00.000Z'));
    expect(suggestion.snapshot()).toMatchObject({
      status: 'accepted',
      acceptedEventId: 'event-1',
      decidedByAccountId: 'curator-1',
    });
    expect(() => suggestion.reject('curator-1')).toThrow('EVENT_SUGGESTION_INVALID_STATUS');
  });
});
