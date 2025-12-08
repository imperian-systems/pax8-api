# Research: README Documentation

**Feature**: 001-readme-docs  
**Date**: 2025-12-08  
**Purpose**: Resolve technical unknowns and establish best practices for README implementation

## Research Tasks

### 1. API Resources from OpenAPI Specifications

**Question**: What are all the API resources available from Pax8's APIs?

**Finding**: Based on the Partner Endpoints v1 OpenAPI spec, the following resources are available:

| Resource | Methods | Description |
|----------|---------|-------------|
| **Companies** | list, get, create, update | Customer organizations served through Pax8 |
| **Contacts** | list, get, create, update, delete | People associated with companies |
| **Products** | list, get, getProvisioningDetails, getDependencies, getPricing | Pax8 product catalog |
| **Orders** | list, get, create | Product purchase records |
| **Subscriptions** | list, get, update, cancel, getHistory | Active service agreements |
| **Invoices** | list, get, listItems, listDraftItems | Billing records |
| **Usage Summaries** | list, get, listLines | Usage-based billing data |

**Additional APIs** (from other OpenAPI specs):
- **Quotes** (Quoting Endpoints v2) - Quote creation and management
- **Webhooks** (Webhooks API v1/v2) - Event notification subscriptions

**Decision**: Document 8 primary resource groups in README API Reference section.

---

### 2. Pagination Pattern Details

**Question**: What pagination pattern does Pax8 use?

**Finding**: Page-based pagination with consistent structure:
- `page`: Page number (0-indexed, default: 0)
- `size`: Items per page (default: 10, min: 1, max: 200)
- `sort`: Optional field + direction (e.g., `name,desc`)

Response format:
```typescript
interface PagedResponse<T> {
  content: T[];
  page: {
    size: number;      // Items in this page
    totalElements: number;  // Total items across all pages
    totalPages: number;     // Total page count
    number: number;    // Current page (0-indexed)
  };
}
```

**Decision**: Document both manual pagination and async iterator pattern in README.

---

### 3. Error Response Structure

**Question**: What error types does the API return?

**Finding**: Standard error response structure:
```typescript
interface Pax8Error {
  type: string;       // HTTP error type
  message: string;    // Human-readable message
  instance: string;   // The path called
  status: number;     // HTTP status code
  details?: ErrorDetail[];  // Additional failures
}
```

Common status codes:
- `401` - Unauthorized (authentication failure)
- `403` - Forbidden (access denied)
- `404` - Not found
- `408` - Request timeout
- `422` - Validation error (invalid input)
- `429` - Rate limit exceeded

**Decision**: Create error class hierarchy mapping to these status codes.

---

### 4. README Best Practices Research

**Question**: What makes an excellent NPM package README?

**Finding**: Industry best practices for TypeScript SDK READMEs:

1. **Immediate value** - Quick start within first screen fold
2. **Badges** - npm version, license, build status, TypeScript icon
3. **Installation** - All package managers (npm, yarn, pnpm)
4. **Quick start** - Copy-paste working example
5. **Table of contents** - For READMEs over 100 lines
6. **API reference** - Method signatures with brief descriptions
7. **TypeScript** - Show type imports and generics
8. **Error handling** - Document all error types
9. **Links** - Official docs, changelog, contributing guide

**Decision**: Structure README following this hierarchy, with TOC after badges/installation.

---

### 5. Credential Handling in Documentation

**Question**: How should credentials appear in README examples?

**Clarification Resolution**: User specified credentials should be passed directly to constructor.

Example pattern:
```typescript
import { Pax8Client } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',     // From Pax8 Integrations Hub
  clientSecret: 'your-client-secret'
});
```

**Decision**: Use descriptive placeholder strings in examples, not environment variables.

---

## Summary of Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| API Resources | 8 resource groups | Matches Pax8 OpenAPI structure |
| Pagination | Document both patterns | Manual for control, iterator for convenience |
| Error Classes | 5 typed error classes | Maps to common HTTP status codes |
| README Structure | Single file with TOC | Per clarification session |
| Method Detail | Signatures + descriptions | Per clarification session |
| Credentials | Constructor parameters | Per user preference |

## Open Questions

None - all technical unknowns resolved.
