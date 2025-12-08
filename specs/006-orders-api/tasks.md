# Tasks: Orders API

**Input**: Design documents from `/specs/006-orders-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup

- [ ] T001 [P] Confirm orders OpenAPI contract is available at `specs/006-orders-api/contracts/orders.openapi.yaml` for contract tests

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T002 [P] Create orders domain types in `src/models/orders.ts` (Order, OrderLineItem, ProvisioningDetail, CreateOrderRequest, CreateLineItem, ListOrdersOptions, OrderListResponse)

**Checkpoint**: Foundation ready for user stories

---

## Phase 3: User Story 1 - List orders with pagination (Priority: P1) 🎯 MVP

**Goal**: Retrieve paginated orders with optional companyId filter.
**Independent Test**: Call `orders.list({ page, size, companyId })` and verify paginated content and metadata.

### Tests (write first)
- [ ] T003 [P] [US1] Add contract test for list orders in `tests/contract/api/orders-contract.test.ts` using OpenAPI contract
- [ ] T004 [P] [US1] Add integration test for list orders with pagination and companyId filter in `tests/integration/api/orders-flow.test.ts`

### Implementation
- [ ] T005 [P] [US1] Implement `orders.list` in `src/api/orders.ts` calling GET `/orders` with `page`, `size`, `companyId`, mapping `OrderListResponse`
- [ ] T006 [US1] Wire Orders API into client: export from `src/api/index.ts`, instantiate in `src/client/pax8-client.ts`, expose `client.orders`
- [ ] T007 [US1] Export orders types from `src/index.ts` (ListOrdersOptions, Order, OrderListResponse, OrderLineItem, ProvisioningDetail, CreateOrderRequest, CreateLineItem)

**Checkpoint**: User Story 1 independently testable (list orders)

---

## Phase 4: User Story 2 - View order details (Priority: P2)

**Goal**: Retrieve full details of a specific order.
**Independent Test**: Call `orders.get(orderId)` and verify returned order matches schema.

### Tests (write first)
- [ ] T008 [P] [US2] Add contract test for get order in `tests/contract/api/orders-contract.test.ts`
- [ ] T009 [P] [US2] Add integration test for order detail in `tests/integration/api/orders-flow.test.ts`

### Implementation
- [ ] T010 [US2] Implement `orders.get` in `src/api/orders.ts` calling GET `/orders/{orderId}` and mapping `Order`

**Checkpoint**: User Story 2 independently testable (order detail)

---

## Phase 5: User Story 3 - Create a new order (Priority: P3)

**Goal**: Create an order with validated line items (billingTerm required, commitmentTermId when required), optional mock validation.
**Independent Test**: Call `orders.create(request, { isMock? })`; verify created order returned; invalid inputs return 422.

### Tests (write first)
- [ ] T011 [P] [US3] Add contract test for create order (happy path and required fields) in `tests/contract/api/orders-contract.test.ts`
- [ ] T012 [P] [US3] Add integration test for create order including `commitmentTermId` requirement and mock mode in `tests/integration/api/orders-flow.test.ts`

### Implementation
- [ ] T013 [US3] Implement `orders.create` in `src/api/orders.ts` supporting POST `/orders` with body `CreateOrderRequest` and optional `isMock` query
- [ ] T014 [US3] Validate request composition in client (lineItemNumber present, billingTerm provided, commitmentTermId when required) and map response `Order` in `src/api/orders.ts`

**Checkpoint**: User Story 3 independently testable (order creation)

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T015 [P] Update orders documentation snippets in `specs/006-orders-api/quickstart.md` and ensure README Orders section matches final API signatures
- [ ] T016 Run full test suite `npm test` and lint `npm run lint` to validate Orders additions

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → User Stories (3→4→5) → Polish
- User stories can proceed in priority order (US1 then US2 then US3) after Phase 2 completion.
- Tests for each story must be written before implementation tasks in that story.

## Parallel Execution Examples

- For US1: T003 and T004 can run in parallel; T005 and T007 can run in parallel, then T006.
- Across stories: After Phase 2, US2 tests (T008/T009) can run in parallel with US1 implementation if needed; US3 tasks can start after US1/US2 complete to avoid endpoint conflicts.

## Implementation Strategy

- MVP first: Complete Phases 1-2, then US1 (list). Validate via contract/integration tests.
- Incremental: Add US2 (get), then US3 (create), validating each via tests before moving on.
- Keep runtime dependency-free; align request/response shapes strictly to `specs/006-orders-api/contracts/orders.openapi.yaml`.
