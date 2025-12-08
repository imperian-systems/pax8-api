# Research: Companies API

**Feature**: 003-companies-api  
**Date**: 2025-12-08  
**Source**: Pax8 Partner Endpoints v1 OpenAPI (companies resources)

## Endpoint Surface

### Decision: Expose list, detail, and search endpoints

**Rationale**: Matches spec FR-001..FR-004 and Pax8 Partner endpoints. Keeps scope read-only.

**Endpoints**:
- `GET /companies` — list with cursor pagination, filtering, sorting.
- `GET /companies/{companyId}` — detail lookup by ID.
- `GET /companies/search` — relevance-ranked search by name/domain with cursor pagination.

**Alternatives Considered**:
- Folding search into list with a `q` param: rejected to keep list filters orthogonal and allow distinct relevance ordering and limits.

## Pagination

### Decision: Cursor-based pagination (default 50, max 100)

**Rationale**: Avoids page drift for frequently changing company datasets; aligns with spec clarification and reduces client bookkeeping.

**Request shape**:
- `limit` (default 50, max 100)
- `pageToken` (optional cursor for next/previous)

**Response metadata**:
- `nextPageToken`, optional `prevPageToken`
- `limit`
- `hasMore` flag when total is unavailable

**Alternatives Considered**:
- Page-number pagination (default 10, max 200 per constitution): rejected because upstream uses cursors and page numbers would require translation and risk stale results.

## Filtering and Sorting (List)

### Decision: Support `status`, `region`, `updatedSince`, `sort`

**Rationale**: Common integrator needs for syncing active customers and recent changes.

**Details**:
- `status`: enum (e.g., `active`, `inactive`, `prospect`, `suspended`). Unknown -> 400.
- `region`: string (market/geo code). Optional.
- `updatedSince`: ISO 8601 timestamp; filters records updated strictly after value.
- `sort`: `name` (asc default) or `updatedAt` (desc by default when specified).

**Validation**:
- `limit` > 100 -> 400 validation error
- `updatedSince` invalid format -> 400

**Alternatives Considered**:
- Including text search in list filters: rejected to keep search endpoint purpose-built for relevance ranking.

## Search Behavior

### Decision: Dedicated `GET /companies/search` with `query`

**Rationale**: Allows tuned relevance without impacting list sort/filter. Supports partial name or domain.

**Details**:
- `query` (required, 2-256 chars); overlong -> 400
- `limit` (default 50, max 100), `pageToken`
- Results ordered by relevance; ties broken by name ASC

**Alternatives Considered**:
- Autocomplete-only (prefix search): rejected; free-text partial matches required.

## Response Shapes

### Decision: Typed payloads with reusable pagination metadata

**Rationale**: Consistency across list and search; enables shared iterators.

**Schemas (conceptual)**:
- `Company`: `companyId`, `legalName`, `displayName`, `status`, `primaryDomains[]`, `primaryContact { name, email }`, `region`, `createdAt`, `updatedAt`, `externalReferences[]` (key/value pairs), `tags[]`.
- `CompanyListResponse`: `items: Company[]`, `page: { nextPageToken?, prevPageToken?, limit, hasMore? }`.
- `CompanySearchResponse`: same shape as list, results ordered by relevance.
- `Error`: `code`, `message`, optional `details` map.

**Alternatives Considered**:
- Embedding totals: upstream may not return total counts; prefer `hasMore` flag to avoid inaccurate totals.

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

