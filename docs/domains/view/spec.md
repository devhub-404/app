# View

Status: current

## Purpose

Record aggregate reach for content accessed by authenticated accounts.

## Business rules

- A view represents the account plus resource pair; at most one persisted
  record exists for that pair.
- Only targets supported by the view policy may be recorded. Currently, the
  policy covers articles and news.
- A view is not a personal browsing history or a quality signal.
- Per-target totals are an aggregate projection and do not expose the account
  list.
- Recording the same view again is idempotent.

## Capabilities

- Record authenticated access to an eligible target.
- Query aggregate totals per target through the public contract.
