# Account

Status: current

## Purpose

Maintain a person's stable identity on the platform, profile, preferences,
roles, and administrative lifecycle.

## Ownership

`account` owns identity, username, profile, preferences, roles, account
eligibility, and administrative states.

`auth` owns authentication methods, MFA, and sessions. Auth must observe an
ineligible account state, but its transitions belong to `account`.

## States

- Activity state: `ACTIVE` or `DEACTIVATED`.
- Moderation state: `NONE`, `SUSPENDED`, or `BANNED`.
- Deletion state: `NONE` or `PENDING`.
- Platform roles are independent of the states above. At most one privileged
  platform role is assigned at a time among Curator, Moderator, and
  Administrator; `User` is the default state and need not be persisted as a
  role.

The three state dimensions are independent, but effective access eligibility
considers their combination. Pending deletion starts the retention period
defined by the platform and must revoke access according to the current
policy.

## Business rules

- The account is the stable identity; profile and preferences are associated
  data, not a new identity.
- Reactivation is valid only for a deactivated account.
- Canceling deletion is valid only while deletion is pending and requires the
  confirmation specified for that operation.
- Suspension and banning are administrative actions distinct from voluntary
  deactivation.
- Assigning and removing roles are explicit administrative operations.
- Role changes do not alter credentials or MFA, but effective privileged
  authority may require a compatible authentication level.
- The public profile is a controlled projection of the account. Its fields and
  visibility do not indiscriminately expose private data.
- Public and administrative queries return their own projections; they do not
  turn the entire internal entity into an external contract.
- Username availability must respect normalization and platform uniqueness
  rules.
- Purging an eligible account must be idempotent and monotonic: a purged
  account does not return to an earlier state.

## Capabilities

- View and update one's account, profile, and preferences.
- Deactivate and reactivate one's account when allowed.
- Request deletion and cancel a pending deletion when allowed.
- View public profiles and username availability.
- Suspend, unsuspend, ban, and unban accounts as authorized administrative
  operations.
- View accounts and assign roles as authorized administrative operations.
- Purge accounts whose deletion period has elapsed.

## Boundaries

- Account does not replace auth for authentication, MFA, or sessions.
- Credential data, tokens, and secrets do not belong in the public profile.
- The public projection is not a universal reputation mechanism.
- Purge must preserve data required by retention policy or legal obligation,
  when applicable.
