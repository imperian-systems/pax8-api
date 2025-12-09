# Feature Specification: Usage Summaries API

**Feature Branch**: `010-usage-summaries-api`  
**Created**: December 9, 2025  
**Status**: Draft  
**Input**: User description: "Implement usage summary API as shown in README.md"

## Clarifications

### Session 2025-12-09

- Q: Does UsageSummary have a status field like Invoices? → A: No - usage summaries have an `isTrial` boolean instead; no status enum exists per official Pax8 Partner API specification.
- Q: What is the API endpoint structure for listing usage summaries? → A: Usage summaries are accessed via `/subscriptions/{subscriptionId}/usage-summaries` (subscription-scoped), not as a standalone `/usage-summaries` endpoint.
- Q: What filters are available for usage summaries? → A: `resourceGroup`, `companyId`, and `sort` (by resourceGroup, currentCharges, partnerTotal) per official API spec.
- Q: What parameters are required for listing usage lines? → A: `usageDate` (yyyy-MM-dd) is required; `productId` is optional per official API spec.
- Q: Should client API follow README convenience pattern or mirror Pax8 API structure? → A: Mirror Pax8 structure - use `client.subscriptions.listUsageSummaries(subscriptionId)` pattern for consistency with official API and easier debugging.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List usage summaries for a subscription (Priority: P1) 🎯 MVP

Partner/integrator retrieves a paginated list of usage summaries for a specific subscription to view usage-based billing data, track consumption metrics, and reconcile usage charges with their internal systems for metered services.

**Why this priority**: Usage summary listing is the foundational operation for managing usage-based billing. Partners need to browse and filter usage data to monitor consumption, verify billing accuracy, and generate usage reports for customers.

**Independent Test**: Call the usage summaries list endpoint with a subscriptionId and optional page/size and filters (resourceGroup, companyId); verify the response includes usage summary records with pagination metadata.

**Acceptance Scenarios**:

1. **Given** valid authorization and a valid subscriptionId, **When** the client requests the usage summaries list, **Then** the response returns the first page of usage summaries with default pagination metadata.
2. **Given** valid authorization and pagination parameters (page, size), **When** the client requests the usage summaries list, **Then** the response returns the specified page of usage summaries with correct pagination metadata.
3. **Given** valid authorization and a resourceGroup filter, **When** the client requests the usage summaries list, **Then** only usage summaries matching that resource group are returned with correct pagination metadata.
4. **Given** valid authorization and a companyId filter, **When** the client requests the usage summaries list, **Then** only usage summaries for that company are returned with correct pagination metadata.
5. **Given** filters that match no usage summaries, **When** the client requests the usage summaries list, **Then** the response returns an empty list with pagination metadata indicating zero results.

---

### User Story 2 - View usage summary details (Priority: P2)

Partner/integrator retrieves full details of a specific usage summary to view aggregated usage data including current charges, partner totals, resource group, and vendor information for billing verification or customer inquiries.

**Why this priority**: Usage summary detail lookup is essential for troubleshooting usage-based billing issues, verifying consumption amounts, and providing customer support regarding specific usage periods.

**Independent Test**: Request a usage summary by ID and confirm all required fields are present including currentCharges, partnerTotal, resourceGroup, vendorName, and isTrial flag; test also covers the not-found path independently.

**Acceptance Scenarios**:

1. **Given** a valid usage summary identifier and authorization, **When** the client requests the usage summary detail, **Then** the response returns the usage summary with attributes including id, companyId, productId, resourceGroup, vendorName, currentCharges, partnerTotal, currencyCode, and isTrial.
2. **Given** an invalid or unknown usage summary identifier, **When** the client requests the usage summary detail, **Then** a not-found response is returned with a clear, consistent error payload.

---

### User Story 3 - List usage summary lines (Priority: P3)

Partner/integrator retrieves the individual usage line items for a usage summary to see detailed usage breakdowns including product details, quantities consumed, charges, and profit margins for granular usage analysis.

**Why this priority**: Line-level usage details are essential for understanding what makes up a usage summary total, enabling partners to verify consumption charges and provide detailed usage explanations to customers.

**Independent Test**: Request usage lines for a summary by ID with required usageDate parameter and optional productId filter; verify the response returns usage line records with product details, quantities, charges, and profit information.

**Acceptance Scenarios**:

1. **Given** a valid usage summary ID, usageDate, and authorization, **When** the client requests usage summary lines, **Then** the response returns a paginated list of usage lines with product details, quantities, charges, and profit information.
2. **Given** a valid usage summary ID, usageDate, and productId filter, **When** the client requests usage summary lines, **Then** only usage lines for that product are returned with correct pagination metadata.
3. **Given** an invalid or unknown usage summary ID, **When** the client requests usage summary lines, **Then** a not-found response is returned.
4. **Given** a usage summary with no lines for the specified usageDate, **When** the client requests usage summary lines, **Then** an empty list is returned with pagination metadata indicating zero results.

---

### Edge Cases

- What happens when requesting usage summaries with an invalid page number (negative or beyond available pages)? Returns an empty page with correct pagination metadata rather than an error.
- What happens when the size parameter exceeds the maximum allowed (200)? Returns a 422 validation error with a clear message indicating max size is 200.
- Invalid or missing authorization yields a consistent error response without leaking usage data.
- What happens when requesting lines for a usage summary that exists but user lacks access? Returns a 403 forbidden response.
- What happens when subscriptionId format is invalid (not a valid UUID)? Returns a 422 validation error indicating invalid subscriptionId format.
- What happens when usageDate is missing from usage lines request? Returns a 422 validation error indicating usageDate is required.
- What happens when usageDate format is invalid (not yyyy-MM-dd)? Returns a 422 validation error indicating invalid date format.
- What happens when requesting usage summaries for a subscription that doesn't exist? Returns a 404 not-found response.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated usage summaries list endpoint at `/subscriptions/{subscriptionId}/usage-summaries` using page-based pagination (page number and size) with configurable page size (default 10, maximum 200).
- **FR-002**: System MUST support filtering the usage summaries list by `companyId` and `resourceGroup`.
- **FR-003**: System MUST support sorting the usage summaries list by `resourceGroup`, `currentCharges`, or `partnerTotal`.
- **FR-004**: System MUST provide a usage summary detail endpoint at `/usage-summaries/{usageSummaryId}` that returns a single usage summary by ID.
- **FR-005**: System MUST provide a usage lines endpoint at `/usage-summaries/{usageSummaryId}/usage-lines` that returns a paginated list of usage lines for a specific usage summary, requiring `usageDate` parameter.
- **FR-006**: System MUST include pagination metadata in list responses: page number, page size, total elements, and total pages.
- **FR-007**: System MUST return consistent error structures for unauthorized (401), forbidden (403), not-found (404), validation errors (422), and rate limiting (429) responses.
- **FR-008**: System MUST enforce request validation limits (e.g., maximum page size) and return validation errors without processing the request.
- **FR-009**: Client API MUST mirror Pax8 API structure with usage summaries accessed via `client.subscriptions.listUsageSummaries(subscriptionId)` and usage summary details via `client.usageSummaries.get(id)` and `client.usageSummaries.listLines(id, options)`.

### Key Entities

- **UsageSummary**: Represents aggregated usage data for a billing period. Attributes: `id` (uuid), `companyId` (uuid), `productId` (uuid), `resourceGroup` (string - resource group assigned to the summary), `vendorName` (string), `currentCharges` (number - charges for the current month), `currencyCode` (string - ISO 4217 currency code), `partnerTotal` (number - partner total for current month), `isTrial` (boolean - indicates if this is a trial).
- **UsageLine**: Represents a detailed usage record within a summary. Attributes: `usageSummaryId` (uuid), `usageDate` (ISO 8601 date), `productName` (string), `productId` (uuid), `unitOfMeasure` (string), `quantity` (number), `currentCharges` (number), `currentProfit` (number), `partnerTotal` (number), `unitPrice` (number), `currencyCode` (string - ISO 4217), `isTrial` (boolean).
- **ListUsageSummariesOptions**: Query parameters for listing usage summaries. Attributes: `subscriptionId` (required path parameter - uuid), `page` (0-indexed page number), `size` (page size, 1-200), `sort` (optional - resourceGroup, currentCharges, partnerTotal), `resourceGroup` (optional filter), `companyId` (optional filter).
- **ListUsageLinesOptions**: Query parameters for listing usage lines. Attributes: `usageSummaryId` (required path parameter - uuid), `usageDate` (required - yyyy-MM-dd), `productId` (optional filter).
- **UsageSummaryListResponse**: Paginated response containing `content` (UsageSummary[]) and `page` metadata (size, totalElements, totalPages, number).
- **UsageLineListResponse**: Paginated response containing `content` (UsageLine[]) and `page` metadata (size, totalElements, totalPages, number).

### Assumptions

- Usage Summaries API follows the same page-based pagination pattern established by Companies, Contacts, Products, Orders, Subscriptions, and Invoices APIs.
- The API client will use the existing authentication mechanism (OAuth 2.0 Client Credentials flow) already implemented in the Pax8Client.
- Usage summaries are read-only resources; the Pax8 API does not support creating, updating, or deleting usage summaries directly (they are generated by the metering system).
- Usage summaries are accessed via subscription context (`/subscriptions/{subscriptionId}/usage-summaries`), not as a standalone resource.
- Usage lines require a `usageDate` parameter (yyyy-MM-dd format) as filtering by date is mandatory for this endpoint.
- The `isTrial` field indicates whether the usage is associated with a trial subscription.
- Currency amounts (`currentCharges`, `partnerTotal`, `currentProfit`) are in the currency specified by `currencyCode`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can retrieve the first page of usage summaries for a subscription (default size) in under 2 seconds at the 95th percentile.
- **SC-002**: 95% of usage summary detail lookups return the requested summary or a not-found response within 2 seconds.
- **SC-003**: 95% of usage line requests return results within 2 seconds.
- **SC-004**: Pagination metadata correctly indicates additional pages in 100% of list responses during functional testing.
- **SC-005**: Resource group and company filtering correctly returns only matching usage summaries in 100% of filtered requests.
- **SC-006**: 100% of invalid requests (invalid IDs, exceeded page size, missing required parameters) return appropriate validation errors without leaking data.
