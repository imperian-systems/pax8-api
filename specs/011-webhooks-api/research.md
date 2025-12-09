# Research Findings - Webhooks API

Decision: Use API v2 base URL for all webhook endpoints.
Rationale: The Pax8 Webhooks API OpenAPI spec defines `https://api.pax8.com/api/v2` as the server URL, distinct from the v1 base used by other endpoints.
Alternatives considered: Using v1 base with /webhooks path; rejected because the official spec clearly indicates v2 versioning.

Decision: Implement full CRUD plus topic management, testing, and logging capabilities.
Rationale: The OpenAPI spec defines comprehensive webhook management including create, read, update, delete, plus topic operations (add, replace, remove, configure), test endpoint, and log/retry endpoints. Partners need all these capabilities for effective webhook management.
Alternatives considered: Implementing only basic CRUD; rejected because topic management and logging are essential for production webhook usage.

Decision: Model `errorThreshold` with a maximum value of 20.
Rationale: OpenAPI spec defines `maximum: 20` for errorThreshold; validates input to prevent configuration errors.
Alternatives considered: Allowing unlimited threshold; rejected per spec constraint.

Decision: Make `integrationId` optional in CreateWebhook.
Rationale: OpenAPI spec marks it as optional but notes "required for 3rd party integrators"; direct partners can omit it.
Alternatives considered: Making it required; rejected because not all users are 3rd party integrators.

Decision: Separate topic management into distinct operations (add, replace, remove, update config).
Rationale: API provides granular control via separate endpoints: POST /topics (add), PUT /topics (replace all), DELETE /topics/{id} (remove), POST /topics/{id}/configuration (update filters).
Alternatives considered: Single topic update endpoint; rejected because API design requires different operations.

Decision: Use page-based pagination with `page` (number) and `size` (number) parameters.
Rationale: Consistent with existing pagination pattern used throughout the project and matches Pax8 API design.
Alternatives considered: Cursor-based pagination; rejected for consistency with project conventions.

Decision: Model filter conditions with field/operator/value array structure.
Rationale: OpenAPI spec defines FilterCondition with field (string), operator (enum), and value (string[]); this structure supports various comparison operations.
Alternatives considered: Simplified key-value filters; rejected because it wouldn't support the rich filtering capabilities defined.

Decision: Return HTTP 202 Accepted for retry operations.
Rationale: OpenAPI spec defines 202 response for retry endpoint, indicating async processing.
Alternatives considered: Synchronous retry with immediate result; rejected per API design.

Decision: Return HTTP 204 No Content for delete operations.
Rationale: Consistent with project patterns (subscriptions cancel returns 204) and OpenAPI spec for webhook/topic deletion.
Alternatives considered: Return deleted entity; rejected per project conventions and spec.

Decision: Include `lastDeliveryStatus` as optional on Webhook entity.
Rationale: OpenAPI spec marks this field as not required; it may be null/undefined for webhooks that haven't received events yet.
Alternatives considered: Making it required with default; rejected per spec accuracy.

Decision: Reuse existing pagination, retry, and rate-limit handling patterns from `http/` utilities.
Rationale: Constitution requires resilient-by-default behavior and zero runtime deps; existing utilities already implement backoff and headers.
Alternatives considered: Adding external client libraries; rejected per zero-dependency principle.

Decision: Use Vitest contract and integration suites for TDD before implementation.
Rationale: Constitution mandates Test-First Development; repo already structured with contract/integration tests for other APIs.
Alternatives considered: Ad-hoc manual testing; rejected due to non-negotiable TDD requirement.

Decision: Model WebhookLog with callHistory array for delivery attempt tracking.
Rationale: OpenAPI spec defines callHistory as an array of WebhookCall objects, providing full audit trail of delivery attempts.
Alternatives considered: Single status field; rejected because API provides rich history data.

Decision: Implement test endpoint that returns WebhookTest with url, webhook config, and sample payload.
Rationale: Test endpoint allows partners to verify connectivity and understand payload structure before enabling webhook in production.
Alternatives considered: Omitting test endpoint; rejected because it's a valuable development tool.
