# News

Status: current

## Purpose

Turn relevant ecosystem events into editorial context: what happened, why it
matters, who is affected, and what comes next.

## Business rules

- News is platform editorial content; it has no community authorship.
- The lifecycle is `DRAFT -> PUBLISHED -> ARCHIVED`; archiving removes an item
  from active discovery and unarchiving returns it to published.
- `occurredAt` represents when the fact happened and must exist before first
  publication; `publishedAt` represents publication on the platform.
- Only published and non-deleted news participates in public discovery.
  Archived news may remain available as history.
- Updates preserve status and slug. Content may be updated by version;
  version conflict prevents partial application.
- A suggestion and news are distinct entities. An accepted suggestion may
  create a draft, and the sender does not acquire editorial authority.
- At most one pending suggestion exists for the same canonical URL.
- Accepting or rejecting a suggestion is a terminal, auditable decision.
- `commentsEnabled` controls only new comments and replies; closing comments
  does not hide the existing thread.
- Curators and Administrators run the editorial lifecycle; Moderators inspect
  the collection needed for their assignments.

## Capabilities

- List, view, and provide RSS for public news.
- Create, edit, publish, archive, unarchive, and delete news according to
  editorial authority.
- Suggest news, view own suggestions, review pending ones, and accept or
  reject suggestions.
- Control new comments and view popular sources.
