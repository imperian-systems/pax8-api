# Feature Specification: Subscriptions API

**Feature Branch**: `007-subscriptions-api`  
**Created**: December 8, 2025  
**Status**: Draft  
**Input**: User description: "Implement Subscriptions API as shown in README.md"

## Clarifications

### Session 2025-12-08
- Q: What fields should UpdateSubscriptionRequest support? → A: Quantity only (per README example and Pax8 API pattern).
- Q: Is billingDate required or optional for cancellation? → A: Optional; omit for immediate cancellation.
- Q: Should Subscription include commitment-related fields? → A: Yes, include full commitment details (commitmentTermId, commitmentTermMonths, commitmentEndDate).
- Q: What detail level should SubscriptionHistory records capture? → A: Standard: action, timestamp, old/new quantity, userId.
- Q: What HTTP response indicates successful cancellation? → A: HTTP 204 No Content (per project pattern and REST conventions).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List subscriptions with pagination and filters (Priority: P1) 🎯 MVP

Partner/integrator retrieves a paginated list of subscriptions to view active service agreements, monitor subscription status, and sync subscription data into their internal systems.

**Why this priority**: Subscription listing is the foundational operation for any subscription management workflow. Partners need to browse and filter subscriptions to monitor service usage, track renewals, and reconcile with billing systems.

**Independent Test**: Call the subscriptions list endpoint with page/size and optional filters (companyId, productId, status); verify the response includes subscription records with pagination metadata.

**Acceptance Scenarios**:

1. **Given** valid authorization and no filters, **When** the client requests the subscriptions list, **Then** the response returns the first page of subscriptions with default pagination metadata.
2. **Given** valid authorization and pagination parameters (page, size), **When** the client requests the subscriptions list, **Then** the response returns the specified page of subscriptions with correct pagination metadata.
3. **Given** valid authorization and a companyId filter, **When** the client requests the subscriptions list, **Then** only subscriptions for that company are returned with correct pagination metadata.
4. **Given** valid authorization and a productId filter, **When** the client requests the subscriptions list, **Then** only subscriptions for that product are returned with correct pagination metadata.
5. **Given** valid authorization and a status filter (e.g., 'Active'), **When** the client requests the subscriptions list, **Then** only subscriptions with that status are returned.
6. **Given** filters that match no subscriptions, **When** the client requests the subscriptions list, **Then** the response returns an empty list with pagination metadata indicating zero results.

---

### User Story 2 - View subscription details (Priority: P2)

Partner/integrator retrieves full details of a specific subscription to view quantity, billing terms, status, and associated company/product information for subscription management or support purposes.

**Why this priority**: Subscription detail lookup is essential for troubleshooting subscription issues, verifying subscription configuration, and providing customer support.

**Independent Test**: Request a subscription by ID and confirm all required fields are present including quantity, status, billing information, and dates; test also covers the not-found path independently.

**Acceptance Scenarios**:

1. **Given** a valid subscription identifier and authorization, **When** the client requests the subscription detail, **Then** the response returns the subscription with attributes including id, companyId, productId, quantity, status, billingTerm, startDate, and other relevant fields.
2. **Given** an invalid or unknown subscription identifier, **When** the client requests the subscription detail, **Then** a not-found response is returned with a clear, consistent error payload.

---

### User Story 3 - Update subscription quantity (Priority: P3)

Partner/integrator updates an existing subscription's quantity to scale service usage up or down for a customer.

**Why this priority**: Quantity updates are the most common subscription modification operation. Partners need to adjust seat counts or usage quantities as customer needs change.

**Independent Test**: Submit a valid update request with a new quantity; verify the response returns the updated subscription with the new quantity applied.

**Acceptance Scenarios**:

1. **Given** a valid subscription ID, authorization, and a valid quantity update, **When** the client updates the subscription, **Then** the response returns the updated subscription with the new quantity.
2. **Given** a valid subscription ID but an invalid quantity (zero, negative, or exceeding limits), **When** the client updates the subscription, **Then** a validation error response is returned indicating the quantity is invalid.
3. **Given** an invalid or unknown subscription ID, **When** the client attempts to update, **Then** a not-found response is returned.
4. **Given** a subscription in a status that does not allow modification (e.g., 'Cancelled'), **When** the client attempts to update, **Then** an appropriate error response is returned indicating the subscription cannot be modified.

---

### User Story 4 - Cancel a subscription (Priority: P4)

Partner/integrator cancels a subscription to terminate a service agreement, optionally specifying a cancellation effective date.

**Why this priority**: Subscription cancellation is a critical business operation but is less frequent than viewing or updating subscriptions. It requires careful handling to ensure proper billing and service termination.

**Independent Test**: Submit a valid cancellation request; verify the operation completes successfully and the subscription status is updated appropriately.

**Acceptance Scenarios**:

1. **Given** a valid active subscription ID and authorization, **When** the client cancels the subscription, **Then** the operation completes successfully (void response or confirmation).
2. **Given** a valid subscription ID and a future billing date, **When** the client cancels the subscription with that date, **Then** the subscription is scheduled for cancellation on that date.
3. **Given** an invalid or unknown subscription ID, **When** the client attempts to cancel, **Then** a not-found response is returned.
4. **Given** a subscription already in 'Cancelled' status, **When** the client attempts to cancel, **Then** an appropriate error response is returned indicating the subscription is already cancelled.

---

### User Story 5 - View subscription history (Priority: P5)

Partner/integrator retrieves the change history of a subscription to audit past modifications, track quantity changes, and review billing adjustments.

**Why this priority**: Subscription history is valuable for auditing and troubleshooting but is an auxiliary feature that enhances the core subscription management capabilities.

**Independent Test**: Request history for a subscription by ID; verify the response returns an array of historical records with timestamps and change details.

**Acceptance Scenarios**:

1. **Given** a valid subscription ID and authorization, **When** the client requests subscription history, **Then** the response returns an array of history records with action types, dates, and relevant details.
2. **Given** an invalid or unknown subscription ID, **When** the client requests subscription history, **Then** a not-found response is returned.
3. **Given** a subscription with no history (newly created), **When** the client requests subscription history, **Then** an empty array or initial creation record is returned.

---

### Edge Cases

- What happens when requesting subscriptions with an invalid page number (negative or beyond available pages)? Returns an empty page with correct pagination metadata rather than an error.
- What happens when the size parameter exceeds the maximum allowed (200)? Returns a 422 validation error with a clear message indicating max size is 200.
- Invalid or missing authorization yields a consistent error response without leaking subscription details.
- Updating a subscription with the same quantity as current? Returns success with unchanged subscription.
- Cancelling a subscription with an invalid billingDate format? Returns a validation error indicating invalid date format.
- What happens when cancellation date is in the past? Returns a validation error indicating date must be in the future.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated subscriptions list endpoint using page-based pagination (page number and size) with configurable page size (default 10, maximum 200).
- **FR-002**: System MUST support filtering the subscriptions list by `companyId`, `productId`, and `status`.
- **FR-003**: System MUST support sorting the subscriptions list via the `sort` parameter.
- **FR-004**: System MUST provide a subscription detail endpoint that returns a single subscription by ID with attributes including id, companyId, productId, quantity, status, billingTerm, startDate, endDate, createdDate, and other relevant fields.
- **FR-005**: System MUST provide a subscription update endpoint that accepts a subscription ID and update payload (quantity) and returns the updated subscription.
- **FR-006**: System MUST validate subscription update requests: quantity must be a positive integer.
- **FR-007**: System MUST provide a subscription cancellation endpoint that accepts a subscription ID and optional cancellation options (billingDate) and completes without returning content.
- **FR-008**: System MUST provide a subscription history endpoint that returns an array of historical change records for a subscription.
- **FR-009**: System MUST return consistent error structures for unauthorized (401), forbidden (403), not-found (404), validation errors (422), and rate limiting (429) responses.
- **FR-010**: System MUST include pagination metadata in list responses: page number, page size, total elements, and total pages.
- **FR-011**: System MUST enforce request validation limits (e.g., maximum page size) and return validation errors without processing the request.

### Key Entities

- **Subscription**: Represents an active service agreement. Attributes: `id` (uuid), `companyId` (uuid), `productId` (uuid), `quantity` (number), `startDate` (ISO 8601), `endDate` (ISO 8601, nullable), `createdDate` (ISO 8601), `billingStart` (ISO 8601), `status` (SubscriptionStatus), `price` (number), `billingTerm` (BillingTerm), `commitmentTermId` (uuid, nullable), `commitmentTermMonths` (number, nullable), `commitmentEndDate` (ISO 8601, nullable).
- **SubscriptionStatus**: Enum representing subscription lifecycle states: 'Active' | 'Cancelled' | 'PendingManual' | 'PendingAutomated' | 'PendingCancel' | 'WaitingForDetails' | 'Trial' | 'Converted' | 'PendingActivation' | 'Activated'.
- **BillingTerm**: Enum representing billing frequency: 'Monthly' | 'Annual' | '2-Year' | '3-Year' | 'One-Time' | 'Trial' | 'Activation'.
- **UpdateSubscriptionRequest**: Attributes: `quantity` (number, required).
- **CancelOptions**: Attributes: `billingDate` (ISO 8601 date string, optional - specifies when cancellation takes effect).
- **SubscriptionHistory**: Represents a historical change record. Attributes: `id` (uuid), `subscriptionId` (uuid), `action` (string - e.g., 'QuantityUpdate', 'StatusChange', 'Created'), `date` (ISO 8601), `userId` (uuid, nullable), `previousQuantity` (number, nullable), `newQuantity` (number, nullable).
- **ListSubscriptionsOptions**: Query parameters for listing subscriptions. Attributes: `page` (0-indexed page number), `size` (page size, 1-200), `sort` (sort field/direction), `companyId` (optional filter), `productId` (optional filter), `status` (optional filter).
- **SubscriptionListResponse**: Paginated response containing `content` (Subscription[]) and `page` metadata (size, totalElements, totalPages, number).

### Assumptions

- Subscriptions API follows the same page-based pagination pattern established by Companies, Contacts, Products, and Orders APIs.
- The API client will use the existing authentication mechanism (OAuth 2.0 Client Credentials flow) already implemented in the Pax8Client.
- Subscription cancellation with a billingDate schedules the cancellation for that date rather than immediate termination.
- The subscription history endpoint returns all historical changes without pagination (based on README signature returning `SubscriptionHistory[]` not `Page<SubscriptionHistory>`).
- Update operations are limited to quantity changes; other subscription modifications (product changes, billing term changes) require cancellation and re-ordering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can retrieve the first page of subscriptions (default size) in under 2 seconds at the 95th percentile.
- **SC-002**: 95% of subscription detail lookups return the requested subscription or a not-found response within 2 seconds.
- **SC-003**: 95% of subscription update requests complete within 2 seconds, returning the updated subscription or a validation error.
- **SC-004**: 95% of subscription cancellation requests complete within 2 seconds.
- **SC-005**: Pagination metadata correctly indicates additional pages in 100% of list responses during functional testing.
- **SC-006**: 100% of invalid update requests (invalid quantity, invalid subscription ID) return appropriate validation errors without modifying the subscription.
