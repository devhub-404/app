# Job

Status: current

## Purpose

Connect developers to professional opportunities while distinguishing
institutional publication from community suggestion.

## Business rules

- An institutional job has a publishing organization and requires valid actor
  representation; an editorial job does not acquire an organization merely
  because it was suggested.
- An authenticated person creates a `JobSuggestion`; accepting the suggestion
  creates a published editorial job and the sender does not become its owner.
- A suggestion follows `PENDING -> ACCEPTED | REJECTED`; the decision is
  auditable.
- Jobs use `PUBLISHED`, `CLOSED`, `EXPIRED`, and `WITHDRAWN` states.
  Expiration is evaluated by date and does not depend on scheduled mutation.
- An expired job is not public. A closed, non-expired job may remain available
  as history; withdrawn jobs are not public.
- Hiding is independent of the lifecycle; deletion is terminal.
- `applicationUrl` is the application destination; `sourceUrl` is external
  provenance and does not imply ownership.
- Renewal reopens the validity window and requires publisher authority or
  compatible editorial authority.
- Curators and Administrators manage editorial jobs; an organization manages
  jobs only while the actor retains valid representation.

## Capabilities

- List and view eligible public jobs.
- Create, edit, close, withdraw, renew, and delete a job according to
  authority.
- List jobs owned by a person or represented organization.
- Create and view own suggestions; review, accept, and reject pending ones.
- View the management surface.
