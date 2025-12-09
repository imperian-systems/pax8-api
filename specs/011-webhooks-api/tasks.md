# Tasks: Webhooks API

**Input**: Design documents from `/specs/011-webhooks-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm prerequisites and test scaffolding alignment

- [ ] T001 Review requirements checklist in `specs/011-webhooks-api/checklists/requirements.md` to capture gating constraints for webhooks API scope.
- [ ] T002 Align package test scripts for contract/integration coverage in `package.json` (add/update webhooks-specific test targets if missing).
- [ ] T003 [P] Ensure `vitest.config.ts` includes the webhooks contract path `specs/011-webhooks-api/contracts/webhooks.openapi.yaml` in test include/glob configuration.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, API wiring, and test harness required by all user stories

- [ ] T004 Create webhooks entities and option types (Webhook, WebhookTopic, Filter, WebhookLog, TopicDefinition, paged results, list/log options) in `src/models/webhooks.ts` per `data-model.md` and `webhooks.openapi.yaml`.
- [ ] T005 Export webhooks models/types from `src/index.ts` to surface SDK typings.
- [ ] T006 Implement `WebhooksApi` class scaffold with v2 base URL wiring and shared request helpers in `src/api/webhooks.ts`.
- [ ] T007 Update `src/api/index.ts` to export `WebhooksApi` for consumers.
- [ ] T008 Add `webhooks` client instance to `Pax8Client` in `src/client/pax8-client.ts` configured for the v2 base path.
- [ ] T009 Confirm/reuse rate-limit retry and base URL handling for v2 endpoints in `src/http/api-utils.ts` (extend if needed for webhooks).
- [ ] T010 [P] Create contract test harness file `tests/contract/api/webhooks.test.ts` loading `specs/011-webhooks-api/contracts/webhooks.openapi.yaml` with shared setup.
- [ ] T011 [P] Create integration test harness file `tests/integration/api/webhooks.test.ts` with Pax8Client bootstrap for v2 endpoints.

---

## Phase 3: User Story 1 - List webhooks with filters (Priority: P1) 🎯 MVP

**Goal**: Partners can list webhooks with pagination, filters (active, topic, status, accountId, query), and sort.
**Independent Test**: Call list endpoint with page/size and filters; verify paged webhook results with correct metadata and empty-list handling.

### Tests for User Story 1 (required)

- [ ] T012 [P] [US1] Add contract tests for `GET /webhooks` pagination/filters/sort in `tests/contract/api/webhooks.test.ts`.
- [ ] T013 [P] [US1] Add integration tests for `listWebhooks` covering default page, active/topic/status filters, and empty results in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 1

- [ ] T014 [US1] Implement `listWebhooks` with query options, max size 200 enforcement, and pagination mapping in `src/api/webhooks.ts`.

---

## Phase 4: User Story 2 - Create and configure webhooks (Priority: P1) 🎯 MVP

**Goal**: Partners can create webhooks with required displayName and optional configuration.
**Independent Test**: Submit valid create payload and receive created webhook with id; validation errors for missing displayName, invalid url, or errorThreshold >20.

### Tests for User Story 2

- [ ] T015 [P] [US2] Add contract tests for `POST /webhooks` success and validation (displayName required, url format, errorThreshold max 20) in `tests/contract/api/webhooks.test.ts`.
- [ ] T016 [P] [US2] Add integration tests for `createWebhook` covering minimal/full payloads and validation errors in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 2

- [ ] T017 [US2] Implement `createWebhook` with `CreateWebhook` typing, defaults (active, webhookTopics, errorThreshold), and validation handling in `src/api/webhooks.ts`.

---

## Phase 5: User Story 3 - View webhook details (Priority: P2)

**Goal**: Partners can fetch webhook details by ID including topics, configuration, and timestamps.
**Independent Test**: Request webhook by ID; receive full entity or not-found error payload when missing.

### Tests for User Story 3

- [ ] T018 [P] [US3] Add contract tests for `GET /webhooks/{id}` success and not-found responses in `tests/contract/api/webhooks.test.ts`.
- [ ] T019 [P] [US3] Add integration tests for `getWebhook` including webhookTopics and timestamps in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 3

- [ ] T020 [US3] Implement `getWebhook` with 404 error mapping in `src/api/webhooks.ts`.

---

## Phase 6: User Story 4 - Update webhook configuration (Priority: P2)

**Goal**: Partners can update webhook configuration fields (displayName, url, authorization, contactEmail, errorThreshold).
**Independent Test**: Submit partial/full configuration update and receive updated webhook; validation error when errorThreshold >20 or empty payload.

### Tests for User Story 4

- [ ] T021 [P] [US4] Add contract tests for `POST /webhooks/{id}/configuration` success and validation in `tests/contract/api/webhooks.test.ts`.
- [ ] T022 [P] [US4] Add integration tests for `updateWebhookConfiguration` covering partial updates and empty-body no-op behavior in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 4

- [ ] T023 [US4] Implement `updateWebhookConfiguration` handling partial payloads and validation in `src/api/webhooks.ts`.

---

## Phase 7: User Story 5 - Update webhook status (Priority: P2)

**Goal**: Partners can enable or disable a webhook via active flag.
**Independent Test**: Submit status update and receive webhook with updated active state.

### Tests for User Story 5

- [ ] T024 [P] [US5] Add contract tests for `POST /webhooks/{id}/status` toggling active true/false in `tests/contract/api/webhooks.test.ts`.
- [ ] T025 [P] [US5] Add integration tests for `updateWebhookStatus` enabling/disabling in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 5

- [ ] T026 [US5] Implement `updateWebhookStatus` handling active flag updates in `src/api/webhooks.ts`.

---

## Phase 8: User Story 6 - Delete webhook (Priority: P3)

**Goal**: Partners can delete a webhook and receive 204 response.
**Independent Test**: Delete valid webhook returns 204; subsequent fetch yields 404.

### Tests for User Story 6

- [ ] T027 [P] [US6] Add contract tests for `DELETE /webhooks/{id}` success and not-found responses in `tests/contract/api/webhooks.test.ts`.
- [ ] T028 [P] [US6] Add integration tests for `deleteWebhook` verifying 204 and post-delete 404 in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 6

- [ ] T029 [US6] Implement `deleteWebhook` returning void on 204 in `src/api/webhooks.ts`.

---

## Phase 9: User Story 7 - Manage webhook topics (Priority: P3)

**Goal**: Partners can add, replace, remove, and update topics/filters on a webhook.
**Independent Test**: Add topic, replace all topics, remove a topic, and update topic filters with correct responses and duplicate-topic errors.

### Tests for User Story 7

- [ ] T030 [P] [US7] Add contract tests for topic endpoints (add/replace/remove/update configuration) including duplicate topic errors in `tests/contract/api/webhooks.test.ts`.
- [ ] T031 [P] [US7] Add integration tests for topic management flows (add, replace, remove, update filters) in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 7

- [ ] T032 [US7] Implement `addWebhookTopic` using `AddWebhookTopic` schema in `src/api/webhooks.ts`.
- [ ] T033 [US7] Implement `replaceWebhookTopics` with full replacement semantics in `src/api/webhooks.ts`.
- [ ] T034 [US7] Implement `removeWebhookTopic` returning void on 204 in `src/api/webhooks.ts`.
- [ ] T035 [US7] Implement `updateWebhookTopicConfiguration` handling filters payload in `src/api/webhooks.ts`.
- [ ] T036 [US7] Add duplicate topic guard/validation for topic mutations in `src/api/webhooks.ts` per FR-011.

---

## Phase 10: User Story 8 - Get topic definitions (Priority: P3)

**Goal**: Partners can retrieve available topic definitions with filters, descriptions, and sample payloads.
**Independent Test**: Request topic definitions with pagination/search/topic filters; receive paged definitions with metadata.

### Tests for User Story 8

- [ ] T037 [P] [US8] Add contract tests for `GET /webhooks/topic-definitions` with pagination/search/topic filters in `tests/contract/api/webhooks.test.ts`.
- [ ] T038 [P] [US8] Add integration tests for `getTopicDefinitions` verifying filters and metadata in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 8

- [ ] T039 [US8] Implement `getTopicDefinitions` with `ListTopicDefinitionsOptions` mapping in `src/api/webhooks.ts`.

---

## Phase 11: User Story 9 - Test webhook delivery (Priority: P4)

**Goal**: Partners can send test events to a webhook for any topic.
**Independent Test**: Test request returns URL called, webhook config, and sample payload; errors propagate for invalid webhook IDs.

### Tests for User Story 9

- [ ] T040 [P] [US9] Add contract tests for `POST /webhooks/{id}/topics/{topic}/test` success and invalid webhook handling in `tests/contract/api/webhooks.test.ts`.
- [ ] T041 [P] [US9] Add integration tests for `testWebhookTopic` returning sample payload regardless of subscription in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 9

- [ ] T042 [US9] Implement `testWebhookTopic` handling topic path param and response mapping in `src/api/webhooks.ts`.

---

## Phase 12: User Story 10 - View webhook logs (Priority: P4)

**Goal**: Partners can list webhook logs with filters and fetch individual logs with call history.
**Independent Test**: List logs with topic/status/date filters returns paged entries; fetch log by ID returns full call history or not-found.

### Tests for User Story 10

- [ ] T043 [P] [US10] Add contract tests for `GET /webhooks/{webhookId}/logs` and `GET /webhooks/{webhookId}/logs/{id}` covering filters and default `query {}` in `tests/contract/api/webhooks.test.ts`.
- [ ] T044 [P] [US10] Add integration tests for `listWebhookLogs`/`getWebhookLog` covering pagination, filters, and not-found in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 10

- [ ] T045 [US10] Implement `listWebhookLogs` with default `query {}` and filter params in `src/api/webhooks.ts`.
- [ ] T046 [US10] Implement `getWebhookLog` for log detail retrieval in `src/api/webhooks.ts`.

---

## Phase 13: User Story 11 - Retry failed webhook delivery (Priority: P5)

**Goal**: Partners can retry a failed webhook delivery and receive 202 accepted.
**Independent Test**: Retry request for failed log returns 202; invalid log or succeeded log returns appropriate error.

### Tests for User Story 11

- [ ] T047 [P] [US11] Add contract tests for `POST /webhooks/{webhookId}/logs/{logId}/retry` success and error cases in `tests/contract/api/webhooks.test.ts`.
- [ ] T048 [P] [US11] Add integration tests for `retryWebhookDelivery` returning 202 and surfacing 400 for non-failed entries in `tests/integration/api/webhooks.test.ts`.

### Implementation for User Story 11

- [ ] T049 [US11] Implement `retryWebhookDelivery` returning 202 responses in `src/api/webhooks.ts`.

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, DX, and consistency improvements

- [ ] T050 [P] Refresh quickstart examples and parameter defaults in `specs/011-webhooks-api/quickstart.md` to match final API signatures.
- [ ] T051 Add JSDoc and consistent error mapping for v2 webhooks endpoints in `src/api/webhooks.ts` (align with `src/errors/pax8-error.ts`).
- [ ] T052 Update `README.md` API surface section to include `WebhooksApi` usage and v2 base URL note.

---

## Dependencies & Execution Order

- Phase order: Setup (P1) → Foundational (P2) → US1 (P1) → US2 (P1) → US3 (P2) → US4 (P2) → US5 (P2) → US6 (P3) → US7 (P3) → US8 (P3) → US9 (P4) → US10 (P4) → US11 (P5) → Polish.
- Story dependencies: All user stories depend on Foundational completion. US1 and US2 (both P1) can proceed in parallel after Foundational; P2 stories can start after P1 stories stabilize; P3+ can begin once shared entities/methods exist but should validate against earlier stories to avoid regressions.

## Parallel Execution Examples

- US1: Run T012 and T013 in parallel while T014 waits on both tests to define contract behavior.
- US2: Run T015 and T016 in parallel; start T017 once validations from tests are set.
- US7: Run T030 and T031 in parallel; then execute T032–T036 sequentially in `src/api/webhooks.ts`.
- Cross-story: After Foundational, one developer can focus on US1/US2 while another tackles US7 topic flows; coordination via shared `src/api/webhooks.ts` ownership.

## Implementation Strategy

- MVP first: Complete Phases 1–3–4 (Setup, Foundational, US1, US2) then validate list/create flows end-to-end.
- Incremental layering: Add P2 stories (US3–US5) to complete CRUD, then P3 topic management/definitions, followed by P4 test/logs and P5 retry.
- Test-first: For each story, author contract/integration tests (T0xx) before implementing API methods to ensure adherence to `webhooks.openapi.yaml` and spec acceptance criteria.
