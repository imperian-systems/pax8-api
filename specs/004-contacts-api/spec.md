# Feature Specification: Contacts API

**Feature Branch**: `004-contacts-api`  
**Created**: December 8, 2025  
**Status**: Draft  
**Input**: User description: "Implement the contacts API according to the examples from README.md"

## Clarifications

### Session 2025-12-08
- Q: When setting primaryContact to true and another contact is already primary, what should happen? → A: Auto-demote previous primary (set old to false, new to true).
- Q: Should email addresses be unique within a company? → A: Allow duplicates (no email uniqueness constraint per company).
- Q: When caller requests contacts for a companyId they don't have access to, what should the API return? → A: Return 404 Company not found (matches Pax8 API behavior).
- Q: Should we model contacts with Pax8's type-based primary flags or a simpler single boolean? → A: Match Pax8's model with `types[]` array containing `{type, primary}` per contact type (Admin, Billing, Technical).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - List contacts for a company (Priority: P1)

Partner/integrator retrieves a paginated list of contacts associated with a specific company to display in their CRM or support dashboard.

**Why this priority**: Listing contacts is the primary operation for integrations that need to sync contact information or display company representatives. Without this capability, no contact management features are possible.

**Independent Test**: Call the contacts list endpoint with a valid companyId filter; verify the response includes contact records with pagination metadata and is usable standalone for syncing contact data.

**Acceptance Scenarios**:

1. **Given** valid authorization and a valid companyId filter, **When** the client requests the contacts list, **Then** the response returns all contacts for that company with default pagination and metadata.
2. **Given** valid authorization and pagination parameters (page, size), **When** the client requests the contacts list, **Then** the response returns the specified page of contacts with correct pagination metadata.
3. **Given** a companyId with no contacts, **When** the client requests the contacts list, **Then** the response returns an empty list with pagination metadata indicating zero results.

---

### User Story 2 - View contact detail (Priority: P2)

Support or operations user fetches a single contact record to view full details including phone number, email, and primary contact status.

**Why this priority**: Detail lookup is essential for support workflows and verifying contact information before reaching out to company representatives.

**Independent Test**: Request a contact by ID and confirm all required fields are present; test also covers the not-found path independently.

**Acceptance Scenarios**:

1. **Given** a valid contact identifier and authorization, **When** the client requests the contact detail, **Then** the response returns the contact with all attributes including firstName, lastName, email, phone, and types array with primary status per type.
2. **Given** an invalid or unknown contact identifier, **When** the client requests the contact detail, **Then** a not-found response is returned with a clear, consistent error payload.

---

### User Story 3 - Create a new contact (Priority: P3)

Integrator creates a new contact record for a company to store representative information obtained from external systems.

**Why this priority**: Contact creation enables bidirectional sync with external CRMs and allows provisioning of company contacts programmatically.

**Independent Test**: Submit a valid contact creation request and verify the response contains the newly created contact with a generated ID and all submitted attributes.

**Acceptance Scenarios**:

1. **Given** valid authorization and a valid contact payload with required fields (firstName, lastName, email), **When** the client creates a contact, **Then** the response returns the created contact with a unique id and all submitted attributes.
2. **Given** valid authorization and a contact payload with optional fields (phone, types), **When** the client creates a contact, **Then** all provided fields are persisted and returned in the response.
3. **Given** a contact payload missing required fields, **When** the client creates a contact, **Then** a validation error response is returned indicating the missing fields.
4. **Given** an invalid email format in the contact payload, **When** the client creates a contact, **Then** a validation error response is returned with a clear message about the invalid email.

---

### User Story 4 - Update an existing contact (Priority: P4)

Integrator updates contact information when details change in their external system or when correcting data entry errors.

**Why this priority**: Contact updates maintain data accuracy and enable ongoing sync between systems.

**Independent Test**: Submit a valid update request for an existing contact and verify the response reflects the updated values.

**Acceptance Scenarios**:

1. **Given** a valid contact identifier and updated field values, **When** the client updates the contact, **Then** the response returns the contact with updated values while preserving unchanged fields.
2. **Given** a partial update payload (only some fields), **When** the client updates the contact, **Then** only the provided fields are updated and other fields remain unchanged.
3. **Given** an invalid or unknown contact identifier, **When** the client updates the contact, **Then** a not-found response is returned.
4. **Given** invalid data in the update payload (e.g., malformed email), **When** the client updates the contact, **Then** a validation error response is returned without modifying the contact.

---

### User Story 5 - Delete a contact (Priority: P5)

Integrator removes a contact record when a representative leaves a company or when cleaning up duplicate records.

**Why this priority**: Contact deletion supports data hygiene and compliance with data retention policies.

**Independent Test**: Submit a delete request for an existing contact and verify the contact is removed; subsequent get requests return not-found.

**Acceptance Scenarios**:

1. **Given** a valid contact identifier and authorization, **When** the client deletes the contact, **Then** the response confirms successful deletion (204 No Content).
2. **Given** an invalid or unknown contact identifier, **When** the client deletes the contact, **Then** a not-found response is returned.
3. **Given** a deleted contact, **When** the client attempts to retrieve it, **Then** a not-found response is returned.

---

### Edge Cases

- What happens when creating a contact for a non-existent companyId? Returns 404 Company not found.
- When setting a contact as primary for a type (Admin/Billing/Technical) and another contact is already primary for that type, the system auto-demotes the previous primary for that specific type.
- What happens when deleting a primary contact for a type? The deletion should succeed; a new primary must be designated separately if required by business rules.
- Duplicate email addresses are allowed within the same company; no uniqueness constraint is enforced.
- When requesting contacts for a company the caller does not have access to (or doesn't exist), the API returns 404 Company not found.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated contacts list endpoint that returns contacts filtered by companyId with page-based pagination (page number and size).
- **FR-002**: System MUST support pagination parameters for listing contacts with a configurable page size (default 10, maximum 200 based on existing patterns).
- **FR-003**: System MUST provide a contact detail endpoint that returns a single contact by ID with all attributes: id, firstName, lastName, email, phone, types array (with type and primary per entry), and createdDate.
- **FR-004**: System MUST provide a contact creation endpoint accepting firstName, lastName, email, and optional phone and types array fields.
- **FR-005**: System MUST validate required fields on contact creation and return field-specific validation errors for missing or malformed data.
- **FR-006**: System MUST provide a contact update endpoint supporting partial updates to firstName, lastName, email, phone, and types fields.
- **FR-007**: System MUST provide a contact deletion endpoint that removes the contact and returns 204 No Content on success.
- **FR-008**: System MUST return consistent error structures for unauthorized (401), forbidden (403), not-found (404), validation errors (422), and rate limiting (429) responses.
- **FR-009**: System MUST validate email format on creation and update operations using standard email validation rules.
- **FR-010**: System MUST associate each contact with exactly one company via companyId; the company must exist at creation time.

### Key Entities

- **Contact**: Represents a person associated with a company. Key attributes include id (unique identifier), firstName, lastName, email, phone (optional), types (array of contact type assignments), and createdDate timestamp. Each type entry contains a type (Admin, Billing, or Technical) and a primary flag indicating if this contact is the primary for that type.
- **ContactType**: Represents a contact's role assignment. Contains type (enum: Admin, Billing, Technical) and primary (boolean). A company must have a primary contact for each contact type; a single contact can be primary for multiple types.
- **ContactListResponse**: Paginated response containing an array of Contact items and pagination metadata (page number, page size, total elements, total pages).

### Assumptions

- The Contacts API follows page-based pagination (like other Pax8 APIs except Companies) with page/size parameters rather than cursor-based pagination.
- Authentication and authorization are handled by the existing token management system; callers must possess valid tokens with appropriate scopes.
- A company must exist before contacts can be created for it; orphan contacts are not permitted.
- Email validation follows standard RFC 5322 simplified rules (contains @ and valid domain portion).
- The primaryContact flag is informational; the system does not enforce having exactly one primary contact per company.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can retrieve a company's contacts (default page size) in under 2 seconds at the 95th percentile.
- **SC-002**: Users can create a new contact and receive the created contact response in under 3 seconds at the 95th percentile.
- **SC-003**: 95% of contact detail lookups return the requested contact or a not-found response within 1 second.
- **SC-004**: Contact CRUD operations maintain data consistency; 100% of created/updated contacts are immediately retrievable with correct data.
- **SC-005**: Validation errors provide field-specific messages for all invalid inputs, enabling users to correct errors without additional support.
