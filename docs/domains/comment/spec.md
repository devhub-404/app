# Comment

Status: current

## Purpose

Provide contextual discussion for owners that explicitly support comments.
Currently, articles and news are commentable targets.

## Business rules

- A comment points to the resource identity; the target policy decides whether
  its owner supports comments.
- A reply references a parent comment from the same resource.
- Creating a comment requires an authenticated account, a readable target,
  and the owner's capability to create new comments enabled.
- Updating changes only the content of the author's own non-deleted comment
  and preserves the remaining facts.
- Author deletion and moderation hiding are independent.
- Deletion anonymizes the author and removes comment content while preserving
  the historical structure required for the discussion.
- Hiding is not an editorial property of the article or news; showing it again
  requires moderation authority.
- Disabling new comments prevents new roots and replies but does not hide
  existing comments.
- Contextual reads respect target visibility and preserve replies.
- Aggregate statistics may be queried per resource without loading the entire
  thread.

## Capabilities

- List and create comments on articles and news.
- Edit or delete one's own comment.
- List own comments and comments available for moderation.
- Hide or show a comment through the moderation surface.
- Query discussion statistics.
