# Media

Status: current

## Purpose

Control the media-object upload lifecycle and provide the consuming owner with
an opaque reference that can be associated with its own data.

## Ownership

`media` owns the media object, its state, upload authorization, confirmation,
and relationship with object storage. The consuming owner persists only the
media identifier and decides which model field references it.

## State

```text
PENDING -> CONFIRMED
PENDING -> DELETED
CONFIRMED -> DELETED
```

Repeated confirmation of a confirmed object is idempotent. A deleted object
cannot be confirmed again.

## Business rules

- Upload requires an authenticated owner, a supported purpose, and limits
  compatible with that purpose.
- An upload grant does not confirm the object; confirmation occurs only after
  storage completes the upload and the server validates the operation.
- A confirmed object may be associated only with the owner and purpose that
  were authorized.
- Expired pending uploads and orphaned objects must be identified and removed
  by cleanup, without depending on a normal request.
- Grant validity and cleanup retention are distinct policies.
- Cleanup must be repeatable and safe under re-execution.

## Capabilities

- Request an upload grant.
- Confirm a completed upload.
- Clean up expired grants and objects without a valid association.

## Current limits

Available domain purposes are `avatar` and `content`. Type, size, bucket, and
retention limits are operational configuration and must not be duplicated in
each consuming owner.
