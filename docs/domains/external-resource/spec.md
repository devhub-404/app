# External resource

Status: current

## Purpose

Maintain external references curated by the platform and the flow through
which a person suggests a reference for editorial review.

## Ownership

`external-resource` owns the canonical URL, metadata, tags, editorial state of
the reference, and suggestion state. Taxonomy validates tags; account and auth
provide identity and authorization.

## States

Resource:

```text
ACTIVE <-> ARCHIVED
ACTIVE|ARCHIVED -> DELETED
```

Suggestion:

```text
PENDING -> ACCEPTED
PENDING -> REJECTED
```

The suggestion decision is terminal. A deleted resource accepts no update,
archiving, or restoration.

## Business rules

- The URL must be valid HTTP and canonical before persistence.
- Tags are normalized to the owner's representation and must not be
  duplicated.
- Creation, editing, archiving, restoration, and review require compatible
  editorial authority; deletion requires administrative authority.
- An authenticated person may suggest a reference and view their own
  suggestions.
- Pending suggestions are available through the review surface. Only editorial
  authority may accept or reject them.
- Accepting a suggestion associates the result with an external resource;
  rejecting it may record a decision note.
- Public and administrative resources are different projections; public reads
  must not expose administrative suggestion fields.

## Capabilities

- List and view public resources.
- Create, edit, archive, restore, and delete resources according to role.
- Suggest resources and list one's own suggestions.
- List pending suggestions, accept or reject suggestions, and view resources
  for administration.
