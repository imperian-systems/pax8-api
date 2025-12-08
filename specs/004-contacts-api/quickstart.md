# Quickstart: Contacts API

**Feature**: 004-contacts-api  
**Date**: 2025-12-08

## Overview

Adds Contacts API methods to the Pax8 client: list, get, create, update, and delete operations for company contacts with page-based pagination (default 10, max 200) and typed responses.

Contacts are nested under companies and support a type-based primary contact system (Admin, Billing, Technical).

## Basic Usage

### 1) List contacts for a company

```typescript
import { Pax8Client } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// List contacts with default pagination
const { content, page } = await client.contacts.list({
  companyId: 'comp-12345',
  size: 50
});

console.log(`Found ${page.totalElements} contacts`);
for (const contact of content) {
  console.log(`${contact.firstName} ${contact.lastName} - ${contact.email}`);
}

// Get next page
if (page.number < page.totalPages - 1) {
  const nextPage = await client.contacts.list({
    companyId: 'comp-12345',
    page: page.number + 1,
    size: 50
  });
}
```

### 2) Get a contact by ID

```typescript
const contact = await client.contacts.get('comp-12345', 'contact-67890');
console.log(contact.firstName, contact.lastName);
console.log(contact.email, contact.phone);

// Check contact types
for (const type of contact.types ?? []) {
  console.log(`${type.type}: primary=${type.primary}`);
}
```

### 3) Create a new contact

```typescript
const newContact = await client.contacts.create('comp-12345', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-555-0123',
  types: [
    { type: 'Admin', primary: true },
    { type: 'Billing', primary: false }
  ]
});

console.log(`Created contact: ${newContact.id}`);
```

### 4) Update an existing contact

```typescript
// Partial update - only provided fields are changed
const updated = await client.contacts.update('comp-12345', 'contact-67890', {
  phone: '+1-555-9999',
  types: [
    { type: 'Admin', primary: true },
    { type: 'Technical', primary: true }  // Now primary for both
  ]
});

console.log(`Updated: ${updated.firstName} ${updated.lastName}`);
```

### 5) Delete a contact

```typescript
await client.contacts.delete('comp-12345', 'contact-67890');
console.log('Contact deleted');
```

## Contact Types

Pax8 contacts have a type-based primary system:

```typescript
// Contact type options
type ContactTypeEnum = 'Admin' | 'Billing' | 'Technical';

interface ContactType {
  type: ContactTypeEnum;
  primary: boolean;
}

// A contact can be primary for multiple types
const contact = await client.contacts.create('comp-12345', {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  types: [
    { type: 'Admin', primary: true },
    { type: 'Billing', primary: true },
    { type: 'Technical', primary: false }
  ]
});
```

When setting a contact as primary for a type, any existing primary contact for that type is automatically demoted.

## Error Handling

```typescript
import { 
  Pax8Error, 
  Pax8NotFoundError, 
  Pax8ValidationError 
} from '@imperian-systems/pax8-api';

try {
  await client.contacts.get('comp-12345', 'invalid-id');
} catch (error) {
  if (error instanceof Pax8NotFoundError) {
    console.error('Contact or company not found');
  } else if (error instanceof Pax8ValidationError) {
    console.error('Validation failed:', error.details);
  } else if (error instanceof Pax8Error) {
    console.error(error.code, error.message);
  }
}
```

### Common Error Scenarios

| Scenario | Error Type | Status |
|----------|------------|--------|
| Invalid/expired token | `Pax8AuthenticationError` | 401 |
| Company not found | `Pax8NotFoundError` | 404 |
| Contact not found | `Pax8NotFoundError` | 404 |
| Missing required fields | `Pax8ValidationError` | 422 |
| Invalid email format | `Pax8ValidationError` | 422 |
| Rate limit exceeded | `Pax8RateLimitError` | 429 |

## Pagination Helpers

Iterate through all contacts using page-based pagination:

```typescript
// Manual pagination
const allContacts: Contact[] = [];
let currentPage = 0;
let totalPages = 1;

do {
  const result = await client.contacts.list({
    companyId: 'comp-12345',
    page: currentPage,
    size: 100
  });
  
  allContacts.push(...result.content);
  currentPage++;
  totalPages = result.page.totalPages;
} while (currentPage < totalPages);

console.log(`Fetched ${allContacts.length} total contacts`);
```

## Standalone Functions

The Contacts API methods are also available as standalone functions:

```typescript
import { 
  listContacts, 
  getContact, 
  createContact,
  updateContact,
  deleteContact 
} from '@imperian-systems/pax8-api';

// Use with explicit client
const contacts = await listContacts(client, { companyId: 'comp-12345' });
const contact = await getContact(client, 'comp-12345', 'contact-67890');
```

## Type Imports

Import types for TypeScript usage:

```typescript
import type {
  Contact,
  ContactType,
  ContactTypeEnum,
  CreateContactRequest,
  UpdateContactRequest,
  ContactListResponse,
  ListContactsParams
} from '@imperian-systems/pax8-api';

async function getPrimaryAdminContact(
  client: Pax8Client,
  companyId: string
): Promise<Contact | undefined> {
  const { content } = await client.contacts.list({ companyId, size: 200 });
  
  return content.find(c => 
    c.types?.some(t => t.type === 'Admin' && t.primary)
  );
}
```
