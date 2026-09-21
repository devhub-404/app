# Bookmark

Status: current

## Purpose

Preserve that an account wants to find a resource again without turning a
personal preference into a public rating.

## Business rules

- A bookmark is personal `saved`/`unsaved` state and has no public count.
- Supported targets are articles, news, external resources, projects, and
  questions.
- A bookmark references the resource through the shared contract; the resource
  owner remains responsible for current availability and representation.
- Saving and removing are idempotent per account and resource.
- The own-bookmarks query resolves the target's current representation while it
  remains available.

## Capabilities

- Save and remove one's own bookmark.
- List and synchronize bookmarks for the authenticated account.
