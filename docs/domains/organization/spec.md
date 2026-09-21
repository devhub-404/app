# Organization

Status: current

## Purpose

Represent collective identity — company, community, open-source project,
foundation, group, or institution — without replacing the human account that
acts on its behalf.

## Business rules

- An organization does not authenticate directly; every operation records a
  human account as actor.
- An organization has a name, type, and stable public slug.
- Membership connects an account to an organization with `OWNER`, `ADMIN`, or
  `MEMBER` role; the pair is unique.
- At least one `OWNER` must exist. No change may remove or demote the last
  owner.
- An owner manages identity, lifecycle, and memberships. An admin manages data
  and represented content when the consuming owner permits it. A member
  represents affiliation without implicit authority.
- An archived organization remains resolvable for history but accepts no new
  representation operations until reactivated.
- Deletion is terminal and does not automatically reassign jobs or artifacts
  from other owners.
- Organizations relate to other owners only through explicit contracts;
  association does not imply authorship, endorsement, or ownership.

## Capabilities

- Create, list, view, update, archive, unarchive, and delete an organization
  according to role.
- List own organizations and view their members.
- Add, change, remove membership, and leave voluntarily while respecting the
  last-owner rule.
- Answer consuming owners whether an account may represent the organization in
  a specific operation.
