# Event

Status: current

## Purpose

Represent events published by the platform with enough information for
external participation, without managing registration, tickets, payment, or
attendance.

## Business rules

- A suggestion and an event are distinct entities. Rejecting a suggestion does
  not create an event; accepting one records the event associated with the
  decision.
- A suggestion follows `PENDING -> ACCEPTED | REJECTED`, and the decision is
  terminal.
- An event follows `DRAFT -> PUBLISHED -> ARCHIVED`; deletion is terminal.
- `ONLINE` has no location; `IN_PERSON` requires a location; `HYBRID` requires
  a location. Every event has a canonical official URL.
- `startsAt` must precede `endsAt`. Temporal status (`UPCOMING`, `ONGOING`,
  `ENDED`) is derived from dates and does not replace the editorial lifecycle.
- Publishing is not allowed for an event that has already ended.
- Slug and URL are canonical and stable according to their contracts.
- An event has no publishing organization or public community authorship.
- The suggestion sender is only the proposal source and may be anonymized
  during account purge without removing the accepted event.

## Capabilities

- List and view public events by slug.
- Suggest an event and view one's own suggestions.
- Review pending suggestions, accepting or rejecting them.
- Create, edit, publish, archive, unarchive, and delete an event according to
  editorial or administrative authority.
- Query derived temporal status.
