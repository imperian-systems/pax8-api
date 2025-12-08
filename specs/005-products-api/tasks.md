# Tasks: Products API

**Input**: Design documents from `/specs/005-products-api/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/products.openapi.yaml ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Per plan.md project structure:
- Source: `src/`
- Tests: `tests/`
- Models: `src/models/products.ts`
- API: `src/api/products.ts`

---

## Phase 1: Setup

**Purpose**: Project initialization and shared types foundation

- [x] T001 Create `src/models/products.ts` with base Product interface (id, name, vendorName, shortDescription, sku, vendorSku, altVendorSku, requiresCommitment)
- [x] T002 [P] Add ProductDetail interface extending Product with description field in `src/models/products.ts`
- [x] T003 [P] Add ListProductsOptions interface (page, size, sort, vendorName, search) with typed sort union in `src/models/products.ts`
- [x] T004 [P] Add PageMetadata and ProductListResponse interfaces in `src/models/products.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core Products API infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `src/api/products.ts` with ProductsApi class skeleton and constructor accepting HttpClient
- [x] T006 [P] Export ProductsApi from `src/api/index.ts`
- [x] T007 Wire ProductsApi to Pax8Client in `src/client/pax8-client.ts` as `client.products`
- [x] T008 [P] Export product types from `src/index.ts`

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - List Products from Catalog (Priority: P1) 🎯 MVP

**Goal**: Partner retrieves paginated list of products with filtering and sorting

**Independent Test**: Call `client.products.list()` with/without filters; verify Product[] with PageMetadata returned

### Implementation for User Story 1

- [x] T009 [US1] Implement `list(options?: ListProductsOptions)` method in `src/api/products.ts` with query param serialization
- [x] T010 [US1] Add page-based pagination query params (page, size) to list method in `src/api/products.ts`
- [x] T011 [US1] Add filter query params (vendorName, search) to list method in `src/api/products.ts`
- [x] T012 [US1] Add sort query param with typed validation in list method in `src/api/products.ts`
- [x] T013 [US1] Add client-side validation for size (1-200) returning 422-style error in `src/api/products.ts`
- [x] T014 [US1] Add JSDoc documentation with usage examples for list method in `src/api/products.ts`
- [x] T015 [US1] Create contract test for GET /products in `tests/contract/api/products-contract.test.ts`
- [x] T016 [US1] Create integration test for list flow (default, filtered, paginated, empty) in `tests/integration/api/products-flow.test.ts`

**Checkpoint**: User Story 1 complete - `client.products.list()` works independently

---

## Phase 4: User Story 2 - View Product Details (Priority: P2)

**Goal**: Partner retrieves full details of a specific product by ID

**Independent Test**: Call `client.products.get(productId)` and verify ProductDetail with description returned

### Implementation for User Story 2

- [x] T017 [US2] Implement `get(productId: string)` method in `src/api/products.ts`
- [x] T018 [US2] Add 404 handling for unknown product ID in get method in `src/api/products.ts`
- [x] T019 [US2] Add JSDoc documentation with usage examples for get method in `src/api/products.ts`
- [x] T020 [US2] Add contract test for GET /products/{productId} in `tests/contract/api/products-contract.test.ts`
- [x] T021 [US2] Add integration test for get flow (success, not-found) in `tests/integration/api/products-flow.test.ts`

**Checkpoint**: User Story 2 complete - `client.products.get()` works independently

---

## Phase 5: User Story 3 - Get Product Provisioning Details (Priority: P3)

**Goal**: Partner retrieves provisioning configuration for product ordering

**Independent Test**: Call `client.products.getProvisioningDetails(productId)` and verify ProvisioningDetail[] returned

### Implementation for User Story 3

- [x] T022 [P] [US3] Add ProvisioningDetail and ProvisioningDetailsResponse interfaces in `src/models/products.ts`
- [x] T023 [US3] Implement `getProvisioningDetails(productId: string)` method in `src/api/products.ts`
- [x] T024 [US3] Add 404 handling for unknown product ID in getProvisioningDetails in `src/api/products.ts`
- [x] T025 [US3] Add JSDoc with dynamic data warning for getProvisioningDetails in `src/api/products.ts`
- [x] T026 [US3] Add contract test for GET /products/{productId}/provisioning-details in `tests/contract/api/products-contract.test.ts`
- [x] T027 [US3] Add integration test for provisioning details flow in `tests/integration/api/products-flow.test.ts`

**Checkpoint**: User Story 3 complete - `client.products.getProvisioningDetails()` works independently

---

## Phase 6: User Story 4 - Get Product Dependencies (Priority: P4)

**Goal**: Partner retrieves prerequisite products before ordering

**Independent Test**: Call `client.products.getDependencies(productId)` and verify Dependencies object returned

### Implementation for User Story 4

- [x] T028 [P] [US4] Add Commitment, ProductDependency, and Dependencies interfaces in `src/models/products.ts`
- [x] T029 [US4] Implement `getDependencies(productId: string)` method in `src/api/products.ts`
- [x] T030 [US4] Add 404 handling for unknown product ID in getDependencies in `src/api/products.ts`
- [x] T031 [US4] Add JSDoc with dynamic data warning for getDependencies in `src/api/products.ts`
- [x] T032 [US4] Add contract test for GET /products/{productId}/dependencies in `tests/contract/api/products-contract.test.ts`
- [x] T033 [US4] Add integration test for dependencies flow in `tests/integration/api/products-flow.test.ts`

**Checkpoint**: User Story 4 complete - `client.products.getDependencies()` works independently

---

## Phase 7: User Story 5 - Get Product Pricing (Priority: P5)

**Goal**: Partner retrieves pricing information with optional company context

**Independent Test**: Call `client.products.getPricing(productId, options?)` and verify Pricing[] returned

### Implementation for User Story 5

- [x] T034 [P] [US5] Add Rate, Pricing, PricingOptions, and PricingResponse interfaces in `src/models/products.ts`
- [x] T035 [P] [US5] Add BillingTerm and PricingType type unions in `src/models/products.ts`
- [x] T036 [US5] Implement `getPricing(productId: string, options?: PricingOptions)` method in `src/api/products.ts`
- [x] T037 [US5] Add companyId query param handling for company-specific pricing in `src/api/products.ts`
- [x] T038 [US5] Add 404 handling for unknown product ID in getPricing in `src/api/products.ts`
- [x] T039 [US5] Add JSDoc with dynamic data warning for getPricing in `src/api/products.ts`
- [x] T040 [US5] Add contract test for GET /products/{productId}/pricing in `tests/contract/api/products-contract.test.ts`
- [x] T041 [US5] Add integration test for pricing flow (default, company-specific) in `tests/integration/api/products-flow.test.ts`

**Checkpoint**: User Story 5 complete - `client.products.getPricing()` works independently

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T042 [P] Verify all product types are exported from `src/index.ts`
- [x] T043 [P] Run quickstart.md validation with actual client usage
- [x] T044 Run full test suite and ensure all tests pass
- [x] T045 Update README.md with Products API documentation if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T004) - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed sequentially (P1 → P2 → P3 → P4 → P5)
  - Or in parallel if multiple developers available
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (List) | Foundational | T008 complete |
| US2 (Get) | Foundational | T008 complete |
| US3 (Provisioning) | Foundational | T008 complete |
| US4 (Dependencies) | Foundational | T008 complete |
| US5 (Pricing) | Foundational | T008 complete |

**Note**: User stories are independent - no cross-story dependencies. Each adds value without breaking others.

### Within Each User Story

1. Models/interfaces first (if adding new types)
2. Core method implementation
3. Error handling
4. JSDoc documentation
5. Contract tests
6. Integration tests

### Parallel Opportunities

**Setup Phase (Phase 1)**:
```
T001 (Product) → T002 (ProductDetail), T003 (ListProductsOptions), T004 (PageMetadata)
```

**Foundational Phase (Phase 2)**:
```
T005 (skeleton) → T006 (export), T007 (wire), T008 (types export) - can run in parallel
```

**User Story Types** (within each story):
```
T022 + T028 + T034 + T035 can all run in parallel (different sections of models file)
```

---

## Parallel Example: Full Team Sprint

```bash
# Developer A: Setup + Foundational
T001 → T002, T003, T004 (parallel) → T005 → T006, T007, T008 (parallel)

# After Foundational complete, split work:

# Developer A: User Story 1 (MVP)
T009 → T010 → T011 → T012 → T013 → T014 → T015 → T016

# Developer B: User Story 2 + 3
T017 → T018 → T019 → T020 → T021
T022 → T023 → T024 → T025 → T026 → T027

# Developer C: User Story 4 + 5
T028 → T029 → T030 → T031 → T032 → T033
T034, T035 (parallel) → T036 → T037 → T038 → T039 → T040 → T041
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T008)
3. Complete Phase 3: User Story 1 - List Products (T009-T016)
4. **STOP and VALIDATE**: Test `client.products.list()` independently
5. Deploy/demo if ready - partners can browse catalog

### Incremental Delivery

| Increment | Stories Complete | Value Delivered |
|-----------|------------------|-----------------|
| MVP | US1 | Partners can browse product catalog |
| +1 | US1, US2 | Partners can view product details |
| +2 | US1-US3 | Partners can see provisioning requirements |
| +3 | US1-US4 | Partners can check product dependencies |
| Full | US1-US5 | Partners have complete pricing information |

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 45 |
| **Setup Tasks** | 4 |
| **Foundational Tasks** | 4 |
| **US1 Tasks** | 8 |
| **US2 Tasks** | 5 |
| **US3 Tasks** | 6 |
| **US4 Tasks** | 6 |
| **US5 Tasks** | 8 |
| **Polish Tasks** | 4 |
| **Parallel Opportunities** | 12 tasks marked [P] |
| **MVP Scope** | Phases 1-3 (16 tasks) |

---

## Notes

- All [P] tasks can run in parallel (different files/sections)
- [US#] labels map tasks to user stories for traceability
- Each user story is independently testable per spec
- Contract tests validate against `contracts/products.openapi.yaml`
- Integration tests use mock server (no live API calls)
- Dynamic data warnings in JSDoc per constitution
