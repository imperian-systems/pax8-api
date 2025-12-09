# Tasks: Usage Summaries API

**Input**: Design documents from `/specs/010-usage-summaries-api/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/usage-summaries.openapi.yaml ✅

**Tests**: Included per TDD requirement in constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and model definitions

- [ ] T001 Create UsageSummary and UsageLine interfaces in `src/models/usage-summaries.ts`
- [ ] T002 [P] Create ListUsageSummariesOptions and ListUsageLinesOptions types in `src/models/usage-summaries.ts`
- [ ] T003 [P] Create UsageSummaryListResponse and UsageLineListResponse types in `src/models/usage-summaries.ts`
- [ ] T004 Add type guards isUsageSummary(), assertUsageSummary(), isUsageLine(), assertUsageLine() in `src/models/usage-summaries.ts`
- [ ] T005 Export usage-summaries types from `src/models/index.ts` (create if needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API class setup that all user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create UsageSummariesApi class skeleton in `src/api/usage-summaries.ts` with constructor accepting client
- [ ] T007 Export UsageSummariesApi from `src/api/index.ts`
- [ ] T008 Add `usageSummaries` property to Pax8Client in `src/client/pax8-client.ts`
- [ ] T009 Export new types from main `src/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - List usage summaries for a subscription (Priority: P1) 🎯 MVP

**Goal**: Partner can retrieve paginated usage summaries for a subscription to view usage-based billing data

**Independent Test**: Call `client.subscriptions.listUsageSummaries(subscriptionId)` with optional pagination/filters; verify response includes usage summary records with pagination metadata

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Contract test for listUsageSummaries in `tests/contract/api/usage-summaries-contract.test.ts` - test valid response structure
- [ ] T011 [P] [US1] Contract test for listUsageSummaries pagination in `tests/contract/api/usage-summaries-contract.test.ts` - test custom page/size params
- [ ] T012 [P] [US1] Contract test for listUsageSummaries filters in `tests/contract/api/usage-summaries-contract.test.ts` - test resourceGroup/companyId filters
- [ ] T013 [P] [US1] Contract test for listUsageSummaries error cases in `tests/contract/api/usage-summaries-contract.test.ts` - test 404/401/422 responses

### Implementation for User Story 1

- [ ] T014 [US1] Add ListUsageSummariesOptions with resourceGroup, companyId, sort, page, size to `src/models/usage-summaries.ts`
- [ ] T015 [US1] Implement listUsageSummaries function in `src/api/subscriptions.ts` - builds query params, calls `/subscriptions/{id}/usage-summaries`
- [ ] T016 [US1] Add listUsageSummaries method to SubscriptionsApi class in `src/api/subscriptions.ts`
- [ ] T017 [US1] Add JSDoc documentation with examples to listUsageSummaries method

**Checkpoint**: User Story 1 complete - `client.subscriptions.listUsageSummaries()` works independently

---

## Phase 4: User Story 2 - View usage summary details (Priority: P2)

**Goal**: Partner can retrieve full details of a specific usage summary by ID

**Independent Test**: Call `client.usageSummaries.get(usageSummaryId)` and verify all required fields present (id, companyId, productId, resourceGroup, vendorName, currentCharges, partnerTotal, currencyCode, isTrial)

### Tests for User Story 2 ⚠️

- [ ] T018 [P] [US2] Contract test for getUsageSummary in `tests/contract/api/usage-summaries-contract.test.ts` - test valid response structure
- [ ] T019 [P] [US2] Contract test for getUsageSummary 404 in `tests/contract/api/usage-summaries-contract.test.ts` - test not found error

### Implementation for User Story 2

- [ ] T020 [US2] Implement getUsageSummary function in `src/api/usage-summaries.ts` - calls `/usage-summaries/{id}`
- [ ] T021 [US2] Add get method to UsageSummariesApi class in `src/api/usage-summaries.ts`
- [ ] T022 [US2] Add JSDoc documentation with examples to get method

**Checkpoint**: User Story 2 complete - `client.usageSummaries.get()` works independently

---

## Phase 5: User Story 3 - List usage summary lines (Priority: P3)

**Goal**: Partner can retrieve detailed usage line items for a summary to see granular usage breakdowns

**Independent Test**: Call `client.usageSummaries.listLines(usageSummaryId, { usageDate: '2024-01-15' })` and verify response returns usage line records with product details, quantities, and charges

### Tests for User Story 3 ⚠️

- [ ] T023 [P] [US3] Contract test for listUsageLines in `tests/contract/api/usage-summaries-contract.test.ts` - test valid response structure with usageDate
- [ ] T024 [P] [US3] Contract test for listUsageLines pagination in `tests/contract/api/usage-summaries-contract.test.ts` - test custom page/size params
- [ ] T025 [P] [US3] Contract test for listUsageLines productId filter in `tests/contract/api/usage-summaries-contract.test.ts` - test optional productId filter
- [ ] T026 [P] [US3] Contract test for listUsageLines missing usageDate in `tests/contract/api/usage-summaries-contract.test.ts` - test 400/422 error when usageDate missing
- [ ] T027 [P] [US3] Contract test for listUsageLines 404 in `tests/contract/api/usage-summaries-contract.test.ts` - test not found error

### Implementation for User Story 3

- [ ] T028 [US3] Add ListUsageLinesOptions with required usageDate, optional productId, page, size to `src/models/usage-summaries.ts`
- [ ] T029 [US3] Implement listUsageLines function in `src/api/usage-summaries.ts` - builds query params, calls `/usage-summaries/{id}/usage-lines`
- [ ] T030 [US3] Add listLines method to UsageSummariesApi class in `src/api/usage-summaries.ts`
- [ ] T031 [US3] Add JSDoc documentation with examples to listLines method

**Checkpoint**: User Story 3 complete - `client.usageSummaries.listLines()` works independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, validation, and final integration

- [ ] T032 [P] Update README.md usage documentation with usage summaries examples
- [ ] T033 [P] Run TypeScript build to verify no type errors (`npm run build`)
- [ ] T034 [P] Run all contract tests (`npm test tests/contract/api/usage-summaries-contract.test.ts`)
- [ ] T035 Run quickstart.md validation - execute example code snippets
- [ ] T036 [P] Create integration test in `tests/integration/api/usage-summaries-flow.test.ts` (optional - requires real API credentials)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Extends SubscriptionsApi
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses UsageSummariesApi
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Uses UsageSummariesApi

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Types/interfaces before functions
- Functions before class methods
- Core implementation before JSDoc

### Parallel Opportunities

- T002, T003 can run in parallel (different type definitions)
- T010, T011, T012, T013 can run in parallel (different test cases)
- T018, T019 can run in parallel (different test cases)
- T023, T024, T025, T026, T027 can run in parallel (different test cases)
- T032, T033, T034, T36 can run in parallel (different validation tasks)

---

## Parallel Example: User Story 1

```bash
# Phase 3 parallel test creation (T010-T013)
# All 4 contract test cases can be written simultaneously

# Then sequential implementation
# T014 → T015 → T016 → T017
```

---

## Implementation Strategy

### MVP Scope

For minimum viable delivery, complete:
1. Phase 1: Setup (T001-T005)
2. Phase 2: Foundational (T006-T009)
3. Phase 3: User Story 1 (T010-T017)

This delivers `client.subscriptions.listUsageSummaries()` - the most critical operation for usage-based billing.

### Incremental Delivery

- **Increment 1 (MVP)**: US1 - List usage summaries for a subscription
- **Increment 2**: US2 - Get usage summary by ID
- **Increment 3**: US3 - List usage lines with date filtering
- **Increment 4**: Polish - Documentation and validation

### File Summary

| File | Tasks | Description |
|------|-------|-------------|
| `src/models/usage-summaries.ts` | T001-T004, T014, T028 | Type definitions |
| `src/models/index.ts` | T005 | Export barrel |
| `src/api/usage-summaries.ts` | T006, T020-T022, T029-T031 | UsageSummariesApi class |
| `src/api/subscriptions.ts` | T015-T017 | listUsageSummaries method |
| `src/api/index.ts` | T007 | Export barrel |
| `src/client/pax8-client.ts` | T008 | Client integration |
| `src/index.ts` | T009 | Main exports |
| `tests/contract/api/usage-summaries-contract.test.ts` | T010-T013, T018-T019, T023-T027 | Contract tests |
| `tests/integration/api/usage-summaries-flow.test.ts` | T036 | Integration tests (optional) |

---

## Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Setup | 5 | 2 |
| Foundational | 4 | 0 |
| User Story 1 | 8 | 4 |
| User Story 2 | 5 | 2 |
| User Story 3 | 9 | 5 |
| Polish | 5 | 4 |
| **Total** | **36** | **17** |

**Independent test criteria for each story**:
- US1: List summaries returns paginated results with page metadata
- US2: Get summary returns complete entity with all required fields
- US3: List lines returns detailed line items when usageDate provided
