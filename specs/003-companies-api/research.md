# Research: Companies API

**Feature**: 003-companies-api  
**Date**: 2025-12-08  
**Source**: Pax8 Partner Endpoints v1 OpenAPI (companies resources)

## Endpoint Surface

### Decision: Expose list, detail, and search endpoints

**Rationale**: Matches spec FR-001..FR-004 and Pax8 Partner endpoints. Keeps scope read-only.

**Endpoints**:
- `GET /companies` — list with page/size pagination, filtering, sorting.
- `GET /companies/{companyId}` — detail lookup by ID.
- `GET /companies/search` — relevance-ranked search by name/domain with page/size pagination.

**Alternatives Considered**:
- Folding search into list with a `q` param: rejected to keep list filters orthogonal and allow distinct relevance ordering and limits.

## Pagination

### Decision: Page-based pagination (default size 10, max 200)

**Rationale**: Matches Pax8 documentation (`page`, `size`) and exposes total counts (`totalElements`, `totalPages`).

**Request shape**:
- `page` (0-based, default 0)
- `size` (default 10, max 200)
- `sort` (e.g., `name,desc`)

**Response metadata**:
- `page` object with `size`, `totalElements`, `totalPages`, `number`

**Alternatives Considered**:
- Cursor pagination: rejected because Pax8 findcompanies uses page/size and returns totals.

## Filtering and Sorting (List)

### Decision: Support filters and sort aligned to Pax8

**Rationale**: Match documented query params on findcompanies.

**Details**:
- Filters: `city`, `country`, `stateOrProvince`, `postalCode`, `selfServiceAllowed`, `billOnBehalfOfEnabled`, `orderApprovalRequired`, `status (Active|Inactive|Deleted)`.
- Sort: `field,direction` where field in `name|city|country|stateOrProvince|postalCode` and direction `asc|desc` (default asc when omitted).

**Validation**:
- `size` > 200 -> 400 validation error
- `page` < 0 -> 400 validation error

**Alternatives Considered**:
- Including text search in list filters: rejected to keep search endpoint purpose-built for relevance ranking.

## Search Behavior

### Decision: Dedicated `GET /companies/search` with `query`

**Rationale**: Allows tuned relevance without impacting list sort/filter. Supports partial name or domain.

**Details**:
- `query` (required, 2-256 chars); overlong -> 400
- `page`/`size` pagination (default size 10, max 200)
- Results ordered by relevance; ties broken by name ASC

**Alternatives Considered**:
- Autocomplete-only (prefix search): rejected; free-text partial matches required.

## Response Shapes

### Decision: Typed payloads with reusable page metadata

**Rationale**: Consistency across list and search; matches Pax8 response.

**Schemas (conceptual)**:
- `Company`: `id`, `name`, `address`, `phone`, `website`, `externalId`, `billOnBehalfOfEnabled`, `selfServiceAllowed`, `orderApprovalRequired`, `status`, `updatedDate`.
- `CompanyListResponse`: `content: Company[]`, `page: { size, totalElements, totalPages, number }`.
- `CompanySearchResponse`: same shape as list, results ordered by relevance.
- `Error`: `code`, `message`, optional `details` map.

## Error Handling

### Decision: Consistent error envelope for 401/403/404/429/400

**Rationale**: Aligns with FR-005; simplifies client-side branching.

**Patterns**:
- 401/403: `code=unauthorized` / `forbidden`
- 404: `code=not_found` for unknown companyId
- 400: `code=validation_error` with field-level details
- 429: `code=rate_limited`, honor `Retry-After`

**Alternatives Considered**:
- Per-endpoint ad-hoc errors: rejected for DX consistency.

## Testing Strategy

- **Unit**: cursor helpers, parameter validation, response normalization.
- **Contract**: request/response schemas for list/detail/search match `companies.openapi.yaml`.
- **Integration (mock)**: happy-path list/search/detail, invalid tokens (401), not found (404), validation errors (400), rate limit (429) with retries.

## Dependencies

- Reuse existing token acquisition and HTTP retry/backoff.
- No new runtime dependencies; keep dev tooling unchanged (Vitest, TypeScript).

