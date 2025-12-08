# Research: Contacts API

**Feature**: 004-contacts-api  
**Date**: 2025-12-08  
**Source**: Pax8 Partner Endpoints v1 OpenAPI (contacts resources)

## Endpoint Surface

### Decision: Expose list, get, create, update, delete endpoints

**Rationale**: Matches spec FR-001..FR-007 and Pax8 Partner endpoints. Full CRUD support.

**Endpoints**:
- `GET /companies/{companyId}/contacts` — list with page-based pagination
- `GET /companies/{companyId}/contacts/{contactId}` — get single contact by ID
- `POST /companies/{companyId}/contacts` — create new contact
- `PUT /companies/{companyId}/contacts/{contactId}` — update existing contact
- `DELETE /companies/{companyId}/contacts/{contactId}` — delete contact

**Alternatives Considered**:
- Flat `/contacts` endpoint with companyId filter: rejected; Pax8 API nests contacts under companies

## Pagination

### Decision: Page-based pagination (default 10, max 200)

**Rationale**: Matches Pax8 Contacts API behavior and constitution pagination standard. Different from Companies API which uses cursor-based.

**Request parameters**:
- `page` (default 0) — zero-indexed page number
- `size` (default 10, max 200) — page size

**Response metadata**:
- `size` — actual page size
- `totalElements` — total contacts available
- `totalPages` — total pages based on size and totalElements
- `number` — current page number (0-indexed)

**Alternatives Considered**:
- Cursor-based pagination: rejected; Pax8 Contacts API uses page-based

## Contact Types Model

### Decision: Use Pax8's type-based primary contact model

**Rationale**: Matches actual Pax8 API response structure. Supports per-type primary designation.

**Details**:
- Contact has `types` array
- Each type entry: `{ type: 'Admin' | 'Billing' | 'Technical', primary: boolean }`
- A company must have a primary contact for each type
- Single contact can be primary for multiple types
- When setting primary=true for a type, auto-demote existing primary for that type

**Alternatives Considered**:
- Simplified single `primaryContact` boolean (README example): rejected per clarification; doesn't match actual API

## Contact Fields

### Decision: Map all Pax8 contact fields

**Rationale**: Full fidelity with upstream API.

**Fields**:
- `id` (uuid) — unique identifier
- `firstName` (string, required)
- `lastName` (string, required)
- `email` (string, required) — validated format
- `phone` (string, optional)
- `types` (array, optional) — contact type assignments
- `createdDate` (string, datetime) — ISO 8601

**Alternatives Considered**:
- Adding `updatedDate`: not present in Pax8 API response

## Request/Response Shapes

### Decision: Typed payloads with reusable pagination metadata

**Rationale**: Consistency with existing Companies API patterns.

**Schemas**:
- `Contact`: Full contact with all fields
- `CreateContactRequest`: `firstName`, `lastName`, `email`, optional `phone`, `types`
- `UpdateContactRequest`: All fields optional for partial updates
- `ContactListResponse`: `content: Contact[]`, `page: PageMetadata`
- `PageMetadata`: `size`, `totalElements`, `totalPages`, `number`

## Error Handling

### Decision: Consistent error envelope for 401/403/404/422/429

**Rationale**: Aligns with FR-008 and existing error patterns.

**Patterns**:
- 401: Unauthorized (invalid/expired token)
- 404: Company not found OR Contact not found
- 422: Validation error (missing required fields, invalid email)
- 429: Rate limited, honor `Retry-After`

**Edge cases**:
- Creating contact for non-existent company: 404 Company not found
- Getting/updating/deleting non-existent contact: 404 Contact not found
- Invalid email format: 422 with field-level details

## Email Uniqueness

### Decision: No uniqueness constraint

**Rationale**: Per clarification session; allows shared mailboxes (e.g., info@company.com).

**Validation**:
- Format validation only (contains @, valid domain)
- Duplicate emails within same company allowed

## Primary Contact Auto-Demotion

### Decision: Auto-demote previous primary per type

**Rationale**: Per clarification session; provides best UX.

**Behavior**:
- When setting `types[].primary = true` for a type
- System finds existing primary for that type in same company
- Auto-sets previous primary's `primary = false` for that type
- Completes requested update/create

**Alternatives Considered**:
- Return 409 Conflict: rejected per clarification; worse UX

## Testing Strategy

- **Unit**: type guards, request builders, response validators
- **Contract**: request/response schemas match `contacts.openapi.yaml`
- **Integration (mock)**: 
  - CRUD happy paths (list, get, create, update, delete)
  - Error paths: 401, 404 (company), 404 (contact), 422, 429
  - Pagination traversal
  - Primary contact auto-demotion behavior

## Dependencies

- Reuse existing token acquisition and HTTP retry/backoff
- Reuse existing error classes (`Pax8Error`, `Pax8NotFoundError`, etc.)
- No new runtime dependencies
