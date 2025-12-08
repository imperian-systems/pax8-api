# Data Model: Companies API

**Feature**: 003-companies-api  
**Date**: 2025-12-08  
**Source**: [research.md](./research.md), Pax8 Partner Endpoints v1 (companies)

## Entities

### Company

Represents a Pax8 company/tenant record.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Unique company identifier |
| name | string | Yes | Company name |
| address | object | Yes | Postal address fields (e.g., city, stateOrProvince, postalCode, country) |
| phone | string | Yes | Primary phone number |
| website | string | Yes | Company website URL |
| externalId | string | No | External reference ID |
| billOnBehalfOfEnabled | boolean | Yes | Whether Pax8 bills on behalf of the partner |
| selfServiceAllowed | boolean | Yes | Whether self-service is enabled |
| orderApprovalRequired | boolean | Yes | Whether self-service orders require approval |
| status | `"Active" | "Inactive" | "Deleted"` | Yes | Current lifecycle status |
| updatedDate | string (date-time) | Yes | ISO 8601 last update timestamp |

**Validation Rules**:
- `id`, `name`, `phone`, `website`, `status`, and `updatedDate` are required.
- `status` must be one of the enumerated values.

### PageMetadata

Shared pagination envelope for list and search responses.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| size | number | Yes | Page size applied to this response |
| totalElements | number | Yes | Total number of elements available |
| totalPages | number | Yes | Total number of pages available |
| number | number | Yes | Current page number (0-based) |

**Validation Rules**:
- `size` must be between 1 and 200 (inclusive); `number` must be >= 0.

### CompanyListResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | Company[] | Yes | Companies on this page |
| page | PageMetadata | Yes | Pagination metadata |

### CompanySearchResponse

Same shape as `CompanyListResponse`; content ordered by relevance.

### ErrorResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Machine-readable error code (e.g., `validation_error`, `unauthorized`, `not_found`, `rate_limited`) |
| message | string | Yes | Human-readable message |
| details | object | No | Field-level validation messages or contextual data |

## Relationships

```
CompanyListResponse          CompanySearchResponse
┌─────────────────┐          ┌─────────────────┐
│ content: Company│          │ content: Company│
│ page: PageMeta  │          │ page: PageMeta  │
└────────┬────────┘          └────────┬────────┘
     │                             │
     ▼                             ▼
   PageMetadata                  PageMetadata
```

## Type Definitions Summary

```typescript
interface Company {
  id: string;
  name: string;
  address: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    stateOrProvince?: string;
    postalCode?: string;
    country?: string;
  };
  phone: string;
  website: string;
  externalId?: string;
  billOnBehalfOfEnabled: boolean;
  selfServiceAllowed: boolean;
  orderApprovalRequired: boolean;
  status: 'Active' | 'Inactive' | 'Deleted';
  updatedDate: string; // ISO 8601
}

interface PageMetadata {
  size: number; // 1-200
  totalElements: number;
  totalPages: number;
  number: number; // 0-based page number
}

interface CompanyListResponse {
  content: Company[];
  page: PageMetadata;
}

type CompanySearchResponse = CompanyListResponse;

interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```
