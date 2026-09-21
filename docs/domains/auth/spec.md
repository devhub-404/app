# Auth

Status: current

## Purpose

Authenticate the account owner, manage authentication methods, prove
possession of credentials, and maintain sessions with the least necessary
access.

## Ownership

`auth` owns credentials, authentication ceremonies, MFA, possession proofs,
sessions, and temporary authentication artifacts.

`account` owns account identity, profile, preferences, roles, and
administrative states. Auth checks account eligibility; it does not
reimplement the account lifecycle rules.

## Business rules

- Username identifies an account but is not a login method by itself.
- A session is usable only while the account is eligible for access.
  Deactivation, suspension, banning, and pending deletion may revoke that
  eligibility.
- Authentication that requires MFA completes only after the corresponding
  challenge is verified.
- An authentication method cannot bypass the account's access state.
- An account cannot remove its last usable authentication method.
- Replacing an OPAQUE credential is not modeled as account deletion or as a
  silent removal of all other methods.
- Passkeys, TOTP, and recovery codes have distinct responsibilities; none
  automatically becomes unrestricted account recovery.
- Recovery codes are single-use. TOTP can be used only after setup and
  confirmation.
- Possession proofs have their own purpose, scope, and validity. A proof
  issued for one operation does not authorize another.
- Temporary tokens are purpose-bound, expire, are single-use, and must be
  invalidated on the server when consumed.
- Changing an email requires confirmation of the appropriate address. The
  primary email changes only after the specified verification ceremony.
- Changing roles invalidates cached authorization decisions within the
  operational time defined by the system.
- Session renewal for up to 30 days depends on qualified authentication proof;
  it is not an unconditional session extension.

## Capabilities

- Register and authenticate with password, magic link, OAuth, and passkey.
- Verify and change email addresses.
- Change and recover a password.
- Configure, verify, disable, and regenerate TOTP and recovery codes.
- Start and complete recovery and possession-proof flows.
- List, inspect, end the current session, end other sessions, and revoke a
  specific session.
- Manage authentication methods for the authenticated account.
- Remove expired authentication artifacts as an idempotent operation.

## Security requirements

- Authentication secrets are not stored in plaintext.
- The backend is the authority for authentication, sessions, MFA, and
  authorization.
- Public-flow responses must not enable account enumeration when the operation
  does not require revealing account existence.
- Browser sessions use a secure, restricted-scope cookie; the client does not
  receive the raw session secret.
- Protected mutable operations must respect CSRF protection and the applicable
  origin policy.
- Account registration and creation of required credentials must remain
  consistent as one logical operation.

## Deliberate exclusions

- Username as an independent login.
- TOTP or recovery codes as a universal replacement for every other recovery
  mechanism.
- Deleting account identity as a consequence of replacing an OPAQUE
  credential.
