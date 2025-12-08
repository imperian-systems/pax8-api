# Tasks: Contacts API

**Input**: Design documents from `/specs/004-contacts-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Confirm toolchain and verify dependencies via `package.json` (Node 22, `npm install`) at repo root

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T002 Create contact domain models (Contact, ContactType, CreateContactRequest, UpdateContactRequest, ContactListResponse, PageMetadata) in `src/models/contacts.ts`
- [ ] T003 [P] Export contact models through `src/models/index.ts`
- [ ] T004 [P] Prepare contacts API module scaffold and exports in `src/api/index.ts` for upcoming methods

**Checkpoint**: Foundation ready — models, types, and exports scaffolded.

---

## Phase 3: User Story 1 - List contacts for a company (Priority: P1) 🎯 MVP

**Goal**: Provide a page-based paginated contacts list for a company with optional pagination parameters.

**Independent Test**: Call list with company ID using default pagination and with custom page/size; verify items, pagination metadata, and response structure.

### Tests for User Story 1 (TDD)

- [ ] T005 [P] [US1] Add contract coverage for `GET /companies/{companyId}/contacts` list endpoint in `tests/contract/api/contacts-contract.test.ts` (200, 401, 404)
- [ ] T006 [P] [US1] Add integration tests for list pagination (default page=1/size=10, custom page/size up to 200), empty results, and unauthorized cases in `tests/integration/api/contacts-flow.test.ts`

### Implementation for User Story 1

- [ ] T007 [P] [US1] Implement `list` method with page-based pagination (default 10, max 200) in `src/api/contacts.ts`
- [ ] T008 [US1] Wire pagination metadata (`page`, `size`, `totalElements`, `totalPages`) and validation limits in `src/api/contacts.ts`
- [ ] T009 [US1] Create ContactsApi class and wire into Pax8Client as `client.contacts` in `src/client/pax8-client.ts`
- [ ] T010 [US1] Export list types and ContactsApi through `src/api/index.ts` and `src/index.ts`

**Checkpoint**: User Story 1 independently testable (list works with pagination, empty results, errors).

---

## Phase 4: User Story 2 - View contact detail (Priority: P2)

**Goal**: Fetch a single contact by ID with all attributes including types array.

**Independent Test**: Request by valid contact ID returns full contact payload with types; invalid ID returns 404 error.

### Tests for User Story 2 (TDD)

- [ ] T011 [P] [US2] Add contract coverage for `GET /companies/{companyId}/contacts/{contactId}` (200, 404, 401) in `tests/contract/api/contacts-contract.test.ts`
- [ ] T012 [P] [US2] Add integration tests for contact detail success and not-found paths in `tests/integration/api/contacts-flow.test.ts`

### Implementation for User Story 2

- [ ] T013 [P] [US2] Implement `get` method with runtime validation using contact models in `src/api/contacts.ts`
- [ ] T014 [US2] Export `get` method through `src/api/index.ts` and `src/index.ts`

**Checkpoint**: User Story 2 independently testable (detail + 404 behavior).

---

## Phase 5: User Story 3 - Create new contact (Priority: P3)

**Goal**: Create a new contact with required fields (firstName, lastName, email) and optional types array, handling primary contact auto-demotion.

**Independent Test**: Create contact returns 201 with generated ID; setting primary=true auto-demotes previous primary for that type.

### Tests for User Story 3 (TDD)

- [ ] T015 [P] [US3] Add contract coverage for `POST /companies/{companyId}/contacts` (201, 400 validation, 401, 404) in `tests/contract/api/contacts-contract.test.ts`
- [ ] T016 [P] [US3] Add integration tests for contact creation, validation errors, and primary contact demotion in `tests/integration/api/contacts-flow.test.ts`

### Implementation for User Story 3

- [ ] T017 [P] [US3] Implement `create` method with CreateContactRequest validation in `src/api/contacts.ts`
- [ ] T018 [US3] Handle types array structure with primary flag per type in `src/api/contacts.ts`
- [ ] T019 [US3] Export `create` method through `src/api/index.ts` and `src/index.ts`

**Checkpoint**: User Story 3 independently testable (create with validation + primary demotion).

---

## Phase 6: User Story 4 - Update existing contact (Priority: P4)

**Goal**: Update contact fields with partial updates (PATCH semantics) including types array modifications.

**Independent Test**: Update single field preserves other fields; update types array with new primary demotes previous.

### Tests for User Story 4 (TDD)

- [ ] T020 [P] [US4] Add contract coverage for `PUT /companies/{companyId}/contacts/{contactId}` (200, 400, 404, 401) in `tests/contract/api/contacts-contract.test.ts`
- [ ] T021 [P] [US4] Add integration tests for partial updates, types array modifications, and not-found paths in `tests/integration/api/contacts-flow.test.ts`

### Implementation for User Story 4

- [ ] T022 [P] [US4] Implement `update` method with UpdateContactRequest validation in `src/api/contacts.ts`
- [ ] T023 [US4] Handle types array updates with primary flag management in `src/api/contacts.ts`
- [ ] T024 [US4] Export `update` method through `src/api/index.ts` and `src/index.ts`

**Checkpoint**: User Story 4 independently testable (update with partial data + types management).

---

## Phase 7: User Story 5 - Delete contact (Priority: P5)

**Goal**: Remove a contact from a company permanently.

**Independent Test**: Delete existing contact returns 204; delete non-existent contact returns 404.

### Tests for User Story 5 (TDD)

- [ ] T025 [P] [US5] Add contract coverage for `DELETE /companies/{companyId}/contacts/{contactId}` (204, 404, 401) in `tests/contract/api/contacts-contract.test.ts`
- [ ] T026 [P] [US5] Add integration tests for contact deletion success and not-found paths in `tests/integration/api/contacts-flow.test.ts`

### Implementation for User Story 5

- [ ] T027 [P] [US5] Implement `delete` method in `src/api/contacts.ts`
- [ ] T028 [US5] Export `delete` method through `src/api/index.ts` and `src/index.ts`

**Checkpoint**: User Story 5 independently testable (delete + 404 handling).

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T029 [P] Verify Contacts API usage examples in `specs/004-contacts-api/quickstart.md`
- [ ] T030 [P] Update `README.md` with Contacts API examples following existing Companies API format
- [ ] T031 Run full validation suite (`npm test && npm run lint && npm run build`) defined in `package.json`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3 → P4 → P5)
  - Or in parallel if team capacity allows (each story is independently testable)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Independent of US1/US2/US3/US4

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Implementation follows test setup
- Export wiring completes the story
- Story complete before moving to next priority

---

## Parallel Execution Examples

### Phase 2 (Foundational)

```bash
# Can run in parallel:
T003: Export contact models through src/models/index.ts
T004: Prepare contacts API module scaffold in src/api/index.ts
```

### User Story 1 (List)

```bash
# Tests can run in parallel:
T005: Contract test for GET /companies/{companyId}/contacts
T006: Integration test for list pagination
```

### User Story 2 (Get)

```bash
# Tests can run in parallel:
T011: Contract test for GET /companies/{companyId}/contacts/{contactId}
T012: Integration test for contact detail
```

### User Story 3 (Create)

```bash
# Tests can run in parallel:
T015: Contract test for POST /companies/{companyId}/contacts
T016: Integration test for contact creation
```

### User Story 4 (Update)

```bash
# Tests can run in parallel:
T020: Contract test for PUT /companies/{companyId}/contacts/{contactId}
T021: Integration test for partial updates
```

### User Story 5 (Delete)

```bash
# Tests can run in parallel:
T025: Contract test for DELETE /companies/{companyId}/contacts/{contactId}
T026: Integration test for contact deletion
```

### Polish Phase

```bash
# Can run in parallel:
T029: Verify quickstart.md examples
T030: Update README.md with Contacts API examples
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (List contacts)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready - users can list contacts

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP - list contacts)
3. Add User Story 2 → Test independently → Deploy (can view contact details)
4. Add User Story 3 → Test independently → Deploy (can create contacts)
5. Add User Story 4 → Test independently → Deploy (can update contacts)
6. Add User Story 5 → Test independently → Deploy (full CRUD complete)
7. Each story adds value without breaking previous stories

### TDD Workflow Per Story

1. Write contract tests (verify against OpenAPI spec)
2. Write integration tests (verify user journeys)
3. Run tests - they should FAIL (no implementation yet)
4. Implement the feature
5. Run tests - they should PASS
6. Wire exports and complete story

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [USn] label maps task to specific user story for traceability
- Page-based pagination differs from Companies API (cursor-based) - use `page` and `size` params
- Contact types use array structure: `types: [{type: 'Admin'|'Billing'|'Technical', primary: boolean}]`
- Primary contact auto-demotion handled server-side per Pax8 API behavior
- 404 returned for unauthorized company access (matches Pax8 API security pattern)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
