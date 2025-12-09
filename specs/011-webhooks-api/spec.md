# Feature Specification: Webhooks API

**Feature Branch**: `011-webhooks-api`  
**Created**: December 9, 2025  
**Status**: Draft  
**Input**: User description: "Implement webhooks API as defined in https://devx.pax8.com/openapi/68485b592a33000024a5cf94"

## Clarifications

### Session 2025-12-09
- Q: What is the primary use case for webhooks? → A: Partners receive real-time notifications when events occur (e.g., subscription changes, order updates) instead of polling APIs.
- Q: Should the client support all webhook management operations? → A: Yes, full CRUD for webhooks plus topic management, configuration updates, and log/retry capabilities.
- Q: How are topic filters structured? → A: Filters have actions and conditions; conditions specify field/operator/value for granular event filtering.
- Q: What delivery statuses are supported? → A: PENDING, SUCCESS, FAILED, RETRYING.
- Q: Is integrationId required for webhook creation? → A: Only required for 3rd party integrators; optional for direct partners.
- Q: What is the maximum errorThreshold value? → A: 20 (per OpenAPI spec).
- Q: Does the webhooks API use v1 or v2? → A: v2 base URL (`https://api.pax8.com/api/v2`).
- Q: How should retry of non-failed deliveries be handled? → A: Surface API error (400) - client passes through error from Pax8 API.
- Q: Should webhooks client auto-retry on rate limiting (429)? → A: Yes, reuse existing retry/backoff utilities from http/ module.
- Q: What should ListWebhookLogsOptions.query contain? → A: Empty object `{}` as default when caller doesn't specify.
- Q: Can test endpoint use any topic or only subscribed topics? → A: Any valid topic name works regardless of webhook's subscriptions.
- Q: What is the maximum page size for webhook list operations? → A: 200, consistent with other project APIs.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List webhooks with filters (Priority: P1) 🎯 MVP

Partner/integrator retrieves a paginated list of webhooks to view existing webhook configurations, monitor delivery status, and manage subscriptions.

**Why this priority**: Webhook listing is the foundational operation for any webhook management workflow. Partners need to see their existing webhooks before creating, updating, or troubleshooting them.

**Independent Test**: Call the webhooks list endpoint with page/size and optional filters (active, topic, status); verify the response includes webhook records with pagination metadata.

**Acceptance Scenarios**:

1. **Given** valid authorization and no filters, **When** the client requests the webhooks list, **Then** the response returns the first page of webhooks with default pagination metadata.
2. **Given** valid authorization and pagination parameters (page, size), **When** the client requests the webhooks list, **Then** the response returns the specified page of webhooks with correct pagination metadata.
3. **Given** valid authorization and an active filter (true/false), **When** the client requests the webhooks list, **Then** only webhooks with that active status are returned.
4. **Given** valid authorization and a topic filter, **When** the client requests the webhooks list, **Then** only webhooks subscribed to that topic are returned.
5. **Given** valid authorization and a status filter, **When** the client requests the webhooks list, **Then** only webhooks with that delivery status are returned.
6. **Given** filters that match no webhooks, **When** the client requests the webhooks list, **Then** the response returns an empty list with pagination metadata indicating zero results.

---

### User Story 2 - Create and configure webhooks (Priority: P1) 🎯 MVP

Partner/integrator creates a new webhook subscription to receive real-time notifications for specific events.

**Why this priority**: Webhook creation is essential for partners to start receiving event notifications. This is a core MVP operation alongside listing.

**Independent Test**: Submit a valid webhook creation request with displayName, url, and optional topics; verify the response returns the created webhook with an ID.

**Acceptance Scenarios**:

1. **Given** valid authorization and a displayName, **When** the client creates a webhook, **Then** the response returns the created webhook with generated id, accountId, timestamps, and default values.
2. **Given** valid authorization and full configuration (displayName, url, authorization header, topics), **When** the client creates a webhook, **Then** all provided fields are reflected in the response.
3. **Given** a missing required field (displayName), **When** the client creates a webhook, **Then** a validation error response is returned.
4. **Given** an invalid url format, **When** the client creates a webhook, **Then** a validation error response is returned.
5. **Given** an errorThreshold exceeding 20, **When** the client creates a webhook, **Then** a validation error response is returned.

---

### User Story 3 - View webhook details (Priority: P2)

Partner/integrator retrieves full details of a specific webhook to view configuration, subscribed topics, and delivery status.

**Why this priority**: Webhook detail lookup is essential for troubleshooting delivery issues, verifying configuration, and providing support.

**Independent Test**: Request a webhook by ID and confirm all required fields are present including topics, configuration, and timestamps; test also covers the not-found path.

**Acceptance Scenarios**:

1. **Given** a valid webhook identifier and authorization, **When** the client requests the webhook detail, **Then** the response returns the webhook with all attributes including id, accountId, displayName, url, active, webhookTopics, and timestamps.
2. **Given** an invalid or unknown webhook identifier, **When** the client requests the webhook detail, **Then** a not-found response is returned with a clear error payload.

---

### User Story 4 - Update webhook configuration (Priority: P2)

Partner/integrator updates an existing webhook's configuration (displayName, url, authorization, contactEmail, errorThreshold).

**Why this priority**: Configuration updates are common operations when webhook endpoints change or notification preferences need adjustment.

**Independent Test**: Submit a valid configuration update; verify the response returns the updated webhook with new values applied.

**Acceptance Scenarios**:

1. **Given** a valid webhook ID and authorization, **When** the client updates the configuration, **Then** the response returns the updated webhook with the new configuration values.
2. **Given** a partial update (only displayName), **When** the client updates the configuration, **Then** only the specified field is changed; other fields remain unchanged.
3. **Given** an invalid errorThreshold (>20), **When** the client updates the configuration, **Then** a validation error response is returned.
4. **Given** an unknown webhook ID, **When** the client updates the configuration, **Then** appropriate error handling occurs.

---

### User Story 5 - Update webhook status (Priority: P2)

Partner/integrator enables or disables a webhook by updating its active status.

**Why this priority**: Status toggling is a critical operational control that allows partners to pause webhook delivery without deleting the configuration.

**Independent Test**: Submit a status update request; verify the webhook active status is updated.

**Acceptance Scenarios**:

1. **Given** a valid webhook ID and active=true, **When** the client updates the status, **Then** the webhook is enabled and the response reflects active=true.
2. **Given** a valid webhook ID and active=false, **When** the client updates the status, **Then** the webhook is disabled and the response reflects active=false.

---

### User Story 6 - Delete webhook (Priority: P3)

Partner/integrator deletes a webhook subscription they no longer need.

**Why this priority**: Webhook deletion is less frequent but necessary for cleanup and security when webhook endpoints are decommissioned.

**Independent Test**: Submit a delete request for a valid webhook; verify 204 response and confirm the webhook is removed.

**Acceptance Scenarios**:

1. **Given** a valid webhook ID and authorization, **When** the client deletes the webhook, **Then** the operation completes successfully (HTTP 204).
2. **Given** an invalid or unknown webhook ID, **When** the client attempts to delete, **Then** a not-found response is returned.

---

### User Story 7 - Manage webhook topics (Priority: P3)

Partner/integrator adds, replaces, or removes topics from an existing webhook to control which events trigger notifications.

**Why this priority**: Topic management allows fine-grained control over which events a webhook receives, essential for filtering noise and focusing on relevant events.

**Independent Test**: Add a topic to a webhook, replace all topics, and remove a specific topic; verify each operation updates the webhook correctly.

**Acceptance Scenarios**:

1. **Given** a valid webhook ID and topic configuration, **When** the client adds a topic, **Then** the topic is added to the webhook's topic list.
2. **Given** a topic that already exists on the webhook, **When** the client adds the same topic, **Then** an error response indicates the topic already exists.
3. **Given** a valid webhook ID and new topic list, **When** the client replaces all topics, **Then** the webhook's topics are completely replaced.
4. **Given** a valid webhook ID and topic ID, **When** the client removes a topic, **Then** the topic is removed (HTTP 204).
5. **Given** a valid webhook ID, topic ID, and filter configuration, **When** the client updates topic configuration, **Then** the topic's filters are updated.

---

### User Story 8 - Get topic definitions (Priority: P3)

Partner/integrator retrieves available topic definitions to understand what events can be subscribed to and what filters are available.

**Why this priority**: Topic definitions inform partners what events are available and how to configure filters effectively.

**Independent Test**: Request topic definitions with optional filters; verify the response includes topic names, descriptions, available filters, and sample payloads.

**Acceptance Scenarios**:

1. **Given** valid authorization, **When** the client requests topic definitions, **Then** the response returns paginated topic definitions with names, descriptions, and available filters.
2. **Given** a topic filter, **When** the client requests topic definitions, **Then** only definitions matching that topic are returned.
3. **Given** a search term, **When** the client requests topic definitions, **Then** definitions matching the search are returned.

---

### User Story 9 - Test webhook delivery (Priority: P4)

Partner/integrator tests a webhook by sending a sample event to verify endpoint connectivity and payload handling.

**Why this priority**: Testing is valuable for verification but is an auxiliary feature that supports the core webhook functionality.

**Independent Test**: Submit a test request for a webhook and topic; verify the response includes the test result and sample payload.

**Acceptance Scenarios**:

1. **Given** a valid webhook ID and topic name, **When** the client tests the webhook, **Then** the response includes the URL called, webhook configuration, and sample payload sent.
2. **Given** an invalid webhook ID, **When** the client tests the webhook, **Then** appropriate error handling occurs.

---

### User Story 10 - View webhook logs (Priority: P4)

Partner/integrator retrieves delivery logs for a webhook to troubleshoot delivery issues and audit delivery history.

**Why this priority**: Logs provide valuable audit and debugging capabilities but are secondary to core webhook management.

**Independent Test**: Request logs for a webhook with optional filters; verify the response includes log entries with delivery status and call history.

**Acceptance Scenarios**:

1. **Given** a valid webhook ID and authorization, **When** the client requests logs, **Then** the response returns paginated log entries with delivery status and timestamps.
2. **Given** optional filters (topicName, status, date range), **When** the client requests logs, **Then** only matching log entries are returned.
3. **Given** a valid webhook ID and log ID, **When** the client requests a specific log, **Then** the full log details including call history are returned.
4. **Given** an invalid log ID, **When** the client requests a specific log, **Then** a not-found response is returned.

---

### User Story 11 - Retry failed webhook delivery (Priority: P5)

Partner/integrator retries a failed webhook delivery to attempt redelivery of a missed event.

**Why this priority**: Retry is a recovery feature that enhances reliability but is used infrequently compared to other operations.

**Independent Test**: Submit a retry request for a failed log entry; verify HTTP 202 accepted response.

**Acceptance Scenarios**:

1. **Given** a valid webhook ID and log ID for a failed delivery, **When** the client requests a retry, **Then** the request is accepted (HTTP 202).
2. **Given** an invalid log ID, **When** the client requests a retry, **Then** appropriate error handling occurs.

---

### Edge Cases

- What happens when requesting webhooks with an invalid page number (negative or beyond available pages)? Returns an empty page with correct pagination metadata rather than an error.
- Invalid or missing authorization yields a consistent error response without leaking webhook details.
- Creating a webhook with duplicate topic subscriptions returns a validation error.
- Updating configuration with an empty object returns the unchanged webhook.
- What happens when testing a webhook for a topic it's not subscribed to? Test succeeds with sample payload for that topic; subscription not required for testing.
- What happens when retrying a log entry that succeeded? Returns a 400 Bad Request error from the API; client surfaces this error transparently.
- Adding a topic with invalid filter operators returns a validation error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated webhooks list endpoint using page-based pagination with configurable page size (default 10, maximum 200).
- **FR-002**: System MUST support filtering the webhooks list by `active`, `topic`, `status`, `accountId`, and free-text `query`.
- **FR-003**: System MUST support sorting the webhooks list via the `sort` parameter (field:asc/desc format).
- **FR-004**: System MUST provide a webhook creation endpoint that accepts displayName (required) and optional url, authorization, active, contactEmail, errorThreshold, integrationId, and webhookTopics.
- **FR-005**: System MUST validate webhook creation: errorThreshold must not exceed 20.
- **FR-006**: System MUST provide a webhook detail endpoint that returns a single webhook by ID with all attributes.
- **FR-007**: System MUST provide a webhook deletion endpoint that removes a webhook (HTTP 204).
- **FR-008**: System MUST provide a webhook configuration update endpoint that updates displayName, url, authorization, contactEmail, and/or errorThreshold.
- **FR-009**: System MUST provide a webhook status update endpoint that updates the active status.
- **FR-010**: System MUST provide topic management endpoints: add topic, replace all topics, remove topic, and update topic configuration.
- **FR-011**: System MUST prevent duplicate topic subscriptions on a webhook.
- **FR-012**: System MUST provide a topic definitions endpoint that returns available topics with filters and sample payloads.
- **FR-013**: System MUST provide a webhook test endpoint that sends a sample event and returns test results.
- **FR-014**: System MUST provide webhook log endpoints: list logs with filters, get log by ID.
- **FR-015**: System MUST provide a webhook delivery retry endpoint that accepts failed log entries for redelivery (HTTP 202).
- **FR-016**: System MUST return consistent error structures for bad request (400), unauthorized (401), forbidden (403), not-found (404), and server error (500) responses.
- **FR-017**: System MUST include pagination metadata in list responses: page number, page size, total elements, and total pages.
- **FR-018**: System MUST use API v2 base URL (`https://api.pax8.com/api/v2`).
- **FR-019**: System MUST implement automatic retry with exponential backoff for rate-limited (429) responses using existing http/ utilities.

### Key Entities

- **Webhook**: Represents a webhook subscription. Attributes: `id` (uuid), `accountId` (uuid), `displayName` (string), `url` (string, optional), `authorization` (string, optional), `active` (boolean), `contactEmail` (string, optional), `errorThreshold` (int32, max 20, default 3), `integrationId` (uuid, optional), `webhookTopics` (WebhookTopic[]), `lastDeliveryStatus` (WebhookDeliveryStatus, optional), `createdAt` (ISO 8601), `updatedAt` (ISO 8601).
- **WebhookTopic**: Topic subscription configuration. Attributes: `id` (uuid), `topic` (string), `filters` (WebhookFilter[]).
- **WebhookFilter**: Filter configuration for a topic. Attributes: `action` (string), `conditions` (FilterCondition[]).
- **FilterCondition**: Individual filter condition. Attributes: `field` (string), `operator` (FilterOperator), `value` (string[]).
- **FilterOperator**: Enum for filter comparison: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'CONTAINS'.
- **WebhookDeliveryStatus**: Enum for delivery status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING'.
- **CreateWebhook**: Request to create webhook. Attributes: `displayName` (required), `url`, `authorization`, `active`, `contactEmail`, `errorThreshold`, `integrationId`, `webhookTopics`.
- **UpdateWebhookConfiguration**: Request to update configuration. Attributes: `displayName`, `url`, `authorization`, `contactEmail`, `errorThreshold`.
- **UpdateWebhookStatus**: Request to update status. Attributes: `active` (required).
- **AddWebhookTopic**: Request to add topic. Attributes: `topic` (required), `filters` (required).
- **ReplaceWebhookTopics**: Request to replace all topics. Attributes: `webhookTopics` (required).
- **UpdateWebhookTopicConfiguration**: Request to update topic config. Attributes: `filters` (required).
- **TopicDefinition**: Available topic information. Attributes: `topic`, `name`, `description`, `availableFilters`, `samplePayload`.
- **WebhookLog**: Delivery log entry. Attributes: `id`, `webhookId`, `webhookName`, `finalStatus`, `callHistory`, `createdAt`.
- **WebhookCall**: Individual delivery attempt. Attributes: `id`, `timestamp`, `status`, `errorMessage`, `httpStatusCode`, `payload`.
- **WebhookTest**: Test result. Attributes: `url`, `webhook`, `samplePayload`.
- **ListWebhooksOptions**: Query parameters for listing webhooks.
- **ListTopicDefinitionsOptions**: Query parameters for listing topic definitions.
- **ListWebhookLogsOptions**: Query parameters for listing webhook logs. The `query` parameter defaults to `{}` if not provided.

### Assumptions

- Webhooks API follows the same pagination pattern established by other APIs in this project.
- The API client will use the existing authentication mechanism (OAuth 2.0 Client Credentials flow) already implemented in the Pax8Client.
- The webhooks API uses API v2 base URL which differs from the v1 base URL used by other endpoints.
- Topic names are case-sensitive strings defined by Pax8.
- Filter operators and field names are defined by the topic definitions.
- Retry requests are fire-and-forget (202 Accepted) and delivery confirmation must be checked via logs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: List webhooks operation completes in under 2 seconds (P95).
- **SC-002**: Create webhook operation completes in under 2 seconds (P95).
- **SC-003**: Get webhook detail operation completes in under 1 second (P95).
- **SC-004**: Update webhook configuration/status operations complete in under 2 seconds (P95).
- **SC-005**: Delete webhook operation completes in under 1 second (P95).
- **SC-006**: Topic management operations complete in under 2 seconds (P95).
- **SC-007**: Get topic definitions completes in under 2 seconds (P95).
- **SC-008**: Test webhook operation completes in under 5 seconds (P95, includes external call).
- **SC-009**: List webhook logs completes in under 2 seconds (P95).
- **SC-010**: Retry delivery operation returns 202 in under 1 second (P95).

### Verification Approach

- Contract tests validate response shapes against OpenAPI schema for all endpoints.
- Integration tests verify end-to-end flows for webhook lifecycle (create → configure → test → view logs → delete).
- Error handling tests confirm consistent error payloads for all error scenarios.
- Pagination tests verify metadata accuracy across multiple pages.

## Out of Scope

- Webhook endpoint implementation (receiving webhook payloads) - this is a client library for managing webhooks only.
- Custom retry policies beyond what Pax8 API supports.
- Webhook payload signature verification (handled by receiving endpoint).
- Real-time webhook event streaming.
