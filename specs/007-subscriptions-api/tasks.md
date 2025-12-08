# Tasks: Subscriptions API

**Input**: Design documents from `/specs/007-subscriptions-api/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure working environment and baseline checks before feature work.

- [ ] T001 Install dependencies per `package.json` at repository root (run npm install).
- [ ] T002 Run baseline quality gates via `package.json` scripts (`npm run lint`, `npm test`) to confirm a clean starting state.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core scaffolding and exports required before user story work.

- [ ] T003 [P] Add subscription models and request/response types to `src/models/subscriptions.ts` per contract/spec.
- [ ] T004 Update `src/index.ts` exports to include subscription types (`Subscription`, `SubscriptionStatus`, `BillingTerm`, `UpdateSubscriptionRequest`, `CancelOptions`, `SubscriptionHistory`, `ListSubscriptionsOptions`, `SubscriptionListResponse`).
- [ ] T005 Create `src/api/subscriptions.ts` class scaffold (constructor wiring with client config, placeholders for list/get/update/cancel/getHistory) using existing HTTP utilities.
- [ ] T006 Update `src/api/index.ts` to export `SubscriptionsApi`.
- [ ] T007 Wire `SubscriptionsApi` into `Pax8Client` in `src/client/pax8-client.ts` (instantiate and expose `subscriptions`).

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - List subscriptions with pagination and filters (Priority: P1) 🎯 MVP

**Goal**: Provide paginated subscription listing with filters and sorting.
**Independent Test**: Call list with page/size and optional filters (companyId, productId, status); verify content and pagination metadata.

### Tests for User Story 1 (TDD)
- [ ] T008 [P] [US1] Add contract tests for list subscriptions in `tests/contract/api/subscriptions-contract.test.ts` (200 response, pagination metadata, filters, 422 on size>200).
- [ ] T009 [P] [US1] Add integration flow tests for subscription listing in `tests/integration/api/subscriptions-flow.test.ts` (default page, filtered results, empty set).

### Implementation for User Story 1
- [ ] T010 [P] [US1] Implement `list` method with query params and pagination handling in `src/api/subscriptions.ts`.
- [ ] T011 [US1] Ensure list-related public exports and types are surfaced in `src/index.ts` and `src/api/index.ts` (list options/response typings).

**Checkpoint**: User Story 1 independently testable (MVP).

---

## Phase 4: User Story 2 - View subscription details (Priority: P2)

**Goal**: Retrieve full subscription details by ID with not-found handling.
**Independent Test**: Request subscription by ID; verify fields present; confirm 404 path.

### Tests for User Story 2 (TDD)
- [ ] T012 [P] [US2] Add contract tests for get subscription in `tests/contract/api/subscriptions-contract.test.ts` (200, 404).
- [ ] T013 [P] [US2] Add integration tests for get subscription in `tests/integration/api/subscriptions-flow.test.ts` (happy path, 404).

### Implementation for User Story 2
- [ ] T014 [US2] Implement `get` method in `src/api/subscriptions.ts` for `/subscriptions/{id}` with error handling.

**Checkpoint**: User Story 2 independently testable.

---

## Phase 5: User Story 3 - Update subscription quantity (Priority: P3)

**Goal**: Update subscription quantity with validation.
**Independent Test**: Submit valid quantity update; verify updated subscription; validate errors for invalid quantity or status.

### Tests for User Story 3 (TDD)
- [ ] T015 [P] [US3] Add contract tests for update subscription in `tests/contract/api/subscriptions-contract.test.ts` (200 success, 422 invalid quantity, 404 unknown ID).
- [ ] T016 [P] [US3] Add integration tests for quantity update in `tests/integration/api/subscriptions-flow.test.ts` (successful update, invalid status/quantity paths).

### Implementation for User Story 3
- [ ] T017 [US3] Implement `update` method in `src/api/subscriptions.ts` (PUT `/subscriptions/{id}`) enforcing quantity validation and returning updated subscription.

**Checkpoint**: User Story 3 independently testable.

---

## Phase 6: User Story 4 - Cancel a subscription (Priority: P4)

**Goal**: Cancel subscription immediately or schedule via billingDate, returning 204.
**Independent Test**: Submit cancellation (with/without billingDate); verify 204 and status update.

### Tests for User Story 4 (TDD)
- [ ] T018 [P] [US4] Add contract tests for cancel subscription in `tests/contract/api/subscriptions-contract.test.ts` (204 success, optional billingDate, validation errors for bad dates, 404).
- [ ] T019 [P] [US4] Add integration tests for cancel flow in `tests/integration/api/subscriptions-flow.test.ts` (immediate cancel, scheduled cancel).

### Implementation for User Story 4
- [ ] T020 [US4] Implement `cancel` method in `src/api/subscriptions.ts` (POST `/subscriptions/{id}/cancel`) returning void.

**Checkpoint**: User Story 4 independently testable.

---

## Phase 7: User Story 5 - View subscription history (Priority: P5)

**Goal**: Retrieve subscription change history as an array.
**Independent Test**: Request history by ID; verify array of history records with action/timestamp/quantity deltas; confirm 404 path.

### Tests for User Story 5 (TDD)
- [ ] T021 [P] [US5] Add contract tests for subscription history in `tests/contract/api/subscriptions-contract.test.ts` (200 array payload, 404 unknown ID).
- [ ] T022 [P] [US5] Add integration tests for subscription history in `tests/integration/api/subscriptions-flow.test.ts` (ordered history, empty history case).

### Implementation for User Story 5
- [ ] T023 [US5] Implement `getHistory` method in `src/api/subscriptions.ts` (GET `/subscriptions/{id}/history`) returning `SubscriptionHistory[]`.

**Checkpoint**: User Story 5 independently testable.

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T024 [P] Update `README.md` Subscriptions section with finalized signatures/examples and error notes.
- [ ] T025 [P] Sync `specs/007-subscriptions-api/quickstart.md` with implemented behaviors and examples.
- [ ] T026 Run full `npm test` and `npm run lint` ensuring new contract/integration suites pass.
- [ ] T027 [P] Add JSDoc references to OpenAPI sections for all subscription methods in `src/api/subscriptions.ts`.

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories in priority order (US1 → US2 → US3 → US4 → US5) → Polish.
- User stories may run in parallel after Phase 2 if staffing allows, but delivery order follows priorities above.

## Parallel Execution Examples

- User Story 1: T008 and T009 in parallel (tests), then T010 can start once T008/T009 failing state confirmed.
- User Story 2: T012 and T013 in parallel; T014 after tests in red.
- User Story 3: T015 and T016 in parallel; T017 after tests in red.
- User Story 4: T018 and T019 in parallel; T020 after tests in red.
- User Story 5: T021 and T022 in parallel; T023 after tests in red.
- Cross-story: After Phase 2, different developers can own distinct user stories concurrently.

## Implementation Strategy

- MVP first: Complete Phases 1-2, deliver US1 (list) with tests, validate independently.
- Incremental: Add US2→US3→US4→US5 sequentially, testing each story independently before moving on.
- Resilience/quality: Maintain TDD (contracts + integration) before implementation; reuse shared HTTP retry/rate-limit utilities and existing pagination patterns.
