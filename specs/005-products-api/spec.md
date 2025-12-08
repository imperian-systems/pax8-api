# Feature Specification: Products API

**Feature Branch**: `005-products-api`  
**Created**: December 8, 2025  
**Status**: Draft  
**Input**: User description: "Implement the products API according to the examples from README.md"

## Clarifications

### Session 2025-12-08
- Q: What pagination model should the Products API use? → A: Page-based pagination with `page`/`size` params (matches Contacts API pattern).
- Q: Should we define exact Product entity attributes from OpenAPI spec? → A: Yes, fetch OpenAPI spec and define exact attributes.
- Q: Should the Products API client expose the `search` parameter? → A: Yes, include `search` param for full parity with Pax8 API.
- Q: Should the `sort` parameter be typed as a union or free-form string? → A: Typed union `'name' | 'vendor'` for compile-time safety.
- Q: What should happen when page size exceeds maximum (200)? → A: Return 422 validation error with clear message.

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

### User Story 1 - List products from catalog (Priority: P1)

Partner/integrator retrieves a paginated list of products from the Pax8 product catalog to display available offerings to their customers or to sync product data into their internal systems.

**Why this priority**: Product listing is the foundational operation for any product-related workflow. Without the ability to browse and filter the catalog, partners cannot discover what products are available for ordering or subscription management.

**Independent Test**: Call the products list endpoint with optional filters (vendorName, availability); verify the response includes product records with pagination metadata and is usable standalone for catalog browsing.

**Acceptance Scenarios**:

1. **Given** valid authorization and no filters, **When** the client requests the products list, **Then** the response returns the first page of products with default pagination metadata.
2. **Given** valid authorization and a vendorName filter (e.g., "Microsoft"), **When** the client requests the products list, **Then** only products from that vendor are returned with correct pagination metadata.
3. **Given** valid authorization and pagination parameters (page, size), **When** the client requests the products list, **Then** the response returns the specified page of products with correct pagination metadata.
4. **Given** filters that match no products, **When** the client requests the products list, **Then** the response returns an empty list with pagination metadata indicating zero results.

---

### User Story 2 - View product details (Priority: P2)

Partner/integrator retrieves full details of a specific product to display comprehensive information including name, vendor, description, and attributes before presenting ordering options to customers.

**Why this priority**: Product detail lookup is essential for displaying complete product information in purchasing workflows and for verifying product availability and attributes.

**Independent Test**: Request a product by ID and confirm all required fields are present; test also covers the not-found path independently.

**Acceptance Scenarios**:

1. **Given** a valid product identifier and authorization, **When** the client requests the product detail, **Then** the response returns the product with all attributes including id, name, vendorName, and relevant product metadata.
2. **Given** an invalid or unknown product identifier, **When** the client requests the product detail, **Then** a not-found response is returned with a clear, consistent error payload.

---

### User Story 3 - Get product provisioning details (Priority: P3)

Partner/integrator retrieves provisioning configuration details for a product to understand what information is required when placing an order or activating a subscription.

**Why this priority**: Provisioning details are required before orders can be placed, as they define the configuration fields and validation rules for product activation.

**Independent Test**: Request provisioning details for a product by ID and verify the response includes required configuration fields and validation rules.

**Acceptance Scenarios**:

1. **Given** a valid product identifier with provisioning requirements, **When** the client requests provisioning details, **Then** the response returns the configuration schema including required fields and validation constraints.
2. **Given** a product without special provisioning requirements, **When** the client requests provisioning details, **Then** the response returns minimal or empty provisioning configuration.
3. **Given** an invalid or unknown product identifier, **When** the client requests provisioning details, **Then** a not-found response is returned.

---

### User Story 4 - Get product dependencies (Priority: P4)

Partner/integrator retrieves dependency information for a product to understand what prerequisite products must be purchased or activated before this product can be ordered.

**Why this priority**: Understanding product dependencies prevents order failures and allows partners to present complete bundles or prerequisite warnings to customers.

**Independent Test**: Request dependencies for a product by ID and verify the response includes an array of dependent product references.

**Acceptance Scenarios**:

1. **Given** a product with dependencies, **When** the client requests product dependencies, **Then** the response returns an array of dependent product references with relevant identifiers.
2. **Given** a product with no dependencies, **When** the client requests product dependencies, **Then** the response returns an empty array.
3. **Given** an invalid or unknown product identifier, **When** the client requests product dependencies, **Then** a not-found response is returned.

---

### User Story 5 - Get product pricing (Priority: P5)

Partner/integrator retrieves pricing information for a product, optionally scoped to a specific company, to display accurate cost information before ordering.

**Why this priority**: Pricing information is critical for generating quotes and displaying accurate costs, but depends on having the product catalog available first.

**Independent Test**: Request pricing for a product by ID with optional company context and verify the response includes pricing tiers or rates.

**Acceptance Scenarios**:

1. **Given** a valid product identifier, **When** the client requests product pricing without company context, **Then** the response returns default/list pricing information.
2. **Given** a valid product identifier and companyId, **When** the client requests product pricing, **Then** the response returns company-specific pricing if available, otherwise default pricing.
3. **Given** an invalid or unknown product identifier, **When** the client requests product pricing, **Then** a not-found response is returned.

---

### Edge Cases

- What happens when requesting products with an invalid page number (negative or beyond available pages)? Returns an empty page with correct pagination metadata rather than an error.
- What happens when the size parameter exceeds the maximum allowed (200)? Returns a 422 validation error with a clear message indicating max size is 200.
- Invalid or missing authorization yields a consistent error response without leaking product availability details.
- Filter combinations that yield zero matches return an empty list with pagination metadata, not an error.
- What happens when requesting pricing for a product that has no pricing configured? Returns empty pricing or a specific response indicating pricing unavailable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated products list endpoint using page-based pagination (page number and size) with configurable page size (default 10, maximum 200).
- **FR-002**: System MUST support filtering the products list by vendorName, availability status, and a `search` parameter for full-text search across name, vendor, SKU, and ID fields.
- **FR-003**: System MUST support sorting the products list by a typed sort field (`'name' | 'vendor'`) for compile-time validation.
- **FR-004**: System MUST provide a product detail endpoint that returns a single product by ID with all attributes including id, name, vendorName, and product metadata.
- **FR-005**: System MUST provide a provisioning details endpoint that returns configuration requirements for a product by ID.
- **FR-006**: System MUST provide a dependencies endpoint that returns an array of prerequisite products for a given product ID.
- **FR-007**: System MUST provide a pricing endpoint that returns pricing information for a product by ID, with optional company context via companyId parameter.
- **FR-008**: System MUST return consistent error structures for unauthorized (401), forbidden (403), not-found (404), validation errors (422), and rate limiting (429) responses.
- **FR-009**: System MUST include pagination metadata in list responses: page number, page size, total elements, and total pages.
- **FR-010**: System MUST enforce request validation limits (e.g., maximum page size) and return validation errors without processing the request.

### Key Entities

*(Based on Partner Endpoints OpenAPI v1: `https://devx.pax8.com/openapi/6463f53f2c9755000aaf50be`)*

- **Product**: Represents a product in the Pax8 catalog (list response). Attributes: `id` (uuid), `name`, `vendorName`, `shortDescription`, `sku`, `vendorSku`, `altVendorSku` (deprecated), `requiresCommitment` (boolean).
- **ProductDetail**: Extended product info (get response). Same as Product plus `description` (long description).
- **ProvisioningDetail**: Configuration field for provisioning. Attributes: `label`, `key`, `description`, `valueType` (Input | Single-Value | Multi-Value), `possibleValues` (array), `values` (writeOnly for orders).
- **Dependencies**: Container for product dependencies. Contains `commitmentDependencies` (Commitment[]) and `productDependencies` (ProductDependency[]).
- **ProductDependency**: A named constraint with required products. Attributes: `name` (constraint name like "Requires"), `products` (Product[] that satisfy the constraint).
- **Commitment**: Commitment term details. Attributes: `id`, `term` (e.g., "3-Year"), `autoRenew`, `renewalWindowDaysBeforeTermEnd`, `renewalWindowDaysAfterTermEnd`, `allowForQuantityIncrease`, `allowForQuantityDecrease`, `allowForEarlyCancellation`, `cancellationFeeApplied`, `isTransferable`.
- **Pricing**: Pricing information for a product. Attributes: `productId`, `productName`, `billingTerm` (Monthly | Annual | 2-Year | 3-Year | One-Time | Trial | Activation), `commitmentTerm`, `commitmentTermInMonths`, `type` (Flat | Volume | Tiered | Mark-Up), `unitOfMeasurement`, `rates` (Rate[]).
- **Rate**: Individual pricing rate. Attributes: `partnerBuyRate`, `suggestedRetailPrice`, `startQuantityRange`, `endQuantityRange`, `chargeType` (Per Unit | Flat Rate).
- **ProductListResponse**: Paginated response containing `content` (Product[]) and `page` metadata (size, totalElements, totalPages, number).

### Assumptions

- The Products API follows page-based pagination (like Contacts API) with page/size parameters rather than cursor-based pagination.
- Products are read-only; there are no create, update, or delete operations for products in this API.
- Authentication and authorization are handled by the existing token management system; callers must possess valid tokens with appropriate scopes.
- Provisioning details and dependencies are product-specific metadata provided by Pax8; the client wraps these endpoints for convenience.
- Pricing may vary by company; when companyId is not provided, default/list pricing is returned.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can retrieve a page of products (default page size) in under 2 seconds at the 95th percentile.
- **SC-002**: Users can retrieve product details for a specific product in under 1 second at the 95th percentile.
- **SC-003**: 95% of product detail lookups return the requested product or a not-found response within 1 second.
- **SC-004**: Users can filter products by vendor and retrieve filtered results in under 2 seconds at the 95th percentile.
- **SC-005**: Provisioning details, dependencies, and pricing endpoints return responses within 2 seconds at the 95th percentile.
