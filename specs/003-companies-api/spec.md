# Feature Specification: Companies API

**Feature Branch**: `003-companies-api`  \
**Created**: December 8, 2025  \
**Status**: Draft  \
**Input**: User description: "Implement the companies API."

## Clarifications

### Session 2025-12-08
- Q: Which pagination model should the companies API use? → A: Page/offset pagination using `page` (0-based) and `size`.
- Q: What default and maximum page sizes should the API enforce? → A: Default size 10; maximum size 200.

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

### User Story 1 - Retrieve companies list (Priority: P1)

Partner/integrator retrieves a paginated list of companies to sync into their system or console.

**Why this priority**: List retrieval is the primary path for downstream integrations and UIs; without it, no other company interactions are possible.

**Independent Test**: Call the companies list endpoint with default pagination and filters; verify the response includes results, pagination metadata, and is usable standalone for syncing.

**Acceptance Scenarios**:

1. **Given** valid authorization and no filters, **When** the client requests the companies list, **Then** the response returns the first page of companies with default sort, page size, and pagination metadata.
2. **Given** valid authorization and filter parameters (e.g., status or updated-since), **When** the client requests the companies list, **Then** only matching companies are returned with correct pagination metadata.

---

### User Story 2 - View company detail (Priority: P2)

Support or operations user fetches a single company record to review identifiers, contact points, and status.

**Why this priority**: Detail lookup is needed for support and reconciliation when a company must be inspected individually.

**Independent Test**: Request a company by ID and confirm all required fields are present; test also covers the not-found path independently.

**Acceptance Scenarios**:

1. **Given** a valid company identifier and authorization, **When** the client requests the company detail, **Then** the response returns the company with identifiers, status, contact attributes, and timestamps.
2. **Given** an invalid or unknown company identifier, **When** the client requests the company detail, **Then** a not-found response is returned with a clear, consistent error payload.

---

### User Story 3 - Search companies (Priority: P3)

Integrator searches by name or domain to quickly locate a company before taking further action.

**Why this priority**: Search improves operator efficiency and reduces paging through long lists when the company name is partially known.

**Independent Test**: Invoke the search with a partial name and verify results are ranked and limited; can be validated without other stories.

**Acceptance Scenarios**:

1. **Given** a partial company name, **When** the client requests a search, **Then** the response returns the top-matching companies ordered by relevance with a result limit.
2. **Given** a search term that yields no matches, **When** the client requests a search, **Then** the response returns an empty result set with pagination metadata and no errors.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Requesting a page beyond the available range returns an empty page with correct pagination metadata rather than an error.
- Invalid or missing authorization yields a consistent error response without leaking details about company existence.
- Filter combinations that yield zero matches return an empty list with pagination metadata, not an error.
- Extremely long search queries are validated and rejected with a clear, bounded error response.
- Clients using page numbers must receive guidance to migrate; only cursor tokens are supported.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Provide an authenticated companies list endpoint using page-based pagination (request `page`, `size`) with a default sort applied when none is provided and a default `size` of 10 (maximum 200).
- **FR-002**: Support filtering the list by key attributes (e.g., status, market/region, updated-since timestamp) and sorting by name and last-updated timestamp.
- **FR-003**: Provide a company detail endpoint that returns identifiers, legal name, display name, status, primary domain(s), primary contact (name, email), created/updated timestamps, and external references.
- **FR-004**: Provide a search endpoint that accepts partial name or domain queries, returns relevance-ordered results, and enforces a maximum result window per request.
- **FR-005**: Return consistent error structures for unauthorized, not-found, validation errors, and rate limiting, including machine-readable codes and human-readable messages.
- **FR-006**: Include pagination metadata in list and search responses: `page { size, totalElements, totalPages, number }` using the requested `page`/`size` values.
- **FR-007**: Enforce request validation limits (e.g., maximum page size, maximum query length) and return validation errors without processing the request.

#### Acceptance Coverage

- FR-001 and FR-002: Verified by retrieving lists with and without filters, confirming ordering, page size limits, and pagination metadata.
- FR-003: Verified by fetching a known company ID and receiving all required attributes; invalid ID returns a not-found error structure.
- FR-004: Verified by searching with partial name/domain, ensuring relevance ordering and enforced result window limits.
- FR-005 and FR-007: Verified by exercising unauthorized requests, oversized page sizes, and overlong queries to confirm validation and rate-limit error payloads.
- FR-006: Verified by checking list and search responses include pagination metadata and correctly indicate when more pages exist.

### Key Entities *(include if feature involves data)*

- **Company**: Represents an organization; key attributes include companyId, legalName, displayName, status, primaryDomain(s), primaryContact (name, email), billing/market region, createdAt, updatedAt, and externalReferenceIds.
- **CompanySearchResult**: Represents a relevance-ranked subset of company attributes (companyId, displayName, primaryDomain, status, relevance score indicator) returned by search requests.

### Assumptions and Dependencies

- Companies API scope is read-only: list, detail, and search; no create/update/delete in this iteration.
- Authentication and authorization are provided by existing token management and scopes; callers must already possess valid tokens.
- Default pagination size is 50 items with a maximum of 100; larger requests are rejected with validation errors.
- Data freshness depends on upstream company data synchronization; the API reflects the current state available at request time.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can retrieve the first page of companies (default size) in under 2 seconds at the 95th percentile.
- **SC-002**: 95% of company detail lookups return the requested company or a not-found response within 2 seconds.
- **SC-003**: Search requests return the top results for partial name/domain queries within 2 seconds at the 95th percentile, with at least one relevant hit for 90% of known companies when searched by name substring.
- **SC-004**: Pagination metadata correctly indicates additional pages in 100% of list and search responses during functional testing, preventing over-fetch or missed pages.
