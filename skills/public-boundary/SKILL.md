---
name: public-boundary
description: "Use only when defining or consuming an API module's public surface or a Web feature's public entry point."
---

# Public boundary

Export only stable capabilities required by consumers: services, ports,
events, DTOs, queries, page façades, components, or mappings with an
intentional contract. Keep repositories, entity internals, providers, and
implementation helpers private; a component is public only when its consuming
boundary is intentional.

A module may consume another module only through its `public` surface. A Web
feature may be composed by `pages` only through its `public` exports; features
must not import one another's internals. Preserve ownership of rules and data
at the exporting boundary.

Before changing an export, inspect all consumers and decide whether the change
is compatible, additive, or a product/domain change. Verify imports and remove
accidental leakage rather than adding broad barrel exports.
