# Project

Status: current

## Purpose

Present work, a product, or software built by an account, with authorship,
editorial lifecycle, and presentation or source-code links.

## Business rules

- Each project has one author account; an organization is not its author or
  automatic publisher.
- The editorial lifecycle is `DRAFT -> PUBLISHED -> ARCHIVED`; archiving is
  reversible and deletion is terminal.
- Updates preserve the editorial state and the public slug remains stable.
- A hidden project is not public, but hiding is independent of the editorial
  lifecycle and may be removed by moderation.
- `projectUrl` is presentation/demo and `repositoryUrl` is source code; neither
  creates automatic integration.
- Creation produces a draft, associates the authenticated author, and
  validates supplied URLs and tags.
- The author may edit and conduct the own lifecycle; administration performs
  only explicitly authorized capabilities.
- Public reads return only published, non-deleted, non-hidden projects. The
  author may view own states; management may inspect the collection according
  to authorization.

## Capabilities

- Create, edit, publish, archive, unarchive, and delete a project.
- List and view public projects.
- List own projects and view the management surface.
