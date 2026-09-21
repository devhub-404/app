# Vote

Status: current

## Purpose

Record an explicit positive signal of perceived usefulness without treating it
as truth, objective quality, or universal reputation.

## Business rules

- Vote is exclusively positive; there is no downvote, dislike, or persisted
  negative balance.
- Only targets supported by the vote policy may receive a vote.
- The account-resource combination has one active preference.
- Creating or changing a vote requires an accessible and eligible target at
  operation time.
- Removing one's own vote depends on the vote existing and does not require the
  target to remain eligible for new votes.
- The individual vote is the authority source; totals are aggregate
  projections.

## Capabilities

- Set or remove a vote on an eligible resource.
- Synchronize own votes.
- Query per-resource totals without exposing individual votes.
