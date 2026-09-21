---
name: presentation
description: "Use only when changing NestJS controllers, HTTP input/output adaptation, guards, pipes, response mapping, or transport-level errors."
---

# Presentation

Keep controllers thin: receive transport input, invoke the application
operation, and adapt its result to HTTP. Use DTO classes for transport shapes,
explicit pipes for parsing, guards/decorators for request context, and the
shared response/error conventions.

Do not put business rules, persistence access, query construction, or feature
orchestration in controllers. Keep authentication and role checks consistent
with the established guard/policy flow. Preserve status codes, response
catalog entries, headers, versioning, and public/private behavior.

When a transport shape changes, inspect the generated OpenAPI consequence and
the consuming contract. Validate with controller or contract checks; domain
behavior belongs to the application and domain layers.
