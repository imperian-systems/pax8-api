# Research: Products API

**Feature**: 005-products-api  
**Date**: 2025-12-08  
**Source**: Pax8 Partner Endpoints v1 OpenAPI (`https://devx.pax8.com/openapi/6463f53f2c9755000aaf50be`)

## Endpoint Surface

### Decision: Expose list, get, getProvisioningDetails, getDependencies, getPricing endpoints

**Rationale**: Matches spec FR-001..FR-007 and Pax8 Partner endpoints. Read-only catalog access.

**Endpoints**:
- `GET /products` — list with page-based pagination, filters, search, sort
- `GET /products/{productId}` — get single product detail by ID
- `GET /products/{productId}/provision-details` — get provisioning configuration
- `GET /products/{productId}/dependencies` — get product dependencies
- `GET /products/{productId}/pricing` — get pricing with optional companyId query param

**Alternatives Considered**:
- Adding create/update/delete: rejected; products are catalog items managed by Pax8, not partners

## Pagination

### Decision: Page-based pagination (default 10, max 200)

**Rationale**: Matches Pax8 Products API behavior and constitution pagination standard.

**Request parameters**:
- `page` (default 0) — zero-indexed page number
- `size` (default 10, max 200) — page size

**Response metadata**:
- `size` — actual page size
- `totalElements` — total products available
- `totalPages` — total pages based on size and totalElements
- `number` — current page number (0-indexed)

**Validation**:
- `size` > 200 returns 422 validation error (per spec clarification)

**Alternatives Considered**:
- Cursor-based pagination: rejected; Pax8 Products API uses page-based

## List Filtering and Sorting

### Decision: Support vendorName, search, and typed sort parameters

**Rationale**: Full parity with Pax8 API capabilities per spec clarification.

**Filter parameters**:
- `vendorName` (string, optional) — filter by vendor name
- `search` (string, optional) — full-text search across name, vendor, SKU, ID

**Sort parameter**:
- `sort` (typed union `'name' | 'vendor'`, optional) — compile-time validated sort field

**Alternatives Considered**:
- Free-form sort string: rejected per spec clarification; typed union provides DX and safety

## Product Entity Model

### Decision: Separate Product (list) and ProductDetail (get) types

**Rationale**: Matches OpenAPI schema distinction; list response has `shortDescription`, get response adds `description`.

**Product (list response)**:
- `id` (uuid)
- `name` (string)
- `vendorName` (string)
- `shortDescription` (string)
- `sku` (string)
- `vendorSku` (string)
- `altVendorSku` (string, deprecated)
- `requiresCommitment` (boolean)

**ProductDetail (get response)**:
- All Product fields plus:
- `description` (string) — long description

**Alternatives Considered**:
- Single unified Product type: rejected; upstream API distinguishes list vs detail responses

## Provisioning Details

### Decision: Return array of ProvisioningDetail objects

**Rationale**: Matches Pax8 API structure; each provisioning field has its own configuration.

**ProvisioningDetail fields**:
- `label` (string) — display label
- `key` (string) — field identifier for orders
- `description` (string, optional) — help text
- `valueType` (`'Input' | 'Single-Value' | 'Multi-Value'`) — input type
- `possibleValues` (string[], optional) — valid options for Single/Multi-Value types

**Response structure**:
- `{ content: ProvisioningDetail[] }` — array wrapped in content property

**Dynamic Data Warning**: Constitution notes provisioning details are dynamic; include JSDoc warning.

## Dependencies

### Decision: Return Dependencies object with commitment and product dependencies

**Rationale**: Matches Pax8 API structure; dependencies include both commitment requirements and product prerequisites.

**Dependencies fields**:
- `commitmentDependencies` (Commitment[]) — commitment term options
- `productDependencies` (ProductDependency[]) — required prerequisite products

**Commitment fields**:
- `id` (uuid)
- `term` (string, e.g., "3-Year")
- `autoRenew` (boolean)
- `renewalWindowDaysBeforeTermEnd` (number)
- `renewalWindowDaysAfterTermEnd` (number)
- `allowForQuantityIncrease` (boolean)
- `allowForQuantityDecrease` (boolean)
- `allowForEarlyCancellation` (boolean)
- `cancellationFeeApplied` (boolean)
- `isTransferable` (boolean)

**ProductDependency fields**:
- `name` (string) — constraint name (e.g., "Requires")
- `products` (Product[]) — products satisfying the constraint

**Dynamic Data Warning**: Constitution notes dependencies are dynamic; include JSDoc warning.

## Pricing

### Decision: Return Pricing object with rates array

**Rationale**: Matches Pax8 API structure; pricing varies by billing term and quantity ranges.

**Request parameters**:
- `companyId` (uuid, optional query param) — for company-specific pricing

**Pricing fields**:
- `productId` (uuid)
- `productName` (string)
- `billingTerm` (`'Monthly' | 'Annual' | '2-Year' | '3-Year' | 'One-Time' | 'Trial' | 'Activation'`)
- `commitmentTerm` (string, optional)
- `commitmentTermInMonths` (number, optional)
- `type` (`'Flat' | 'Volume' | 'Tiered' | 'Mark-Up'`)
- `unitOfMeasurement` (string)
- `rates` (Rate[])

**Rate fields**:
- `partnerBuyRate` (number)
- `suggestedRetailPrice` (number)
- `startQuantityRange` (number, optional)
- `endQuantityRange` (number, optional)
- `chargeType` (`'Per Unit' | 'Flat Rate'`)

**Response structure**:
- `{ content: Pricing[] }` — array of pricing options wrapped in content

**Dynamic Data Warning**: Constitution notes pricing is dynamic; include JSDoc warning.

## Error Handling

### Decision: Consistent error envelope for 401/403/404/422/429

**Rationale**: Aligns with FR-008 and existing error patterns.

**Patterns**:
- 401: Unauthorized (invalid/expired token)
- 404: Product not found
- 422: Validation error (size > 200, invalid sort value)
- 429: Rate limited, honor `Retry-After`

## Client Method Signatures

### Decision: Typed method signatures with options objects

**Rationale**: Consistency with existing API patterns; provides IDE autocomplete.

```typescript
// List products
products.list(options?: ListProductsOptions): Promise<ProductListResponse>

// Get product by ID
products.get(productId: string): Promise<ProductDetail>

// Get provisioning details
products.getProvisioningDetails(productId: string): Promise<ProvisioningDetailsResponse>

// Get dependencies
products.getDependencies(productId: string): Promise<Dependencies>

// Get pricing
products.getPricing(productId: string, options?: PricingOptions): Promise<PricingResponse>
```

**Options types**:
```typescript
interface ListProductsOptions {
  page?: number;           // default 0
  size?: number;           // default 10, max 200
  sort?: 'name' | 'vendor';
  vendorName?: string;
  search?: string;
}

interface PricingOptions {
  companyId?: string;      // uuid for company-specific pricing
}
```
