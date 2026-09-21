# Article

Status: current

## Purpose

Represent authored knowledge published by the platform while preserving
authorship, content, editorial evolution, and controlled public exposure.

## Ownership

`article` owns the editorial lifecycle, content, slug, comment settings,
associated tags, and article reading projections.

Identity and authorship come from `account`; cover media comes from `media`;
classification comes from `taxonomy`; moderation, interactions, and discovery
remain with their corresponding owners.

## State

The editorial lifecycle is:

```text
DRAFT -> PUBLISHED -> ARCHIVED
             ^           |
             +-----------+
```

An article may also be operationally hidden or deleted. Hiding and deletion
are independent of the editorial lifecycle; deletion is terminal. An article
is public only when published, not hidden, and not deleted.

## Business rules

- Each article has exactly one author; authorship is not transferable.
- The slug is produced by the backend, is unique and normalized, and
  identifies the article in the public surface.
- Creating an article starts it in `DRAFT`. Publishing requires the minimum
  classification defined by the platform.
- Publishing is allowed from draft or archived; archiving is allowed only from
  published; unarchiving returns it to published.
- Updating does not change the editorial state. A deleted article accepts no
  edits or editorial transitions.
- Content may be updated through a version-based patch. A divergent version
  produces a conflict; an invalid patch cannot be partially applied.
- Only moderation changes the hidden state. A hidden article remains in its
  author's editorial lifecycle but does not participate in public exposure.
- The author controls whether new comments may be created; disabling new
  comments does not delete or hide the existing discussion.
- Only a public article may be publicly exposed and receive new public
  interactions.
- Lookup by id may include a non-public article for its author or moderation
  authority, according to the access policy.
- Author deletion is allowed for the author's article; administrative deletion
  requires administrative authority.

## Capabilities

- Create a draft, edit metadata/content/tags, and associate confirmed cover
  media.
- Publish, archive, unarchive, and delete an article.
- List public, own, and moderation-available articles.
- Read an article and its content by id or slug according to authorization.
- List popular tags and provide RSS for public articles.
- Enable or disable new comments for an article.

## Read contracts

Public, author, and moderation surfaces return projections appropriate to their
context. None should expose the complete internal entity or allow a public
read to bypass hiding or deletion.
