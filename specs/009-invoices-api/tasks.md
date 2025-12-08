# Tasks: Invoices API

**Input**: Design documents from `/specs/009-invoices-api/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Review feature scope and acceptance in `specs/009-invoices-api/spec.md`
- [ ] T002 Validate contract draft alignment with README surface in `specs/009-invoices-api/contracts/invoices.openapi.yaml`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 Create invoices domain models and enums in `src/models/invoices.ts`
- [ ] T004 Export invoices models in public barrel `src/index.ts`
- [ ] T005 Create invoices API class scaffold with method stubs in `src/api/invoices.ts`
- [ ] T006 Add invoices API export to `src/api/index.ts`
- [ ] T007 Wire invoices API property on `Pax8Client` in `src/client/pax8-client.ts`

---

## Phase 3: User Story 1 - List invoices with pagination and filters (Priority: P1) 🎯 MVP

**Goal**: Provide paginated invoice listing with optional `companyId` filter using page/size.
**Independent Test**: Call `client.invoices.list({ companyId, page, size })` and verify page metadata and filtered content.

### Tests (write first)
- [ ] T008 [US1] Add contract tests for `listInvoices` (page, size, companyId, validation errors) in `tests/contract/api/invoices-contract.test.ts`
- [ ] T009 [US1] Add integration flow test for invoice listing pagination/filtering in `tests/integration/api/invoices-flow.test.ts`

### Implementation
- [ ] T010 [US1] Implement `list` method and request typing in `src/api/invoices.ts` using page-based pagination and optional `companyId`

**Checkpoint**: Invoice listing returns paginated data with correct metadata and filtering.

---

## Phase 4: User Story 2 - View invoice details (Priority: P2)

**Goal**: Retrieve a single invoice by ID with totals, dates, status, and company reference.
**Independent Test**: Request `client.invoices.get(id)`; verify full invoice shape and not-found handling.

### Tests (write first)
- [ ] T011 [US2] Extend contract tests for `getInvoice` success/not-found cases in `tests/contract/api/invoices-contract.test.ts`
- [ ] T012 [US2] Extend integration test for invoice detail and 404 path in `tests/integration/api/invoices-flow.test.ts`

### Implementation
- [ ] T013 [US2] Implement `get` method and error mapping in `src/api/invoices.ts`

**Checkpoint**: Invoice detail retrieval works with clear errors for unknown IDs.

---

## Phase 5: User Story 3 - List invoice line items (Priority: P3)

**Goal**: Provide paginated line items for a given invoice with product, quantity, and amount details.
**Independent Test**: Call `client.invoices.listItems(invoiceId, { page, size })`; verify items and page metadata.

### Tests (write first)
- [ ] T014 [US3] Add contract tests for `listInvoiceItems` (pagination, validation) in `tests/contract/api/invoices-contract.test.ts`
- [ ] T015 [US3] Add integration test for invoice items pagination in `tests/integration/api/invoices-flow.test.ts`

### Implementation
- [ ] T016 [US3] Implement `listItems` method and response typing in `src/api/invoices.ts`

**Checkpoint**: Invoice items listing returns correct items and pagination metadata.

---

## Phase 6: User Story 4 - List draft invoice items (Priority: P4)

**Goal**: Provide paginated draft invoice items for a company to preview upcoming charges.
**Independent Test**: Call `client.invoices.listDraftItems(companyId, { page, size })`; verify draft items and pagination.

### Tests (write first)
- [ ] T017 [US4] Add contract tests for `listDraftInvoiceItems` path/company validation in `tests/contract/api/invoices-contract.test.ts`
- [ ] T018 [US4] Add integration test for draft items pagination and empty results in `tests/integration/api/invoices-flow.test.ts`

### Implementation
- [ ] T019 [US4] Implement `listDraftItems` method and request typing in `src/api/invoices.ts`

**Checkpoint**: Draft invoice items listing works with proper pagination and company scoping.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T020 [P] Update invoices quickstart examples after implementation in `specs/009-invoices-api/quickstart.md`
- [ ] T021 [P] Verify README Invoices section matches implemented behavior in `README.md`
- [ ] T022 Run full lint + contract/integration test suite via scripts in `package.json`

---

## Dependencies & Execution Order

- Foundational (Phase 2) blocks all user stories (Phases 3-6).
- User Story order by priority: US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4); stories can run in parallel after foundational but must keep tests-first per story.
- Polish (Phase 7) depends on completion of targeted user stories.

## Parallel Execution Examples

- After Foundational: different developers can tackle US1–US4 in parallel since they touch separate method paths within `src/api/invoices.ts` and distinct test scopes.
- Within US1: contract tests (T008) and integration tests (T009) can be authored in parallel; implementation (T010) follows once tests are in place.
- Within US3/US4: item vs draft item tasks (T014–T019) touch different test sections but share `src/api/invoices.ts`; coordinate merge timing to avoid conflicts.

## Implementation Strategy

- MVP scope = User Story 1 (listing invoices). Complete Phases 1–3, run tests, and validate independently.
- Incremental delivery: Add US2 → US3 → US4, each with tests-first and independent validation checkpoints.
- Keep runtime deps at zero; reuse existing HTTP/retry utilities; ensure exports in `src/api/index.ts`, `src/client/pax8-client.ts`, and `src/index.ts` to surface the new API.
