# Data Model: Products API

**Feature**: 005-products-api  
**Date**: 2025-12-08  
**Source**: [research.md](./research.md), Pax8 Partner Endpoints v1 (products)

## Entities

### Product

Represents a product in the Pax8 catalog (list response).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Unique product identifier |
| name | string | Yes | Product name |
| vendorName | string | Yes | Vendor/publisher name |
| shortDescription | string | No | Brief product description |
| sku | string | No | Pax8 product SKU |
| vendorSku | string | No | Vendor's product SKU |
| altVendorSku | string | No | Deprecated: Microsoft legacy SKU |
| requiresCommitment | boolean | No | Whether product requires commitment term |

**Validation Rules**:
- `id` and `name` are always present in responses
- `altVendorSku` is deprecated; use `vendorSku` instead

### ProductDetail

Extended product info (get response). Includes all Product fields plus additional details.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Unique product identifier |
| name | string | Yes | Product name |
| vendorName | string | Yes | Vendor/publisher name |
| shortDescription | string | No | Brief product description |
| description | string | No | Long product description |
| sku | string | No | Pax8 product SKU |
| vendorSku | string | No | Vendor's product SKU |
| altVendorSku | string | No | Deprecated: Microsoft legacy SKU |
| requiresCommitment | boolean | No | Whether product requires commitment term |

**Validation Rules**:
- `description` is the additional field distinguishing ProductDetail from Product

### ListProductsOptions

Request parameters for listing products.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| page | number | No | Page number (0-indexed, default 0) |
| size | number | No | Page size (default 10, max 200) |
| sort | `'name'` \| `'vendor'` | No | Sort field (typed union) |
| vendorName | string | No | Filter by vendor name |
| search | string | No | Full-text search across name, vendor, SKU, ID |

**Validation Rules**:
- `size` must be between 1 and 200; size > 200 returns 422
- `sort` is type-checked at compile time
- `page` defaults to 0 if not provided

### ProvisioningDetail

Configuration field for product provisioning.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| label | string | Yes | Display label for the field |
| key | string | Yes | Field identifier used in order requests |
| description | string | No | Help text/instructions |
| valueType | `'Input'` \| `'Single-Value'` \| `'Multi-Value'` | Yes | Input type |
| possibleValues | string[] | No | Valid options (null for Input type) |

**Validation Rules**:
- `label` and `key` are always present
- `possibleValues` is only populated for Single-Value and Multi-Value types
- `valueType` determines how the field should be rendered in UI

**Dynamic Data Warning**: Provisioning details change frequently; do not cache long-term.

### ProvisioningDetailsResponse

Response wrapper for provisioning details.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | ProvisioningDetail[] | Yes | Array of provisioning fields |

### Commitment

Commitment term details for products requiring commitments.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Unique commitment identifier |
| term | string | Yes | Commitment duration (e.g., "3-Year") |
| autoRenew | boolean | No | Whether commitment auto-renews |
| renewalWindowDaysBeforeTermEnd | number | No | Days before term end when renewal window opens |
| renewalWindowDaysAfterTermEnd | number | No | Days after term end when renewal window closes |
| allowForQuantityIncrease | boolean | No | Can increase quantity during term |
| allowForQuantityDecrease | boolean | No | Can decrease quantity during term |
| allowForEarlyCancellation | boolean | No | Can cancel before term end |
| cancellationFeeApplied | boolean | No | Fee applied for early cancellation |
| isTransferable | boolean | No | Can transfer to another company |

### ProductDependency

A named constraint with required prerequisite products.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Constraint name (e.g., "Requires") |
| products | Product[] | Yes | Products satisfying the constraint |

### Dependencies

Container for all product dependencies.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| commitmentDependencies | Commitment[] | No | Available commitment terms |
| productDependencies | ProductDependency[] | No | Required prerequisite products |

**Dynamic Data Warning**: Dependencies change frequently; do not cache long-term.

### Rate

Individual pricing rate within a pricing tier.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| partnerBuyRate | number | Yes | Partner cost |
| suggestedRetailPrice | number | Yes | Suggested customer price |
| startQuantityRange | number | No | Start of quantity range (default 0) |
| endQuantityRange | number | No | End of quantity range (null = unlimited) |
| chargeType | `'Per Unit'` \| `'Flat Rate'` | Yes | How rate is applied |

**Validation Rules**:
- `chargeType: 'Per Unit'` — rate multiplied by quantity
- `chargeType: 'Flat Rate'` — rate is fixed regardless of quantity in range

### Pricing

Pricing information for a product.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | string (uuid) | Yes | Product identifier |
| productName | string | Yes | Product name |
| billingTerm | BillingTerm | Yes | Billing frequency |
| commitmentTerm | string | No | Commitment duration if applicable |
| commitmentTermInMonths | number | No | Commitment in months |
| type | PricingType | Yes | Pricing model type |
| unitOfMeasurement | string | No | Unit (e.g., "User", "Each") |
| rates | Rate[] | Yes | Pricing rates/tiers |

**BillingTerm enum**: `'Monthly' | 'Annual' | '2-Year' | '3-Year' | 'One-Time' | 'Trial' | 'Activation'`

**PricingType enum**: `'Flat' | 'Volume' | 'Tiered' | 'Mark-Up'`

**Dynamic Data Warning**: Pricing changes frequently; do not cache long-term.

### PricingOptions

Request parameters for getting pricing.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| companyId | string (uuid) | No | Company ID for company-specific pricing |

### PricingResponse

Response wrapper for pricing information.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | Pricing[] | Yes | Array of pricing options |

### PageMetadata

Page-based pagination metadata for list responses.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| size | number | Yes | Number of items per page (1-200) |
| totalElements | number | Yes | Total products across all pages |
| totalPages | number | Yes | Total pages based on size and totalElements |
| number | number | Yes | Current page number (0-indexed) |

**Validation Rules**:
- `size` must be between 1 and 200 (inclusive)
- `number` is 0-indexed

### ProductListResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | Product[] | Yes | Products on this page |
| page | PageMetadata | Yes | Pagination metadata |

## Type Definitions (TypeScript)

```typescript
// Enums
type ProductSortField = 'name' | 'vendor';
type ProvisioningValueType = 'Input' | 'Single-Value' | 'Multi-Value';
type BillingTerm = 'Monthly' | 'Annual' | '2-Year' | '3-Year' | 'One-Time' | 'Trial' | 'Activation';
type PricingType = 'Flat' | 'Volume' | 'Tiered' | 'Mark-Up';
type ChargeType = 'Per Unit' | 'Flat Rate';

// Request Options
interface ListProductsOptions {
  page?: number;
  size?: number;
  sort?: ProductSortField;
  vendorName?: string;
  search?: string;
}

interface PricingOptions {
  companyId?: string;
}

// Response Types
interface ProductListResponse {
  content: Product[];
  page: PageMetadata;
}

interface ProvisioningDetailsResponse {
  content: ProvisioningDetail[];
}

interface PricingResponse {
  content: Pricing[];
}
```
