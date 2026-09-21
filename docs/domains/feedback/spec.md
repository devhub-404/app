# Feedback

Status: current

## Purpose

Receive reports of bugs, problems, or suggestions about the DevHub product and
experience.

## Business rules

- Public categories are `BUG`, `ISSUE`, and `SUGGESTION`; description is
  required.
- Product feedback is not a report about a resource or comment; those flows
  belong to `report`.
- `contextUrl` is informational context and does not create a semantic link to
  the referenced resource.
- When used, a screenshot references only an image accepted by `media`.
- The lifecycle is `OPEN -> IN_REVIEW -> RESOLVED | DISMISSED`.
- Severity classification is internal and does not change the public category.
- Resolution or dismissal records the final time.
- A valid submission must be persisted before confirming the result to the
  user; the operation must avoid accidental duplication.

## Capabilities

- Send authenticated feedback with optional context and image.
- View, classify, resolve, or dismiss feedback in authorized triage.
