# Feature Specification: Invoices API

**Feature Branch**: `009-invoices-api`  
**Created**: December 8, 2025  
**Status**: Draft  
**Input**: User description: "Implement Invoices API as shown in README.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List invoices with pagination and filters (Priority: P1) 🎯 MVP

Partner/integrator retrieves a paginated list of invoices to view billing records, track payment status, and reconcile financial data with their internal accounting systems.

**Why this priority**: Invoice listing is the foundational operation for any billing and financial management workflow. Partners need to browse and filter invoices to monitor revenue, track payments, and generate financial reports.

**Independent Test**: Call the invoices list endpoint with page/size and optional companyId filter; verify the response includes invoice records with pagination metadata.

**Acceptance Scenarios**:

1. **Given** valid authorization and no filters, **When** the client requests the invoices list, **Then** the response returns the first page of invoices with default pagination metadata.
2. **Given** valid authorization and pagination parameters (page, size), **When** the client requests the invoices list, **Then** the response returns the specified page of invoices with correct pagination metadata.
3. **Given** valid authorization and a companyId filter, **When** the client requests the invoices list, **Then** only invoices for that company are returned with correct pagination metadata.
4. **Given** filters that match no invoices, **When** the client requests the invoices list, **Then** the response returns an empty list with pagination metadata indicating zero results.

---

### User Story 2 - View invoice details (Priority: P2)

Partner/integrator retrieves full details of a specific invoice to view billing amounts, due dates, payment status, and line item breakdowns for financial reconciliation or customer support purposes.

**Why this priority**: Invoice detail lookup is essential for troubleshooting billing issues, verifying charges, and providing customer support regarding specific billing periods.

**Independent Test**: Request an invoice by ID and confirm all required fields are present including total amounts, dates, status, and company reference; test also covers the not-found path independently.

**Acceptance Scenarios**:

1. **Given** a valid invoice identifier and authorization, **When** the client requests the invoice detail, **Then** the response returns the invoice with attributes including id, companyId, total, status, invoiceDate, dueDate, and other relevant fields.
2. **Given** an invalid or unknown invoice identifier, **When** the client requests the invoice detail, **Then** a not-found response is returned with a clear, consistent error payload.

---

### User Story 3 - List invoice line items (Priority: P3)

Partner/integrator retrieves the individual line items of an invoice to see detailed charge breakdowns including product/service descriptions, quantities, and amounts for each billing item.

**Why this priority**: Line item details are essential for understanding what makes up an invoice total, enabling partners to verify charges and provide detailed billing explanations to customers.

**Independent Test**: Request line items for an invoice by ID with optional pagination; verify the response returns line item records with product, quantity, and amount details.

**Acceptance Scenarios**:

1. **Given** a valid invoice ID and authorization, **When** the client requests invoice line items, **Then** the response returns a paginated list of line items with product details, quantities, and amounts.
2. **Given** a valid invoice ID and pagination parameters (page, size), **When** the client requests invoice line items, **Then** the response returns the specified page of line items with correct pagination metadata.
3. **Given** an invalid or unknown invoice ID, **When** the client requests invoice line items, **Then** a not-found response is returned.
4. **Given** an invoice with no line items, **When** the client requests invoice line items, **Then** an empty list is returned with pagination metadata indicating zero results.

---

### User Story 4 - List draft invoice items (Priority: P4)

Partner/integrator retrieves pending draft invoice items for a company to preview upcoming charges before they are finalized on the next invoice, enabling proactive cost management and customer communication.

**Why this priority**: Draft invoice visibility is valuable for forecasting and customer communication but is used less frequently than accessing finalized invoices. It helps partners anticipate and explain upcoming charges.

**Independent Test**: Request draft items for a company by companyId with optional pagination; verify the response returns pending line items that are not yet invoiced.

**Acceptance Scenarios**:

1. **Given** a valid companyId and authorization, **When** the client requests draft invoice items, **Then** the response returns a paginated list of pending line items awaiting invoicing.
2. **Given** a valid companyId and pagination parameters (page, size), **When** the client requests draft invoice items, **Then** the response returns the specified page of draft items with correct pagination metadata.
3. **Given** an invalid or unknown companyId, **When** the client requests draft invoice items, **Then** a not-found response is returned.
4. **Given** a company with no pending draft items, **When** the client requests draft invoice items, **Then** an empty list is returned with pagination metadata indicating zero results.

---

### Edge Cases

- What happens when requesting invoices with an invalid page number (negative or beyond available pages)? Returns an empty page with correct pagination metadata rather than an error.
- What happens when the size parameter exceeds the maximum allowed (200)? Returns a 422 validation error with a clear message indicating max size is 200.
- Invalid or missing authorization yields a consistent error response without leaking invoice details.
- What happens when requesting line items for an invoice that exists but user lacks access? Returns a 403 forbidden response.
- What happens when companyId format is invalid (not a valid UUID)? Returns a 422 validation error indicating invalid companyId format.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated invoices list endpoint using page-based pagination (page number and size) with configurable page size (default 10, maximum 200).
- **FR-002**: System MUST support filtering the invoices list by `companyId`.
- **FR-003**: System MUST provide an invoice detail endpoint that returns a single invoice by ID with attributes including id, companyId, total, status, invoiceDate, dueDate, paidDate, and other relevant fields.
- **FR-004**: System MUST provide an invoice line items endpoint that returns a paginated list of line items for a specific invoice.
- **FR-005**: System MUST provide a draft invoice items endpoint that returns a paginated list of pending/draft line items for a specific company.
- **FR-006**: System MUST include pagination metadata in list responses: page number, page size, total elements, and total pages.
- **FR-007**: System MUST return consistent error structures for unauthorized (401), forbidden (403), not-found (404), validation errors (422), and rate limiting (429) responses.
- **FR-008**: System MUST enforce request validation limits (e.g., maximum page size) and return validation errors without processing the request.

### Key Entities

- **Invoice**: Represents a billing record for a company. Attributes: `id` (uuid), `companyId` (uuid), `invoiceDate` (ISO 8601), `dueDate` (ISO 8601), `paidDate` (ISO 8601, nullable), `total` (number), `balance` (number), `status` (InvoiceStatus), `carriedBalance` (number, nullable), `partnerName` (string).
- **InvoiceStatus**: Enum representing invoice payment states: 'Unpaid' | 'Paid' | 'Void' | 'Pending' | 'Overdue'.
- **InvoiceItem**: Represents a line item on an invoice or draft. Attributes: `id` (uuid), `invoiceId` (uuid, nullable for drafts), `companyId` (uuid), `subscriptionId` (uuid, nullable), `productId` (uuid), `productName` (string), `quantity` (number), `unitPrice` (number), `total` (number), `startDate` (ISO 8601), `endDate` (ISO 8601), `chargeType` (ChargeType).
- **ChargeType**: Enum representing the type of charge: 'NewCharge' | 'Renewal' | 'ProRata' | 'Adjustment' | 'Credit'.
- **ListInvoicesOptions**: Query parameters for listing invoices. Attributes: `page` (0-indexed page number), `size` (page size, 1-200), `companyId` (optional filter).
- **ListItemsOptions**: Query parameters for listing invoice items. Attributes: `page` (0-indexed page number), `size` (page size, 1-200).
- **InvoiceListResponse**: Paginated response containing `content` (Invoice[]) and `page` metadata (size, totalElements, totalPages, number).
- **InvoiceItemListResponse**: Paginated response containing `content` (InvoiceItem[]) and `page` metadata (size, totalElements, totalPages, number).

### Assumptions

- Invoices API follows the same page-based pagination pattern established by Companies, Contacts, Products, Orders, and Subscriptions APIs.
- The API client will use the existing authentication mechanism (OAuth 2.0 Client Credentials flow) already implemented in the Pax8Client.
- Invoices are read-only resources; the Pax8 API does not support creating, updating, or deleting invoices directly (invoices are generated by the billing system).
- Draft invoice items represent charges that will appear on the next billing cycle and share the same structure as invoice items.
- The `companyId` filter on the invoices list endpoint filters by the billed company, not the partner company.
- Invoice item totals are calculated as `quantity * unitPrice` and may include adjustments or credits reflected in the `chargeType`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can retrieve the first page of invoices (default size) in under 2 seconds at the 95th percentile.
- **SC-002**: 95% of invoice detail lookups return the requested invoice or a not-found response within 2 seconds.
- **SC-003**: 95% of invoice line item requests return results within 2 seconds.
- **SC-004**: 95% of draft invoice item requests return results within 2 seconds.
- **SC-005**: Pagination metadata correctly indicates additional pages in 100% of list responses during functional testing.
- **SC-006**: 100% of invalid requests (invalid IDs, exceeded page size) return appropriate validation errors without leaking data.
