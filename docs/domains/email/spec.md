# Email

Status: current

## Purpose

Render and send transactional emails requested by other owners without
deciding why a message should exist.

## Ownership

The calling owner defines the recipient, purpose, data, and send time.
`email` provides templates and forwards to the configured provider.

## Business rules

- A send request must contain a recipient, subject, and content compatible
  with the public contract.
- Templates are versioned in code and must escape user-controlled data
  according to HTML/text context.
- Provider failure must be distinguishable from send acceptance.
- The current setup does not promise a durable queue, retry, or later delivery
  after the calling operation ends.
- Tokens, codes, and secrets included in emails must not be logged.
- `email` does not decide eligibility, authentication, recovery, or lifecycle;
  it only sends the message requested by the responsible owner.

## Capabilities

- Render transactional templates for authentication, recovery, account changes,
  and contact.
- Send through a local provider in development or the Cloudflare provider in
  the configured environment.
