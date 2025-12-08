# Feature Specification: Orders API

**Feature Branch**: `006-orders-api`  
**Created**: December 8, 2025  
**Status**: Draft  
**Input**: User description: "Implement Orders API as shown in README.md"

## Clarifications

### Session 2025-12-08
- Q: What filter parameters should the Orders list endpoint support beyond pagination? → A: Only companyId filter (per Pax8 OpenAPI), plus page/size.
- Q: What order status values should the API client support for filtering? → A: None; status is not present in Pax8 Orders OpenAPI.
- Q: Should the Order entity include additional line item details beyond productId and quantity? → A: Include billingTerm, provisioningDetails (write-only), subscriptionId; no price field.
- Q: Should order creation support specifying a billing term per line item? → A: Yes, billingTerm required per OpenAPI; include commitmentTermId when product requires commitment.
- Q: Should the Order response include a reference to the resulting subscription(s)? → A: Include subscriptionId on OrderLineItem (nullable until subscription is created).

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - List orders with pagination (Priority: P1)

Partner/integrator retrieves a paginated list of orders to view purchasing history and sync order data into their internal systems.

**Why this priority**: Order listing is the foundational operation for any order management workflow. Partners need to browse and filter orders to monitor their purchasing activity and reconcile with billing systems.

**Independent Test**: Call the orders list endpoint with page/size and optional companyId filter; verify the response includes order records with pagination metadata and is usable standalone for order history browsing.

**Acceptance Scenarios**:

1. **Given** valid authorization and no filters, **When** the client requests the orders list, **Then** the response returns the first page of orders with default pagination metadata.
2. **Given** valid authorization and pagination parameters (page, size), **When** the client requests the orders list, **Then** the response returns the specified page of orders with correct pagination metadata.
3. **Given** valid authorization and a companyId filter, **When** the client requests the orders list, **Then** only orders for that company are returned with correct pagination metadata.
4. **Given** filters that match no orders, **When** the client requests the orders list, **Then** the response returns an empty list with pagination metadata indicating zero results.

---

### User Story 2 - View order details (Priority: P2)

Partner/integrator retrieves full details of a specific order to view line items, quantities, and associated company information for order tracking or support purposes.

**Why this priority**: Order detail lookup is essential for troubleshooting order issues, verifying order contents, and providing customer support.

**Independent Test**: Request an order by ID and confirm all required fields are present including line items; test also covers the not-found path independently.

**Acceptance Scenarios**:

1. **Given** a valid order identifier and authorization, **When** the client requests the order detail, **Then** the response returns the order with attributes including id, companyId, orderedBy metadata, lineItems, and timestamps.
2. **Given** an invalid or unknown order identifier, **When** the client requests the order detail, **Then** a not-found response is returned with a clear, consistent error payload.

---

### User Story 3 - Create a new order (Priority: P3)

Partner/integrator creates a new order to purchase products for a company, specifying the company, products, and quantities in a single transaction.

**Why this priority**: Order creation is the critical business operation that enables partners to purchase products. However, it depends on having products and companies already available and is placed after read operations for a safe, incremental rollout.

**Independent Test**: Submit a valid order request with companyId and lineItems; verify the response returns the created order with an assigned ID.

**Acceptance Scenarios**:

1. **Given** valid authorization, a valid companyId, and valid lineItems (productId and quantity), **When** the client creates an order, **Then** the response returns the created order with an assigned id, the specified companyId, and the submitted lineItems.
2. **Given** valid authorization but an invalid companyId, **When** the client creates an order, **Then** a validation error response is returned indicating the company is invalid.
3. **Given** valid authorization but an invalid productId in lineItems, **When** the client creates an order, **Then** a validation error response is returned indicating the product is invalid.
4. **Given** valid authorization but a quantity of zero or negative, **When** the client creates an order, **Then** a validation error response is returned indicating the quantity is invalid.
5. **Given** valid authorization but empty lineItems, **When** the client creates an order, **Then** a validation error response is returned indicating at least one line item is required.

---

### Edge Cases

- What happens when requesting orders with an invalid page number (negative or beyond available pages)? Returns an empty page with correct pagination metadata rather than an error.
- What happens when the size parameter exceeds the maximum allowed (200)? Returns a 422 validation error with a clear message indicating max size is 200.
- Invalid or missing authorization yields a consistent error response without leaking order details.
- Creating an order with a product that requires provisioning details but none are provided? Returns a validation error indicating missing provisioning details.
- Creating an order for a company that the partner does not have access to? Returns a 403 forbidden response.
- What happens when creating an order with duplicate productIds in lineItems? System accepts duplicates as separate line items (standard Pax8 API behavior).
- What happens if commitmentTermId is omitted for a product that requires commitment? Returns a validation error indicating commitment term is required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated orders list endpoint using page-based pagination (page number and size) with configurable page size (default 10, maximum 200).
- **FR-002**: System MUST support filtering the orders list by `companyId` (to scope orders to a specific company).
- **FR-003**: System MUST provide an order detail endpoint that returns a single order by ID with attributes including id, companyId, orderedBy metadata, lineItems (productId, quantity, billingTerm, subscriptionId, commitmentTermId, parent references, provisioningDetails write-only), and timestamps.
- **FR-004**: System MUST provide an order creation endpoint that accepts companyId and an array of lineItems (each with productId, quantity, billingTerm, lineItemNumber, optional provisioningDetails, optional commitmentTermId when required, optional parent references, optional provisionStartDate) and supports `isMock` validation mode.
- **FR-005**: System MUST validate order creation requests: companyId must exist and be accessible; all productIds must be valid; quantities must be positive integers; billingTerm must be valid; `commitmentTermId` required when product requires commitment; `lineItemNumber` required per line item.
- **FR-006**: System MUST return consistent error structures for unauthorized (401), forbidden (403), not-found (404), validation errors (422), and rate limiting (429) responses.
- **FR-007**: System MUST include pagination metadata in list responses: page number, page size, total elements, and total pages.
- **FR-008**: System MUST enforce request validation limits (e.g., maximum page size) and return validation errors without processing the request.
- **FR-009**: System MUST return the created order with an assigned id upon successful order creation.

### Key Entities

- **Order**: Represents a purchase record. Attributes: `id` (uuid), `companyId` (uuid), `createdDate` (ISO 8601), `orderedBy` ("Pax8 Partner" | "Customer" | "Pax8"), `orderedByUserId` (uuid, read-only), `orderedByUserEmail` (email), `isScheduled` (boolean, read-only), `lineItems` (OrderLineItem[]).
- **OrderLineItem**: Represents a single product line in an order. Attributes: `id` (uuid), `productId` (uuid), `subscriptionId` (uuid, nullable), `commitmentTermId` (uuid), `provisionStartDate` (ISO 8601 date-time), `lineItemNumber` (number), `billingTerm` (Monthly | Annual | 2-Year | 3-Year | One-Time | Trial | Activation), `parentSubscriptionId` (uuid), `parentLineItemNumber` (number), `quantity` (number), `provisioningDetails` (ProvisioningDetail[] write-only).
- **ProvisioningDetail**: Attributes: `label` (string, read-only), `key` (string), `values` (string[], write-only), `description` (string, read-only), `valueType` (Input | Single-Value | Multi-Value, read-only), `possibleValues` (string[], read-only).
- **CreateOrderRequest**: Attributes: `companyId` (uuid), `lineItems` (CreateOrderLineItem[]), `orderedBy` ("Pax8 Partner" | "Customer" | "Pax8"), `orderedByUserEmail` (email). Supports `isMock` query flag for validation-only requests.
- **CreateOrderLineItem**: Attributes: `productId` (uuid), `quantity` (number), `billingTerm` (Monthly | Annual | 2-Year | 3-Year | One-Time | Trial | Activation), `lineItemNumber` (number), `commitmentTermId` (uuid, required when product requires commitment), `provisionStartDate` (ISO 8601 date-time), `parentSubscriptionId` (uuid), `parentLineItemNumber` (number), `provisioningDetails` (ProvisioningDetail[] with write-only values).
- **ListOrdersOptions**: Query parameters for listing orders. Attributes: `page` (0-indexed page number), `size` (page size, 1-200), `companyId` (optional filter by company).
- **OrderListResponse**: Paginated response containing `content` (Order[]) and `page` metadata (size, totalElements, totalPages, number).

### Assumptions

- Orders API follows the same page-based pagination pattern established by Companies, Contacts, and Products APIs.
- The API client will use the existing authentication mechanism (OAuth 2.0 Client Credentials flow) already implemented in the Pax8Client.
- The Orders endpoint does not expose an order status field; client will not surface status.
- Line items are immutable after order creation; updating orders is out of scope for this feature.
- Provisioning details for products (if required) should be obtained from the Products API before creating an order.
- Duplicate productIds in lineItems are accepted as separate line items (standard Pax8 API behavior).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can retrieve the first page of orders (default size) in under 2 seconds at the 95th percentile.
- **SC-002**: 95% of order detail lookups return the requested order or a not-found response within 2 seconds.
- **SC-003**: 95% of order creation requests complete within 3 seconds, returning the created order or a validation error.
- **SC-004**: Pagination metadata correctly indicates additional pages in 100% of list responses during functional testing.
 - **SC-005**: 100% of invalid order creation requests (missing companyId, invalid productId, invalid quantity, missing commitmentTermId when required) return appropriate validation errors without creating partial orders.
