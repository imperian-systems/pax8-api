# Tasks: Companies API

**Input**: Design documents from `/specs/003-companies-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Confirm toolchain and install dependencies via `package.json` (Node 22, `npm install`) at repo root

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 Create company domain models and runtime validation helpers in `src/models/companies.ts`
- [X] T003 [P] Add cursor pagination helper utilities in `src/pagination/cursor.ts`
- [X] T004 [P] Prepare companies API module scaffold and exports in `src/api/index.ts` for upcoming methods

**Checkpoint**: Foundation ready — models, cursor helpers, and exports scaffolded.

---

## Phase 3: User Story 1 - Retrieve companies list (Priority: P1) 🎯 MVP

**Goal**: Provide a cursor-paginated companies list with filters and default sorting.

**Independent Test**: Call list with default pagination and with filters; verify items, pagination metadata, and sorting.

### Tests for User Story 1 (TDD)

- [ ] T005 [P] [US1] Add contract coverage for `GET /companies` list endpoint in `tests/contract/api/companies-contract.test.ts` (200, 400 validation, 401)
- [ ] T006 [P] [US1] Add integration tests for list pagination, filters, and unauthorized cases in `tests/integration/api/companies-flow.test.ts`

### Implementation for User Story 1

- [ ] T007 [P] [US1] Implement `listCompanies` with filters (status, region, updatedSince), sorting, and cursor pagination in `src/api/companies.ts`
- [ ] T008 [US1] Wire pagination metadata (`nextPageToken`, `prevPageToken`, `limit`, `hasMore`) and validation limits (default 50, max 100) in `src/api/companies.ts`
- [ ] T009 [US1] Export list types and `listCompanies` through `src/api/index.ts` and `src/index.ts`

**Checkpoint**: User Story 1 independently testable (list works with pagination, filters, errors).

---

## Phase 4: User Story 2 - View company detail (Priority: P2)

**Goal**: Fetch a single company by ID with required attributes and not-found handling.

**Independent Test**: Request by valid ID returns full company payload; invalid ID returns not-found error.

### Tests for User Story 2 (TDD)

- [ ] T010 [P] [US2] Add contract coverage for `GET /companies/{companyId}` (200, 404, 401) in `tests/contract/api/companies-contract.test.ts`
- [ ] T011 [P] [US2] Add integration tests for company detail success and not-found paths in `tests/integration/api/companies-flow.test.ts`

### Implementation for User Story 2

- [ ] T012 [P] [US2] Implement `getCompany` with runtime validation using company models in `src/api/companies.ts`
- [ ] T013 [US2] Export `getCompany` through `src/api/index.ts` and `src/index.ts`

**Checkpoint**: User Story 2 independently testable (detail + 404 behavior).

---

## Phase 5: User Story 3 - Search companies (Priority: P3)

**Goal**: Search companies by partial name or domain with relevance ordering.

**Independent Test**: Partial name returns ranked results within limits; no matches returns empty set with pagination metadata.

### Tests for User Story 3 (TDD)

- [ ] T014 [P] [US3] Add contract coverage for `GET /companies/search` (200, 400 query length, 401) in `tests/contract/api/companies-contract.test.ts`
- [ ] T015 [P] [US3] Add integration tests for search relevance and empty results in `tests/integration/api/companies-flow.test.ts`

### Implementation for User Story 3

- [ ] T016 [P] [US3] Implement `searchCompanies` with query validation (2-256 chars) and cursor pagination in `src/api/companies.ts`
- [ ] T017 [US3] Export `searchCompanies` through `src/api/index.ts` and `src/index.ts`

**Checkpoint**: User Story 3 independently testable (search with relevance + empty result handling).

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T018 [P] Add or update Companies API usage examples in `specs/003-companies-api/quickstart.md` and `README.md`
- [ ] T019 Run full validation suite (`npm test && npm run lint && npm run build`) defined in `package.json`

---

## Dependencies & Execution Order

- Setup (Phase 1) → Foundational (Phase 2) → User Stories (Phases 3-5) → Polish (Phase 6)
- User stories depend on Phase 2 completion but can proceed in priority order (P1 → P2 → P3) or in parallel after Phase 2.

## Parallel Execution Examples

- Foundational: T003 and T004 can run in parallel.
- US1: T005 and T006 can run in parallel before T007–T009.
- US2: T010 and T011 can run in parallel before T012–T013.
- US3: T014 and T015 can run in parallel before T016–T017.
- Polish: T018 can run in parallel with T019 after story completion.

## Implementation Strategy

- MVP first: deliver Phase 3 (US1) after Foundations, then layer US2 and US3.
- TDD: create contract/integration tests per story before implementing endpoints.
- Keep exports centralized via `src/api/index.ts` and `src/index.ts` to avoid breakage.
