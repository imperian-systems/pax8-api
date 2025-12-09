# Tasks: Quotes API

**Input**: Design documents from `/specs/011-quotes-api/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: TDD required per constitution - contract tests before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure and v2 API support

- [ ] T001 Add v2 pagination validators (validateLimit, validateV2Page) to src/http/api-utils.ts
- [ ] T002 [P] Create Quote model types in src/models/quotes.ts (Quote, QuoteStatus, LineItem, BillingTerm, InvoiceTotals, AmountCurrency, Product, ProductType, ClientDetails, PartnerDetails, AcceptedBy, Attachment, UsageBased, UsageBasedType, CommitmentTerm, LineItemRelationship)
- [ ] T003 [P] Create Quote response types in src/models/quotes.ts (QuoteListResponse, QuoteStatusCounts, V2PageInfo)
- [ ] T004 [P] Create Quote payload types in src/models/quotes.ts (CreateQuotePayload, UpdateQuotePayload, ListQuotesOptions)
- [ ] T005 [P] Create Line Item payload types in src/models/quotes.ts (AddLineItemPayload discriminated union: AddStandardLineItemPayload, AddCustomLineItemPayload, AddUsageBasedLineItemPayload, UpdateLineItemPayload, BulkDeleteLineItemsPayload)
- [ ] T006 [P] Create Section types in src/models/quotes.ts (Section, SectionLineItem, CreateSectionPayload, UpdateSectionsPayload, UpdateSectionItem)
- [ ] T007 [P] Create Access List types in src/models/quotes.ts (AccessListEntry, AddAccessListPayload)
- [ ] T008 [P] Create QuotePreferences types in src/models/quote-preferences.ts (QuotePreferences, UpdateQuotePreferencesPayload)
- [ ] T009 [P] Create Quote error types in src/models/quotes.ts (QuoteErrorType, QuoteApiError, QuoteErrorDetail)
- [ ] T010 [P] Create type guards in src/models/quotes.ts (isQuote, assertQuote, isQuoteListResponse, assertQuoteListResponse, isStandardLineItem, isCustomLineItem, isUsageBasedLineItem)
- [ ] T011 [P] Create quote constants in src/models/quotes.ts (DEFAULT_LIMIT, MIN_LIMIT, MAX_LIMIT, MAX_LINE_ITEMS_PER_QUOTE, MAX_NOTE_LENGTH, MAX_PRODUCT_NAME_LENGTH, MAX_PRODUCT_SKU_LENGTH)
- [ ] T012 Export quote models from src/models/index.ts (if exists) or src/index.ts
- [ ] T013 Export quote-preferences models from src/models/index.ts (if exists) or src/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T014 Create QuotesApi class skeleton in src/api/quotes.ts with constructor accepting Pax8Client
- [ ] T015 [P] Create QuotePreferencesApi class skeleton in src/api/quote-preferences.ts with constructor accepting Pax8Client
- [ ] T016 Add quotes property (QuotesApi instance) to Pax8Client in src/client/pax8-client.ts
- [ ] T017 Add quotePreferences property (QuotePreferencesApi instance) to Pax8Client in src/client/pax8-client.ts
- [ ] T018 Export QuotesApi and QuotePreferencesApi from src/api/index.ts
- [ ] T019 Export QuotesApi and QuotePreferencesApi from src/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Manage Quote Lifecycle (Priority: P1) 🎯 MVP

**Goal**: Partner/integrator creates, retrieves, updates, and deletes quotes to generate sales proposals

**Independent Test**: Call quote creation with a clientId, retrieve the created quote by ID, update quote details, and delete the quote; verify all CRUD operations work correctly with proper response structures.

### Contract Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T020 [P] [US1] Contract test for POST /v2/quotes (createQuote) in tests/contract/api/quotes-contract.test.ts
- [ ] T021 [P] [US1] Contract test for GET /v2/quotes (listQuotes) in tests/contract/api/quotes-contract.test.ts
- [ ] T022 [P] [US1] Contract test for GET /v2/quotes/{quoteId} (getQuote) in tests/contract/api/quotes-contract.test.ts
- [ ] T023 [P] [US1] Contract test for PUT /v2/quotes/{quoteId} (updateQuote) in tests/contract/api/quotes-contract.test.ts
- [ ] T024 [P] [US1] Contract test for DELETE /v2/quotes/{quoteId} (deleteQuote) in tests/contract/api/quotes-contract.test.ts

### Implementation for User Story 1

- [ ] T025 [US1] Implement create(payload: CreateQuotePayload): Promise<Quote> in src/api/quotes.ts using POST /v2/quotes
- [ ] T026 [US1] Implement list(options?: ListQuotesOptions): Promise<QuoteListResponse> in src/api/quotes.ts using GET /v2/quotes with v2 pagination (limit/page)
- [ ] T027 [US1] Implement get(quoteId: string): Promise<Quote> in src/api/quotes.ts using GET /v2/quotes/{quoteId}
- [ ] T028 [US1] Implement update(quoteId: string, payload: UpdateQuotePayload): Promise<Quote> in src/api/quotes.ts using PUT /v2/quotes/{quoteId}
- [ ] T029 [US1] Implement delete(quoteId: string): Promise<void> in src/api/quotes.ts using DELETE /v2/quotes/{quoteId}
- [ ] T030 [US1] Add JSDoc documentation to all User Story 1 methods in src/api/quotes.ts

**Checkpoint**: User Story 1 complete - quote CRUD operations work independently

---

## Phase 4: User Story 2 - Manage Quote Line Items (Priority: P2)

**Goal**: Partner/integrator adds, updates, and removes line items from a quote (Standard, Custom, UsageBased types)

**Independent Test**: Create a quote, add line items of different types (Standard, Custom, UsageBased), update line item quantities/prices, delete individual and bulk line items; verify all line item operations work correctly.

### Contract Tests for User Story 2

- [ ] T031 [P] [US2] Contract test for POST /v2/quotes/{quoteId}/line-items (addLineItems - Standard type) in tests/contract/api/quotes-contract.test.ts
- [ ] T032 [P] [US2] Contract test for POST /v2/quotes/{quoteId}/line-items (addLineItems - Custom type) in tests/contract/api/quotes-contract.test.ts
- [ ] T033 [P] [US2] Contract test for POST /v2/quotes/{quoteId}/line-items (addLineItems - UsageBased type) in tests/contract/api/quotes-contract.test.ts
- [ ] T034 [P] [US2] Contract test for PUT /v2/quotes/{quoteId}/line-items (updateLineItems) in tests/contract/api/quotes-contract.test.ts
- [ ] T035 [P] [US2] Contract test for DELETE /v2/quotes/{quoteId}/line-items/{lineItemId} (deleteLineItem) in tests/contract/api/quotes-contract.test.ts
- [ ] T036 [P] [US2] Contract test for POST /v2/quotes/{quoteId}/line-items/bulk-delete (bulkDeleteLineItems) in tests/contract/api/quotes-contract.test.ts

### Implementation for User Story 2

- [ ] T037 [US2] Implement addLineItems(quoteId: string, lineItems: AddLineItemPayload[]): Promise<Quote> in src/api/quotes.ts using POST /v2/quotes/{quoteId}/line-items
- [ ] T038 [US2] Implement updateLineItems(quoteId: string, lineItems: UpdateLineItemPayload[]): Promise<Quote> in src/api/quotes.ts using PUT /v2/quotes/{quoteId}/line-items
- [ ] T039 [US2] Implement deleteLineItem(quoteId: string, lineItemId: string): Promise<void> in src/api/quotes.ts using DELETE /v2/quotes/{quoteId}/line-items/{lineItemId}
- [ ] T040 [US2] Implement bulkDeleteLineItems(quoteId: string, payload: BulkDeleteLineItemsPayload): Promise<void> in src/api/quotes.ts using POST /v2/quotes/{quoteId}/line-items/bulk-delete
- [ ] T041 [US2] Add JSDoc documentation to all User Story 2 methods in src/api/quotes.ts

**Checkpoint**: User Story 2 complete - line item management works independently

---

## Phase 5: User Story 3 - Manage Quote Sections (Priority: P3)

**Goal**: Partner/integrator organizes line items into named sections within a quote for better presentation

**Independent Test**: Create sections within a quote, update section names and ordering, assign line items to sections; verify sections organize line items correctly.

### Contract Tests for User Story 3

- [ ] T042 [P] [US3] Contract test for GET /v2/quotes/{quoteId}/sections (getSections) in tests/contract/api/quotes-contract.test.ts
- [ ] T043 [P] [US3] Contract test for POST /v2/quotes/{quoteId}/sections (createSection) in tests/contract/api/quotes-contract.test.ts
- [ ] T044 [P] [US3] Contract test for PUT /v2/quotes/{quoteId}/sections (updateSections) in tests/contract/api/quotes-contract.test.ts

### Implementation for User Story 3

- [ ] T045 [US3] Implement getSections(quoteId: string): Promise<Section[]> in src/api/quotes.ts using GET /v2/quotes/{quoteId}/sections
- [ ] T046 [US3] Implement createSection(quoteId: string, payload: CreateSectionPayload): Promise<Section[]> in src/api/quotes.ts using POST /v2/quotes/{quoteId}/sections
- [ ] T047 [US3] Implement updateSections(quoteId: string, payload: UpdateSectionsPayload): Promise<Section[]> in src/api/quotes.ts using PUT /v2/quotes/{quoteId}/sections
- [ ] T048 [US3] Add JSDoc documentation to all User Story 3 methods in src/api/quotes.ts

**Checkpoint**: User Story 3 complete - section management works independently

---

## Phase 6: User Story 4 - Manage Quote Access List (Priority: P4)

**Goal**: Partner/integrator shares quotes with customers by managing an access list of email recipients

**Independent Test**: Add email recipients to a quote's access list, retrieve the access list, remove entries; verify access control works correctly.

### Contract Tests for User Story 4

- [ ] T049 [P] [US4] Contract test for GET /v2/quotes/{quoteId}/access-list (getAccessList) in tests/contract/api/quotes-contract.test.ts
- [ ] T050 [P] [US4] Contract test for POST /v2/quotes/{quoteId}/access-list (addAccessListEntries) in tests/contract/api/quotes-contract.test.ts
- [ ] T051 [P] [US4] Contract test for DELETE /v2/quotes/{quoteId}/access-list/{accessListEntryId} (deleteAccessListEntry) in tests/contract/api/quotes-contract.test.ts

### Implementation for User Story 4

- [ ] T052 [US4] Implement getAccessList(quoteId: string): Promise<AccessListEntry[]> in src/api/quotes.ts using GET /v2/quotes/{quoteId}/access-list
- [ ] T053 [US4] Implement addAccessListEntries(quoteId: string, payload: AddAccessListPayload): Promise<AccessListEntry[]> in src/api/quotes.ts using POST /v2/quotes/{quoteId}/access-list
- [ ] T054 [US4] Implement deleteAccessListEntry(quoteId: string, accessListEntryId: string): Promise<void> in src/api/quotes.ts using DELETE /v2/quotes/{quoteId}/access-list/{accessListEntryId}
- [ ] T055 [US4] Add JSDoc documentation to all User Story 4 methods in src/api/quotes.ts

**Checkpoint**: User Story 4 complete - access list management works independently

---

## Phase 7: User Story 5 - Manage Quote Preferences (Priority: P5)

**Goal**: Partner/integrator configures default settings for quotes (expiration days, intro message, terms)

**Independent Test**: Retrieve current preferences, update preferences with new values; verify preferences are persisted and returned correctly.

### Contract Tests for User Story 5

- [ ] T056 [P] [US5] Contract test for GET /v2/quote-preferences (getPreferences) in tests/contract/api/quote-preferences-contract.test.ts
- [ ] T057 [P] [US5] Contract test for PUT /v2/quote-preferences (updatePreferences) in tests/contract/api/quote-preferences-contract.test.ts

### Implementation for User Story 5

- [ ] T058 [US5] Implement get(): Promise<QuotePreferences> in src/api/quote-preferences.ts using GET /v2/quote-preferences
- [ ] T059 [US5] Implement update(payload: UpdateQuotePreferencesPayload): Promise<QuotePreferences> in src/api/quote-preferences.ts using PUT /v2/quote-preferences
- [ ] T060 [US5] Add JSDoc documentation to all User Story 5 methods in src/api/quote-preferences.ts

**Checkpoint**: User Story 5 complete - quote preferences work independently

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T061 [P] Update README.md with Quotes API usage examples
- [ ] T062 [P] Add integration test for full quote lifecycle flow in tests/integration/api/quotes-flow.test.ts (optional if real API creds available)
- [ ] T063 Run quickstart.md validation - verify all code examples work correctly
- [ ] T064 Verify all exports are properly exposed from src/index.ts

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (uses quote from US1 but tested independently with mock)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - No dependencies on other stories (separate API class)

### Within Each User Story

- Contract tests MUST be written and FAIL before implementation
- Implementation before documentation
- Story complete before moving to next priority (or parallel if team capacity)

### Parallel Opportunities

- All Setup tasks T002-T011 marked [P] can run in parallel (different type definitions)
- All Foundational tasks T014-T015 marked [P] can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All contract tests within a user story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all contract tests for User Story 1 together:
Task: "Contract test for POST /v2/quotes (createQuote)"
Task: "Contract test for GET /v2/quotes (listQuotes)"
Task: "Contract test for GET /v2/quotes/{quoteId} (getQuote)"
Task: "Contract test for PUT /v2/quotes/{quoteId} (updateQuote)"
Task: "Contract test for DELETE /v2/quotes/{quoteId} (deleteQuote)"

# Then implement sequentially (methods depend on shared QuotesApi class)
```

---

## Parallel Example: Setup Phase

```bash
# Launch all model type creation tasks in parallel:
Task: "Create Quote model types in src/models/quotes.ts"
Task: "Create Quote response types in src/models/quotes.ts"
Task: "Create Quote payload types in src/models/quotes.ts"
Task: "Create Line Item payload types in src/models/quotes.ts"
Task: "Create Section types in src/models/quotes.ts"
Task: "Create Access List types in src/models/quotes.ts"
Task: "Create QuotePreferences types in src/models/quote-preferences.ts"
Task: "Create Quote error types in src/models/quotes.ts"
Task: "Create type guards in src/models/quotes.ts"
Task: "Create quote constants in src/models/quotes.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T013)
2. Complete Phase 2: Foundational (T014-T019)
3. Complete Phase 3: User Story 1 (T020-T030)
4. **STOP and VALIDATE**: Test User Story 1 independently - quote CRUD works
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (line items)
4. Add User Story 3 → Test independently → Deploy/Demo (sections)
5. Add User Story 4 → Test independently → Deploy/Demo (sharing)
6. Add User Story 5 → Test independently → Deploy/Demo (preferences)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Quote CRUD)
   - Developer B: User Story 5 (Preferences - separate API class, truly independent)
3. Then continue with remaining stories

---

## Notes

- [P] tasks = different files or isolated sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify contract tests fail before implementing
- Commit after each task or logical group
- v2 API uses `/v2/` base path and `limit/page` pagination (1-indexed)
- All line item operations return the full Quote object with recalculated totals
- QuotePreferencesApi is a separate class from QuotesApi (different endpoint)
