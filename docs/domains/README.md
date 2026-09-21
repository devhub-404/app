# Owners and domains

The domain documents are still being reconstructed.

## API

The current modules in `apps/api/src/modules` are:

```text
account          article             auth
bookmark         comment             contact
discovery        email               event
external-resource feedback            follow
job              media               moderation
news             notification        organization
project          q-and-a             report
taxonomy         view                vote
```

`app/runtime/platform` is an operational application area, not a product
module equivalent to the owners above.

## Web

The current features in `apps/web/src/features` are:

```text
account          article             auth
cheatsheet       codex               comment
contact          discovery           event
feedback        follow              home
job              moderation          news
organization     panel               platform
project          q-and-a             report
resource         roadmap             tool
```

This list does not need to match the API list. `home` and `panel` are
interface compositions; `resource` represents the `external-resource`
experience; some API modules do not have their own Web feature.

## Reconstructed documentation

The first owners reviewed against the current code are:

- `auth/`: authentication, credentials, MFA, possession proofs, and sessions;
- `account/`: identity, profile, preferences, roles, and lifecycle;
- `article/`: editorial lifecycle, content, public exposure, and authorship;
- `media/`: upload grants, confirmation, and cleanup;
- `external-resource/`: external references and editorial suggestions; the Web
  feature is named `resource`;
- `email/`: templates and transactional email delivery;
- `notification/`: private notices, synchronization, and read state;
- `moderation/`: capability restrictions and visibility interventions;
- `taxonomy/`: tags, aliases, terms, and classifications;
- `comment/`: contextual discussions and threads;
- `project/`: authored projects and editorial lifecycle;
- `news/`: editorial content and news suggestions;
- `event/`: events and event suggestions;
- `job/`: professional opportunities and community suggestions;
- `organization/`: collective identity and memberships;
- `follow/`: explicit tag preferences;
- `vote/`: positive usefulness signals;
- `view/`: aggregate content reach;
- `bookmark/`: personal saved-item preferences;
- `contact/`: institutional communication with the platform;
- `discovery/`: search, feed, and discovery projections;
- `feedback/`: product reports;
- `q-and-a/`: questions, answers, and acceptance;
- `report/`: reports about resources and comments.

The remaining owners are still pending review.

## Document format

Each documented owner has:

```text
docs/domains/<owner>/
├── spec.md   normative behavior
└── refs.md   current implementation evidence
```

`spec.md` describes rules, states, ownership, authorization, and requirements.
It contains no file paths or test lists.

`refs.md` lists existing entities, use cases, DTOs, controllers, endpoints,
schemas, and tests. It creates no requirements and does not interpret
behavior.
