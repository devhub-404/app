# Report

Status: current

## Purpose

Record a report about a specific platform resource or comment. It is not the
channel for product feedback.

## Business rules

- `ResourceReport` and `CommentReport` are explicit, separate flows; there is
  no generic report for arbitrary type and id.
- `ResourceReport` points to a resource and `CommentReport` points to a
  comment.
- Creating a `ResourceReport` requires the target to be reportable according to
  its policy, not merely for its id to exist.
- The lifecycle is `PENDING -> RESOLVED | DISMISSED`.
- Only a pending report may be reviewed; the decision records reviewer,
  optional note, and time.
- A report does not automatically hide or delete its target; moderation action
  belongs to the appropriate owner/capability.
- Reporter purge may anonymize identity without deleting history.
- Removing the target does not delete the report or decision; lookup indicates
  current unavailability while preserving the minimum trail.

## Capabilities

- Report a reportable resource or existing comment.
- List resource and comment reports in authorized triage.
- Resolve or dismiss a pending report with an auditable trail.
