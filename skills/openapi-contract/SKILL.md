---
name: openapi-contract
description: "Use only when changing the HTTP contract produced by the API or consumed through the shared OpenAPI package."
---

# OpenAPI contract

The API is the sole source of the contract. Represent HTTP inputs and outputs
with DTO classes, `class-validator`, `class-transformer`, and Swagger
decorators. Generate `packages/api-contract/openapi.json` from the real NestJS
application and let the Web consume it through `openapi-fetch`.

Do not edit generated OpenAPI manually, introduce Zod into the shared contract,
or infer a contract from a Web client. When changing a DTO, controller,
response, status, or endpoint, inspect generated differences and affected
consumers.

Verify generation, type validity, absence of unsupported `any`/`unknown`/
`never` contracts where a concrete DTO is required, and relevant client usage.
