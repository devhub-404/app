# Notification

Status: current

## Purpose

Persist private notices for an account when a relevant fact has an explicit
causal relationship with it.

## Business rules

- Each notification belongs to one recipient account and is private.
- The source identifies the causal fact and the target identifies the current
  navigation or action destination. Each reference must be complete or absent.
- The policy for each fact type determines recipients; there is no implicit
  subscription based solely on views, votes, or past interaction.
- `seenAt` records synchronization/delivery to the device; `readAt` records
  explicit reading. They are independent and idempotent states.
- The absence of the current target does not erase notification history; the
  projection must indicate that the destination is unavailable.
- Repeated creation of the same fact for the same recipient must not duplicate
  the notification.
- Synchronization is incremental by cursor.
- Cleaning old notifications is scheduled, idempotent, and independent of a
  normal request.

## Capabilities

- Create a notification through an explicit source-fact policy.
- Synchronize own notifications by cursor.
- Mark one or all own notifications as read.
- Remove notifications beyond the retention period.
