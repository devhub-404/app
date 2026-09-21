# Follow

Status: current

## Purpose

Record an account's explicit preference for a tag so discovery can use the
signal without transferring tag ownership to `follow`.

## Business rules

- Each follow represents exactly the account plus canonical tag pair.
- The pair is unique; following again is idempotent, and unfollowing removes
  only that preference.
- Follow does not change the tag or resource classifications.
- The preference is not inferred from views, votes, bookmarks, or past
  interaction.
- Only an active tag resolved through the taxonomy contract can be followed.

## Capabilities

- Follow and unfollow a tag.
- List tags followed by the authenticated account.
- Expose follows as an explicit signal for discovery composition.
