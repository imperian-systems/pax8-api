# Data Model: Companies API

**Feature**: 003-companies-api  
**Date**: 2025-12-08  
**Source**: [research.md](./research.md), Pax8 Partner Endpoints v1 (companies)

## Entities

### Company

Represents a Pax8 company/tenant record.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| companyId | string | Yes | Unique company identifier |
| legalName | string | Yes | Legal name of the company |
| displayName | string | Yes | Display/friendly name |
| status | `"active" | "inactive" | "prospect" | "suspended"` | Yes | Current lifecycle status |
| primaryDomains | string[] | Optional | Primary domain(s) associated with the company |
| primaryContact | { name: string; email: string } | Optional | Primary contact person |
| region | string | Optional | Market/geo code (e.g., `US`, `EU`) |
| externalReferences | Array<{ system: string; id: string }> | Optional | External system references |
| tags | string[] | Optional | Labels for search/filtering |
| createdAt | string (date-time) | Yes | ISO 8601 creation timestamp |
| updatedAt | string (date-time) | Yes | ISO 8601 last update timestamp |

**Validation Rules**:
- `companyId`, `legalName`, `displayName`, `status`, `createdAt`, `updatedAt` are required.
- `status` must be one of the enumerated values.
- `primaryContact.email` must be a valid email if provided.
- `primaryDomains` entries must be valid domain strings.

### PaginationMetadata

Shared pagination envelope for list and search responses.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| nextPageToken | string | No | Cursor for the next page |
| prevPageToken | string | No | Cursor for the previous page (when supported) |
| limit | number | Yes | Page size applied to this response |
| hasMore | boolean | No | Indicates additional pages when totals unavailable |

**Validation Rules**:
- `limit` must be between 1 and 100 (inclusive).

### CompanyListResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| items | Company[] | Yes | Companies on this page |
| page | PaginationMetadata | Yes | Pagination metadata |

### CompanySearchResponse

Same shape as `CompanyListResponse`; items ordered by relevance.

### ErrorResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Machine-readable error code (e.g., `validation_error`, `unauthorized`, `not_found`, `rate_limited`) |
| message | string | Yes | Human-readable message |
| details | object | No | Field-level validation messages or contextual data |

## Relationships

```
CompanyListResponse          CompanySearchResponse
┌───────────────┐            ┌───────────────┐
│ items: Company│            │ items: Company│
│ page: PageMeta│            │ page: PageMeta│
└──────┬────────┘            └──────┬────────┘
       │                             │
       ▼                             ▼
   PaginationMetadata           PaginationMetadata
```

## Type Definitions Summary

```typescript
interface Company {
  companyId: string;
  legalName: string;
  displayName: string;
  status: 'active' | 'inactive' | 'prospect' | 'suspended';
  primaryDomains?: string[];
  primaryContact?: { name?: string; email?: string };
  region?: string;
  externalReferences?: Array<{ system: string; id: string }>;
  tags?: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

interface PaginationMetadata {
  nextPageToken?: string;
  prevPageToken?: string;
  limit: number; // 1-100
  hasMore?: boolean;
}

interface CompanyListResponse {
  items: Company[];
  page: PaginationMetadata;
}

type CompanySearchResponse = CompanyListResponse;

interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```
