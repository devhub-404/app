# Taxonomy

Status: current

## Purpose

Maintain canonical tags, aliases, identity terms, and classifications for
resources persisted by the API.

## Business rules

- Each tag has a canonical identity and stable slug; an alias resolves to the
  canonical tag.
- A tag may be `ACTIVE` or `ARCHIVED`. Archiving does not remove historical
  references or prevent resolution, but prevents new classifications.
- The tag-resource association is unique and belongs to `taxonomy`; the
  resource owner remains responsible for its own lifecycle and exposure.
- Taxonomy does not decide whether a resource is public, editable, votable, or
  commentable.
- Static-content tags are validated by the content manifest; they are not
  artificially converted into persisted resources.
- Following a tag belongs to `follow`, not taxonomy.
- Merge migrates aliases and classifications, removes duplicates, and must
  coordinate follow relationships through the public contract.

## Capabilities

- Search and resolve active tags by name, slug, or alias.
- Create, update, archive, restore, delete, and merge tags according to role.
- Manage aliases and identity terms.
- Replace and remove resource classifications through the public contract.
- Validate tag manifests used by static content.
