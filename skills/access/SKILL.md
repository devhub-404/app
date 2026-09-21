---
name: access
description: "Use only when changing route eligibility, role/capability checks, operation visibility, or local access predicates in the Web application."
---

# Access

Separate local presentation access from backend authorization. Determine the
route or operation context, account/session state, role, capability, and
resource state needed for the predicate. A denied operation may be hidden or
disabled according to UI policy, but the API remains authoritative.

Keep route protection in application access/middleware when it can happen
before rendering. Keep feature predicates close to the feature and export
only the public access contract. Do not fetch or duplicate domain rules merely
to decide presentation.

Test allowed, denied, anonymous, missing-role, and invalid-context cases. Do
not use access predicates as a security boundary for mutations.
