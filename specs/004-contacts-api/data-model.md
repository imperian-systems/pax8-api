# Data Model: Contacts API

**Feature**: 004-contacts-api  
**Date**: 2025-12-08  
**Source**: [research.md](./research.md), Pax8 Partner Endpoints v1 (contacts)

## Entities

### Contact

Represents a person associated with a Pax8 company.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (uuid) | Yes | Unique contact identifier |
| firstName | string | Yes | First name of the contact |
| lastName | string | Yes | Last name of the contact |
| email | string | Yes | Email address (validated format) |
| phone | string | No | Phone number |
| types | ContactType[] | No | Array of contact type assignments |
| createdDate | string (date-time) | Yes | ISO 8601 creation timestamp |

**Validation Rules**:
- `id`, `firstName`, `lastName`, `email`, `createdDate` are required in responses
- `email` must be a valid email format (contains @, valid domain)
- `types` defaults to empty array if not provided
- Duplicate emails allowed within same company

### ContactType

Represents a contact's role assignment within a company.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | `"Admin"` \| `"Billing"` \| `"Technical"` | Yes | Contact role type |
| primary | boolean | Yes | Whether this contact is primary for this type |

**Validation Rules**:
- `type` must be one of the enumerated values
- A company must have a primary contact for each type
- A single contact can be primary for multiple types
- When setting `primary: true`, previous primary for that type is auto-demoted

### CreateContactRequest

Request body for creating a new contact.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | Yes | First name of the contact |
| lastName | string | Yes | Last name of the contact |
| email | string | Yes | Email address (validated format) |
| phone | string | No | Phone number |
| types | ContactType[] | No | Array of contact type assignments |

**Validation Rules**:
- `firstName`, `lastName`, `email` are required
- `email` must be valid format
- Missing required fields return 422 with field details

### UpdateContactRequest

Request body for updating an existing contact. All fields optional for partial updates.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | No | First name of the contact |
| lastName | string | No | Last name of the contact |
| email | string | No | Email address (validated format) |
| phone | string | No | Phone number |
| types | ContactType[] | No | Array of contact type assignments |

**Validation Rules**:
- All fields optional
- If `email` provided, must be valid format
- If `types` provided, replaces entire types array
- Invalid data returns 422 without modifying contact

### PageMetadata

Page-based pagination metadata for list responses.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| size | number | Yes | Number of items per page (1-200) |
| totalElements | number | Yes | Total contacts across all pages |
| totalPages | number | Yes | Total pages based on size and totalElements |
| number | number | Yes | Current page number (0-indexed) |

**Validation Rules**:
- `size` must be between 1 and 200 (inclusive)
- `number` is 0-indexed

### ContactListResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | Contact[] | Yes | Contacts on this page |
| page | PageMetadata | Yes | Pagination metadata |

### ListContactsParams

Parameters for listing contacts.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| companyId | string | Yes | Company to list contacts for |
| page | number | No | Page number (default 0) |
| size | number | No | Page size (default 10, max 200) |

### ErrorResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Machine-readable error code |
| message | string | Yes | Human-readable message |
| details | object | No | Field-level validation messages |

**Error Codes**:
- `unauthorized` — 401
- `not_found` — 404
- `validation_error` — 422
- `rate_limited` — 429

## Relationships

```
ContactListResponse
┌───────────────────┐
│ content: Contact[]│
│ page: PageMetadata│
└──────┬────────────┘
       │
       ▼
   PageMetadata
┌──────────────────┐
│ size: number     │
│ totalElements    │
│ totalPages       │
│ number           │
└──────────────────┘

Contact
┌──────────────────┐
│ id               │
│ firstName        │
│ lastName         │
│ email            │
│ phone?           │
│ types: []        │──────► ContactType[]
│ createdDate      │
└──────────────────┘

ContactType
┌──────────────────┐
│ type: enum       │
│ primary: boolean │
└──────────────────┘
```

## Type Definitions Summary

```typescript
type ContactTypeEnum = 'Admin' | 'Billing' | 'Technical';

interface ContactType {
  type: ContactTypeEnum;
  primary: boolean;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  types?: ContactType[];
  createdDate: string; // ISO 8601
}

interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  types?: ContactType[];
}

interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  types?: ContactType[];
}

interface PageMetadata {
  size: number;       // 1-200
  totalElements: number;
  totalPages: number;
  number: number;     // 0-indexed
}

interface ContactListResponse {
  content: Contact[];
  page: PageMetadata;
}

interface ListContactsParams {
  companyId: string;
  page?: number;      // default 0
  size?: number;      // default 10, max 200
}

interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```
