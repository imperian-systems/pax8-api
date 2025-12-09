# Feature Specification: Quotes API

**Feature Branch**: `011-quotes-api`  
**Created**: December 9, 2025  
**Status**: Draft  
**Input**: User description: "Implement the quotes API as defined in https://devx.pax8.com/openapi/6761fd80721228003dd0af1a"

## Clarifications

### Session 2025-12-09

- Q: Should client validate quote status transitions or pass through to server? → A: Pass-through - client accepts any status value; server validates transitions and returns QUOTE_VALIDATION error for invalid transitions.
- Q: How should client handle /v2/ base path for Quotes API vs /v1/ for other APIs? → A: Single client - Pax8Client handles both /v1 and /v2 with path switching per method; quotes methods use /v2/ base path internally.
- Q: How should line item types (Standard, Custom, UsageBased) be modeled in TypeScript? → A: Discriminated union - single AddLineItemPayload type with `type` literal discriminator for compile-time type narrowing.
- Q: How should pagination handle limit/page (v2) vs page/size (v1) inconsistency? → A: Mirror API - use limit/page for quotes exactly as Pax8 v2 API defines; document the difference from v1 APIs.
- Q: Does Quotes API use same authentication as v1 APIs? → A: Reuse existing auth - same OAuth 2.0 client credentials flow and bearer token works for v2 endpoints.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Quote Lifecycle (Priority: P1) 🎯 MVP

Partner/integrator creates, retrieves, updates, and deletes quotes to generate sales proposals for their customers. This is the foundational workflow for the entire quoting system.

**Why this priority**: Quote CRUD operations are the core of the quoting system. Partners cannot use any other quoting features without the ability to create and manage quotes. This is the minimum viable product for quote functionality.

**Independent Test**: Call quote creation with a clientId, retrieve the created quote by ID, update quote details, and delete the quote; verify all CRUD operations work correctly with proper response structures.

**Acceptance Scenarios**:

1. **Given** valid authorization and a valid clientId, **When** the client creates a new quote, **Then** a new quote is created with status "draft" and returns the complete quote response with id, referenceCode, and default values.
2. **Given** valid authorization, **When** the client requests a paginated list of quotes, **Then** the response returns quotes with pagination metadata, status counts, and filtering by status/search.
3. **Given** valid authorization and a valid quoteId, **When** the client requests a quote by ID, **Then** the response returns the complete quote with all nested objects (client, partner, lineItems, totals, attachments).
4. **Given** valid authorization and a valid quoteId, **When** the client updates a quote with new expiresOn, introMessage, published, status, and termsAndDisclaimers, **Then** the quote is updated and returns the updated quote response.
5. **Given** valid authorization and a valid quoteId, **When** the client deletes a quote, **Then** the quote is deleted and returns 204 No Content.
6. **Given** an invalid or unknown quoteId, **When** the client requests/updates/deletes, **Then** a not-found response is returned with appropriate error type.

---

### User Story 2 - Manage Quote Line Items (Priority: P2)

Partner/integrator adds, updates, and removes line items from a quote to build the product/service offering. Supports standard products, custom line items, and usage-based products.

**Why this priority**: Line items are the substance of a quote - without products/services listed, a quote has no business value. This must come after quote CRUD but before sharing/preferences.

**Independent Test**: Create a quote, add line items of different types (Standard, Custom, UsageBased), update line item quantities/prices, delete individual and bulk line items; verify all line item operations work correctly.

**Acceptance Scenarios**:

1. **Given** a valid quote in draft status, **When** the client adds standard line items with productId, billingTerm, quantity, and price, **Then** line items are created and returned with calculated totals.
2. **Given** a valid quote in draft status, **When** the client adds custom line items with productName, productSku, billingTerm, cost, and price, **Then** custom line items are created with specified values.
3. **Given** a valid quote in draft status, **When** the client adds usage-based line items with productId, usageBased configuration, and cost, **Then** usage-based line items are created with proper usage type settings.
4. **Given** a valid quote with existing line items, **When** the client updates line items with new quantity, price, or effectiveDate, **Then** line items are updated and totals recalculated.
5. **Given** a valid quote with line items, **When** the client deletes a single line item by lineItemId, **Then** the line item is removed and returns 204 No Content.
6. **Given** a valid quote with multiple line items, **When** the client bulk deletes line items by providing lineItemIds array, **Then** all specified line items are removed and returns 204 No Content.
7. **Given** a quote with 30 line items (maximum), **When** the client attempts to add another line item, **Then** an error response is returned indicating the limit is exceeded.

---

### User Story 3 - Manage Quote Sections (Priority: P3)

Partner/integrator organizes line items into named sections within a quote for better presentation and clarity to customers.

**Why this priority**: Sections improve quote presentation but are not required for basic quoting functionality. Quotes can work without sections, making this a polish feature.

**Independent Test**: Create sections within a quote, update section names and ordering, assign line items to sections; verify sections organize line items correctly.

**Acceptance Scenarios**:

1. **Given** a valid quote, **When** the client retrieves sections, **Then** the response returns all sections with their names, order, and associated line items.
2. **Given** a valid quote, **When** the client creates a new section with a name, **Then** a new section is created and returned with all sections.
3. **Given** a valid quote with sections, **When** the client updates sections with new names, order, or line item assignments, **Then** sections are updated accordingly.

---

### User Story 4 - Manage Quote Access List (Priority: P4)

Partner/integrator shares quotes with customers by managing an access list of email recipients who can view and respond to the quote.

**Why this priority**: Sharing is essential for quotes to reach customers but depends on having a complete quote first. This is the final step in the quote workflow.

**Independent Test**: Add email recipients to a quote's access list, retrieve the access list, remove entries; verify access control works correctly.

**Acceptance Scenarios**:

1. **Given** a valid quote, **When** the client retrieves the access list, **Then** the response returns all access list entries with email, id, link, and userId.
2. **Given** a valid quote, **When** the client adds one or more email addresses to the access list, **Then** entries are created with unique links for each recipient.
3. **Given** a valid quote with access list entries, **When** the client deletes an access list entry by accessListEntryId, **Then** the entry is removed and returns 204 No Content.
4. **Given** an email already exists in the access list, **When** the client attempts to add it again, **Then** an error response indicates the email already exists.

---

### User Story 5 - Manage Quote Preferences (Priority: P5)

Partner/integrator configures default settings for quotes including expiration days, intro message, and terms/disclaimers that apply to all new quotes.

**Why this priority**: Preferences are partner-level settings that enhance consistency but are not required for individual quote operations. Low priority as quotes work without custom preferences.

**Independent Test**: Retrieve current preferences, update preferences with new values; verify preferences are persisted and returned correctly.

**Acceptance Scenarios**:

1. **Given** valid authorization, **When** the client retrieves quote preferences, **Then** the response returns daysToExpire, introMessage, and termsAndDisclaimers.
2. **Given** valid authorization and preference values, **When** the client updates preferences, **Then** preferences are persisted and returned with the new values.
3. **Given** no preferences exist, **When** the client creates preferences, **Then** new preferences are created and returned with 201 Created.

---

### Edge Cases

- What happens when requesting a quote that doesn't exist? Returns 400 Bad Request with QUOTE_NOT_FOUND error type.
- What happens when trying to add line items to a quote that exceeds 30 item limit? Returns 400 Bad Request with LINE_ITEM_LIMIT_EXCEEDED error type.
- What happens when authorization fails? Returns 403 with appropriate ACCESS_DENIED error type.
- What happens when adding an email to access list that already exists? Returns 400 with QUOTE_ACCESS_EMAIL_EXISTS error type.
- What happens when deleting a line item that has required relationships? Must delete related items together or delete in correct order.
- What happens when pagination parameters are invalid? Returns 400 Bad Request with INVALID_REQUEST_PARAMETER error type.
- What happens when required fields are missing in create/update payloads? Returns 400 with REQUEST_VALIDATION_FAILED or PAYLOAD_VALIDATION error type.
- What happens when quote status transition is invalid? Returns 400 with QUOTE_VALIDATION error type.

## Requirements *(mandatory)*

### Functional Requirements

#### Quote Core Operations
- **FR-001**: System MUST provide a GET /v2/quotes endpoint that returns a paginated list of quotes with status counts, supporting limit, page, sort, search, status filter, and account filter parameters.
- **FR-002**: System MUST provide a POST /v2/quotes endpoint that creates a new quote for a specified clientId, optionally linking to a quoteRequestId.
- **FR-003**: System MUST provide a GET /v2/quotes/{quoteId} endpoint that returns a single quote with all nested details (client, partner, lineItems, totals, attachments).
- **FR-004**: System MUST provide a PUT /v2/quotes/{quoteId} endpoint that updates quote details including expiresOn, introMessage, published, status, and termsAndDisclaimers.
- **FR-005**: System MUST provide a DELETE /v2/quotes/{quoteId} endpoint that deletes a quote by ID.

#### Line Item Operations
- **FR-006**: System MUST provide a POST /v2/quotes/{quoteId}/line-items endpoint that adds 1 or more line items (Standard, Custom, or UsageBased types) to a quote.
- **FR-007**: System MUST provide a PUT /v2/quotes/{quoteId}/line-items endpoint that updates 1 or more existing line items.
- **FR-008**: System MUST provide a DELETE /v2/quotes/{quoteId}/line-items/{lineItemId} endpoint that deletes a single line item.
- **FR-009**: System MUST provide a POST /v2/quotes/{quoteId}/line-items/bulk-delete endpoint that deletes multiple line items by IDs.
- **FR-010**: System MUST enforce a maximum of 30 line items per quote.

#### Section Operations
- **FR-011**: System MUST provide a GET /v2/quotes/{quoteId}/sections endpoint that returns all sections for a quote.
- **FR-012**: System MUST provide a POST /v2/quotes/{quoteId}/sections endpoint that creates a new section within a quote.
- **FR-013**: System MUST provide a PUT /v2/quotes/{quoteId}/sections endpoint that updates sections within a quote.

#### Access List Operations
- **FR-014**: System MUST provide a GET /v2/quotes/{quoteId}/access-list endpoint that returns access list entries for a quote.
- **FR-015**: System MUST provide a POST /v2/quotes/{quoteId}/access-list endpoint that adds email recipients to the access list.
- **FR-016**: System MUST provide a DELETE /v2/quotes/{quoteId}/access-list/{accessListEntryId} endpoint that removes an access list entry.

#### Preferences Operations
- **FR-017**: System MUST provide a GET /v2/quote-preferences endpoint that returns partner-level quote preferences.
- **FR-018**: System MUST provide a PUT /v2/quote-preferences endpoint that creates or updates quote preferences.

#### Error Handling
- **FR-019**: System MUST return consistent error structures with status, message, type, instance, and details array for all error responses.
- **FR-020**: System MUST use appropriate HTTP status codes: 200/201 for success, 204 for deletions, 400 for bad requests, 403 for authorization errors.

### Key Entities

- **Quote**: Represents a sales proposal. Attributes: `id` (uuid), `status` (draft|assigned|sent|closed|declined|accepted|changes_requested|expired), `client` (ClientDetails), `partner` (PartnerDetails), `lineItems` (array), `totals` (InvoiceTotals), `attachments` (array), `referenceCode` (string), `introMessage` (string), `termsAndDisclaimers` (string), `expiresOn` (datetime), `published` (boolean), `publishedOn` (datetime), `createdBy` (string), `createdOn` (datetime), `respondedOn` (datetime), `revokedOn` (datetime), `acceptedBy` (AcceptedBy), `quoteRequestId` (uuid).

- **LineItem**: Represents a product/service in a quote. Attributes: `id` (uuid), `billingTerm` (Monthly|Annual|1 Year|2 Year|3 Year|Trial|Activation|One-Time), `product` (Product), `quantity` (integer), `price` (AmountCurrency), `cost` (AmountCurrency), `totals` (InvoiceTotals), `effectiveDate` (datetime), `note` (string max 2000), `subscriptionId` (uuid), `commitmentTerm` (CommitmentTerm), `relationship` (LineItemRelationship), `usageBased` (UsageBased).

- **LineItemType**: Discriminator for line item payloads: `Standard` (linked to productId), `Custom` (custom productName/productSku), `UsageBased` (productId with usageBased config).

- **Section**: Groups line items for presentation. Attributes: `id` (uuid), `name` (string), `order` (integer), `lineItems` (array of SectionLineItem with lineItemId and order).

- **AccessListEntry**: Recipient who can access a quote. Attributes: `id` (uuid), `email` (string), `link` (string - unique access URL), `userId` (uuid).

- **QuotePreferences**: Partner-level defaults. Attributes: `daysToExpire` (integer), `introMessage` (string), `termsAndDisclaimers` (string).

- **InvoiceTotals**: Financial summary. Attributes: `initialCost`, `initialProfit`, `initialTotal`, `recurringCost`, `recurringProfit`, `recurringTotal` (all AmountCurrency with amount and currency).

- **Product**: Product details within line item. Attributes: `id` (uuid), `name` (string), `sku` (string), `type` (Standalone|Solution|Custom), `isMspOnly` (boolean).

- **UsageBased**: Usage-based configuration. Attributes: `type` (PRICE_FLAT|PRICE_VARIES|QTY_VARIES), `displayNote` (boolean).

### Assumptions

- Quotes API uses v2 endpoints (base path /v2/) which differs from other Pax8 APIs that use /v1/.
- Quotes API uses the same OAuth 2.0 client credentials authentication as v1 APIs; bearer tokens are interchangeable.
- Pagination uses limit/page parameters (not page/size like other Pax8 APIs).
- Quote statuses follow a workflow: draft → assigned → sent → (accepted|declined|expired|closed|changes_requested).
- Line items with required relationships (requiredLineItemId, requiredSubscriptionId) must be added together in the same request.
- Custom line items have different productName/productSku max lengths (255/100 characters respectively).
- The API uses "account" filter to scope results to "user" (default) or "partner" level.
- Sort parameter format is "fieldName,direction" (e.g., "status,desc").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Partners can create a new quote with a clientId in under 2 seconds at the 95th percentile.
- **SC-002**: Partners can retrieve a paginated list of quotes with filters in under 2 seconds at the 95th percentile.
- **SC-003**: Partners can add line items to a quote (up to 30 items) with all three types (Standard, Custom, UsageBased) correctly.
- **SC-004**: 100% of quote lifecycle operations (create, read, update, delete) return appropriate responses with correct data structures.
- **SC-005**: 100% of access list operations correctly manage quote sharing with valid unique links per recipient.
- **SC-006**: 100% of error responses include proper error type classification from the defined error enumeration.
- **SC-007**: Section operations correctly organize line items with proper ordering and assignment.
- **SC-008**: Quote preferences are correctly persisted and applied to partner-level settings.
