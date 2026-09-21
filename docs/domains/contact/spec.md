# Contact

Status: current

## Purpose

Receive institutional, legal, or support communication addressed to DevHub
operations.

## Business rules

- Contact is for formal communication with the platform. Authenticated bugs,
  problems, and suggestions belong to `feedback`; reports about resources or
  comments belong to `report`.
- Email is required.
- `contextUrl` provides submission context and does not control arbitrary
  redirection.
- The submission is validated and forwarded to the operational recipient by
  Email.
- The operation result distinguishes provider acceptance from failure; the
  current flow does not promise a durable queue or later retry.
- The public endpoint must limit automated abuse.

## Capabilities

- Submit a valid public contact message.
- Forward the message to the configured operational address.
