# @imperian-systems/pax8-api

[![npm version](https://img.shields.io/npm/v/@imperian-systems/pax8-api.svg)](https://www.npmjs.com/package/@imperian-systems/pax8-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Build Status](https://github.com/imperian-systems/pax8-api/actions/workflows/ci.yml/badge.svg)](https://github.com/imperian-systems/pax8-api/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

A TypeScript client library for the Pax8 API with full type safety, automatic token management, and zero runtime dependencies.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [API Reference](#api-reference)
  - [Companies](#companies)
  - [Contacts](#contacts)
  - [Products](#products)
  - [Orders](#orders)
  - [Subscriptions](#subscriptions)
  - [Invoices](#invoices)
  - [Usage Summaries](#usage-summaries)
  - [Quotes](#quotes)
  - [Webhooks](#webhooks)
- [Pagination](#pagination)
- [Error Handling](#error-handling)
- [TypeScript](#typescript)
- [Rate Limiting](#rate-limiting)
- [Links](#links)
- [License](#license)

## Requirements

**Node.js 22 or higher is required.** This package uses native `fetch` API available in Node.js 22+ and has zero runtime dependencies.

## Installation

Install the package using your preferred package manager:

```bash
# npm
npm install @imperian-systems/pax8-api

# yarn
yarn add @imperian-systems/pax8-api

# pnpm
pnpm add @imperian-systems/pax8-api
```

## Quick Start

Get started with your first API call in minutes:

```typescript
import { Pax8Client } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// List companies with cursor-based pagination
const result = await client.companies.list({ limit: 50, status: 'active' });
console.log(result.items);          // Company[]
console.log(result.page.nextPageToken); // Cursor for next page

// Get a specific company
const company = await client.companies.get('comp-123');
console.log(company.displayName);
```

## Configuration

The `Pax8Client` constructor accepts a configuration object with the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `clientId` | `string` | **required** | OAuth client ID from Pax8 Integrations Hub |
| `clientSecret` | `string` | **required** | OAuth client secret from Pax8 Integrations Hub |
| `baseUrl` | `string` | `https://api.pax8.com/v1` | API base URL |
| `tokenUrl` | `string` | `https://token-manager.pax8.com/oauth/token` | OAuth token endpoint |
| `audience` | `string` | `https://api.pax8.com` | OAuth audience |
| `retryAttempts` | `number` | `3` | Maximum number of retry attempts for failed requests |
| `retryDelay` | `number` | `1000` | Initial retry delay in milliseconds (uses exponential backoff) |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |
| `autoRefresh` | `boolean` | `true` | Automatically refresh tokens before expiry |

### Example with Custom Configuration

```typescript
const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  retryAttempts: 5,
  retryDelay: 2000,
  timeout: 60000
});
```

## Authentication

This package uses **OAuth 2.0 Client Credentials flow** for authentication with the Pax8 API.

### Getting Your Credentials

1. Log in to the [Pax8 Integrations Hub](https://app.pax8.com/integrations)
2. Navigate to your application or create a new one
3. Copy your **Client ID** and **Client Secret**
4. Pass these credentials directly to the `Pax8Client` constructor

### How It Works

- The client automatically obtains an access token when you make your first API call
- Tokens are valid for **24 hours** (86400 seconds)
- With `autoRefresh: true` (default), tokens are automatically refreshed before expiry
- You don't need to manually manage token acquisition or refresh

### Manual Token Management

If you need more control over token management:

```typescript
const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  autoRefresh: false  // Disable automatic refresh
});

// Manually refresh token when needed
await client.refreshToken();
```

## API Reference

This section documents all available API resources and their methods.

### Companies

Manage customer organizations served through Pax8. This API uses **cursor-based pagination** with opaque tokens (default limit: 50, max: 100).

```typescript
// List companies with cursor pagination
const result = await client.companies.list({
  limit: 50,              // Optional: page size (default 50, max 100)
  pageToken: undefined,   // Optional: cursor token for next/previous page
  status: 'active',       // Optional: filter by status
  region: 'US',           // Optional: filter by region
  updatedSince: '2024-01-01T00:00:00Z', // Optional: filter by update timestamp
  sort: 'name'            // Optional: 'name' or 'updatedAt' (default: 'name')
});

console.log(result.items);          // Company[]
console.log(result.page.limit);     // 50
console.log(result.page.nextPageToken); // Use for next page
console.log(result.page.hasMore);   // true if more pages available

// Paginate through results
let pageToken = result.page.nextPageToken;
while (pageToken) {
  const nextPage = await client.companies.list({ pageToken });
  console.log(nextPage.items);
  pageToken = nextPage.page.nextPageToken;
}

// Get a specific company by ID
const company = await client.companies.get('comp-123');
console.log(company.companyId);
console.log(company.legalName);
console.log(company.displayName);
console.log(company.status);         // 'active' | 'inactive' | 'prospect' | 'suspended'
console.log(company.primaryDomains); // string[] | undefined
console.log(company.primaryContact); // { name?: string; email?: string } | undefined
console.log(company.region);         // string | undefined

// Search companies by name or domain
const searchResults = await client.companies.search({
  query: 'acme',         // Required: 2-256 characters
  limit: 25,             // Optional: page size
  pageToken: undefined   // Optional: cursor token
});

for (const company of searchResults.items) {
  console.log(`${company.displayName} - ${company.status}`);
}
```

#### Types

```typescript
interface ListCompaniesParams {
  limit?: number;              // 1-100, default 50
  pageToken?: string;          // Opaque cursor token
  status?: 'active' | 'inactive' | 'prospect' | 'suspended';
  region?: string;             // Market/geo code
  updatedSince?: string;       // ISO 8601 timestamp
  sort?: 'name' | 'updatedAt'; // Default: 'name'
}

interface SearchCompaniesParams {
  query: string;          // 2-256 characters
  limit?: number;         // 1-100, default 50
  pageToken?: string;     // Opaque cursor token
}

interface Company {
  companyId: string;
  legalName: string;
  displayName: string;
  status: 'active' | 'inactive' | 'prospect' | 'suspended';
  primaryDomains?: string[];
  primaryContact?: {
    name?: string;
    email?: string;
  };
  region?: string;
  externalReferences?: Array<{
    system: string;
    id: string;
  }>;
  tags?: string[];
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
}

interface CompanyListResponse {
  items: Company[];
  page: {
    nextPageToken?: string;
    prevPageToken?: string;
    limit: number;
    hasMore?: boolean;
  };
}
```

### Contacts

Manage people associated with companies. This API uses **page-based pagination** (default size: 10, max: 200).

```typescript
// List contacts for a company with page-based pagination
const result = await client.contacts.list({
  companyId: 'comp-123',
  page: 0,              // Optional: page number (default 0)
  size: 50              // Optional: page size (default 10, max 200)
});

console.log(result.content);           // Contact[]
console.log(result.page.size);         // 50
console.log(result.page.totalElements); // Total contacts
console.log(result.page.totalPages);   // Total pages
console.log(result.page.number);       // Current page (0-indexed)

// Paginate through all contacts
let currentPage = 0;
const allContacts: Contact[] = [];

while (currentPage < result.page.totalPages) {
  const page = await client.contacts.list({
    companyId: 'comp-123',
    page: currentPage,
    size: 100
  });
  
  allContacts.push(...page.content);
  currentPage++;
}

// Get a specific contact by ID
const contact = await client.contacts.get('comp-123', 'contact-456');
console.log(contact.firstName, contact.lastName);
console.log(contact.email, contact.phone);

// Check contact types (Admin, Billing, Technical)
for (const type of contact.types ?? []) {
  console.log(`${type.type}: primary=${type.primary}`);
}

// Create a new contact
const newContact = await client.contacts.create('comp-123', {
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

// Update an existing contact (partial update)
const updated = await client.contacts.update('comp-123', 'contact-456', {
  phone: '+1-555-9999',
  types: [
    { type: 'Admin', primary: true },
    { type: 'Technical', primary: true }
  ]
});

// Delete a contact
await client.contacts.delete('comp-123', 'contact-456');
console.log('Contact deleted');
```

#### Types

```typescript
interface ListContactsParams {
  companyId: string;        // Required: company to list contacts for
  page?: number;            // Optional: 0-indexed page number (default 0)
  size?: number;            // Optional: page size (default 10, max 200)
}

interface CreateContactRequest {
  firstName: string;        // Required
  lastName: string;         // Required
  email: string;            // Required: valid email format
  phone?: string;           // Optional
  types?: ContactType[];    // Optional: contact type assignments
}

interface UpdateContactRequest {
  firstName?: string;       // Optional: all fields are optional for partial updates
  lastName?: string;
  email?: string;           // Must be valid email format if provided
  phone?: string;
  types?: ContactType[];    // Replaces entire types array if provided
}

interface ContactType {
  type: 'Admin' | 'Billing' | 'Technical';
  primary: boolean;         // Whether this is primary contact for this type
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  types?: ContactType[];
  createdDate: string;      // ISO 8601
}

interface ContactListResponse {
  content: Contact[];
  page: {
    size: number;           // Page size used
    totalElements: number;  // Total contacts across all pages
    totalPages: number;     // Total pages
    number: number;         // Current page (0-indexed)
  };
}
```

#### Contact Type System

Contacts support a type-based primary system for Admin, Billing, and Technical roles:

- A contact can have multiple types (e.g., both Admin and Billing)
- Each type can be marked as primary or non-primary
- A contact can be primary for multiple types simultaneously
- When setting a contact as primary for a type, the previous primary for that type is automatically demoted

```typescript
// Create a contact that is primary for both Admin and Billing
const contact = await client.contacts.create('comp-123', {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane@example.com',
  types: [
    { type: 'Admin', primary: true },
    { type: 'Billing', primary: true },
    { type: 'Technical', primary: false }
  ]
});

// Setting another contact as primary Admin will auto-demote Jane's Admin primary status
const newAdmin = await client.contacts.create('comp-123', {
  firstName: 'Bob',
  lastName: 'Johnson',
  email: 'bob@example.com',
  types: [{ type: 'Admin', primary: true }]
});
// Jane is still primary for Billing, but Bob is now primary for Admin
```

### Products

Access the Pax8 product catalog.

```typescript
// List products with optional filters
client.products.list(options?: ListProductsOptions): Promise<Page<Product>>

// Get a specific product by ID
client.products.get(id: string): Promise<Product>

// Get provisioning details for a product
client.products.getProvisioningDetails(id: string): Promise<ProvisioningDetails>

// Get product dependencies
client.products.getDependencies(id: string): Promise<ProductDependency[]>

// Get pricing information for a product
client.products.getPricing(id: string, options?: PricingOptions): Promise<Pricing>
```

#### List Options

```typescript
interface ListProductsOptions {
  page?: number;
  size?: number;
  sort?: string;
  vendorName?: string;     // Filter by vendor
  availability?: string;   // Filter by availability status
}
```

#### Example

```typescript
// List Microsoft products
const products = await client.products.list({ 
  vendorName: 'Microsoft',
  size: 100
});

// Get product details
const product = await client.products.get('product-id');
console.log(`${product.name} - ${product.vendorName}`);

// Get pricing for a product
const pricing = await client.products.getPricing('product-id', {
  companyId: 'company-id'
});
```

### Orders

Manage product purchase records.

```typescript
// List orders with optional filters
client.orders.list(options?: ListOrdersOptions): Promise<Page<Order>>

// Get a specific order by ID
client.orders.get(id: string): Promise<Order>

// Create a new order
client.orders.create(data: CreateOrderRequest): Promise<Order>
```

#### Example

```typescript
// List recent orders
const orders = await client.orders.list({ 
  page: 0,
  size: 20,
  sort: 'createdDate,desc'
});

// Create a new order
const order = await client.orders.create({
  companyId: 'company-id',
  lineItems: [
    {
      productId: 'product-id',
      quantity: 5
    }
  ]
});
```

### Subscriptions

Manage active service agreements.

```typescript
// List subscriptions with optional filters
client.subscriptions.list(options?: ListSubscriptionsOptions): Promise<Page<Subscription>>

// Get a specific subscription by ID
client.subscriptions.get(id: string): Promise<Subscription>

// Update a subscription
client.subscriptions.update(id: string, data: UpdateSubscriptionRequest): Promise<Subscription>

// Cancel a subscription
client.subscriptions.cancel(id: string, options?: CancelOptions): Promise<void>

// Get subscription history
client.subscriptions.getHistory(id: string): Promise<SubscriptionHistory[]>
```

#### List Options

```typescript
interface ListSubscriptionsOptions {
  page?: number;
  size?: number;
  sort?: string;
  companyId?: string;      // Filter by company
  productId?: string;      // Filter by product
  status?: SubscriptionStatus; // Filter by status
}

type SubscriptionStatus = 
  | 'Active' 
  | 'Cancelled' 
  | 'PendingManual' 
  | 'PendingAutomated'
  | 'PendingCancel'
  | 'WaitingForDetails'
  | 'Trial'
  | 'Converted'
  | 'PendingActivation'
  | 'Activated';
```

#### Example

```typescript
// List active subscriptions for a company
const subscriptions = await client.subscriptions.list({ 
  companyId: 'company-id',
  status: 'Active',
  size: 50
});

// Update subscription quantity
const updated = await client.subscriptions.update('subscription-id', {
  quantity: 10
});

// Cancel a subscription
await client.subscriptions.cancel('subscription-id', {
  billingDate: '2025-12-31'
});
```

### Invoices

Access billing records.

```typescript
// List invoices with optional filters
client.invoices.list(options?: ListInvoicesOptions): Promise<Page<Invoice>>

// Get a specific invoice by ID
client.invoices.get(id: string): Promise<Invoice>

// List invoice line items
client.invoices.listItems(id: string, options?: ListItemsOptions): Promise<Page<InvoiceItem>>

// List draft invoice items
client.invoices.listDraftItems(companyId: string, options?: ListItemsOptions): Promise<Page<InvoiceItem>>
```

#### Example

```typescript
// List invoices for a company
const invoices = await client.invoices.list({ 
  companyId: 'company-id',
  size: 20
});

// Get invoice details
const invoice = await client.invoices.get('invoice-id');

// Get invoice line items
const items = await client.invoices.listItems('invoice-id', {
  page: 0,
  size: 100
});
```

### Usage Summaries

Access usage-based billing data.

```typescript
// List usage summaries with optional filters
client.usageSummaries.list(options?: ListUsageSummariesOptions): Promise<Page<UsageSummary>>

// Get a specific usage summary by ID
client.usageSummaries.get(id: string): Promise<UsageSummary>

// List usage summary lines
client.usageSummaries.listLines(id: string, options?: ListLinesOptions): Promise<Page<UsageLine>>
```

#### Example

```typescript
// List usage summaries for a date range
const summaries = await client.usageSummaries.list({ 
  startDate: '2025-01-01',
  endDate: '2025-01-31',
  companyId: 'company-id'
});

// Get detailed usage lines
const lines = await client.usageSummaries.listLines('summary-id', {
  size: 200
});
```

### Quotes

Manage quote creation and processing.

```typescript
// List quotes with optional filters
client.quotes.list(options?: ListQuotesOptions): Promise<Page<Quote>>

// Get a specific quote by ID
client.quotes.get(id: string): Promise<Quote>

// Create a new quote
client.quotes.create(data: CreateQuoteRequest): Promise<Quote>

// Update a quote
client.quotes.update(id: string, data: UpdateQuoteRequest): Promise<Quote>
```

#### Example

```typescript
// Create a quote
const quote = await client.quotes.create({
  companyId: 'company-id',
  lineItems: [
    {
      productId: 'product-id',
      quantity: 10
    }
  ],
  validUntil: '2025-12-31'
});

// List quotes for a company
const quotes = await client.quotes.list({ 
  companyId: 'company-id'
});
```

### Webhooks

Manage event notification subscriptions.

```typescript
// List webhook subscriptions
client.webhooks.list(options?: ListWebhooksOptions): Promise<Page<Webhook>>

// Get a specific webhook by ID
client.webhooks.get(id: string): Promise<Webhook>

// Create a webhook subscription
client.webhooks.create(data: CreateWebhookRequest): Promise<Webhook>

// Update a webhook subscription
client.webhooks.update(id: string, data: UpdateWebhookRequest): Promise<Webhook>

// Delete a webhook subscription
client.webhooks.delete(id: string): Promise<void>

// Test a webhook
client.webhooks.test(id: string): Promise<void>
```

#### Available Event Types

- `company.created`
- `company.updated`
- `order.created`
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`
- `invoice.created`
- `invoice.paid`

#### Example

```typescript
// Create a webhook for order events
const webhook = await client.webhooks.create({
  url: 'https://your-app.example.com/webhooks/pax8',
  events: ['order.created', 'subscription.created'],
  secret: 'your-webhook-secret'
});

// Test webhook delivery
await client.webhooks.test(webhook.id);

// List all webhooks
const webhooks = await client.webhooks.list();
```

## Pagination

The Companies API uses **cursor-based pagination** with opaque tokens. Other Pax8 APIs may use page-based pagination. This section covers both patterns.

### Cursor-Based Pagination (Companies API)

The Companies API uses cursor-based pagination for stable iteration through large result sets:

```typescript
import { listCompanies, searchCompanies } from '@imperian-systems/pax8-api';

// List companies with cursor pagination
const firstPage = await client.companies.list({ 
  limit: 50,           // Default 50, max 100
  status: 'active' 
});

console.log(firstPage.items);              // Company[]
console.log(firstPage.page.limit);         // 50
console.log(firstPage.page.nextPageToken); // Opaque cursor token
console.log(firstPage.page.hasMore);       // true if more results

// Get next page using cursor token
if (firstPage.page.nextPageToken) {
  const secondPage = await client.companies.list({
    pageToken: firstPage.page.nextPageToken,
    limit: 50
  });
}

// Iterate through all pages
let allCompanies: Company[] = [];
let pageToken: string | undefined;

do {
  const page = await client.companies.list({ 
    limit: 100,
    pageToken,
    status: 'active'
  });
  
  allCompanies.push(...page.items);
  pageToken = page.page.nextPageToken;
} while (pageToken);

console.log(`Total companies: ${allCompanies.length}`);
```

### Page-Based Pagination (Other APIs)

Other Pax8 APIs may use traditional page-based pagination:

```typescript
// Note: This is an example for other APIs that may be added in the future
// The Companies API uses cursor-based pagination shown above
const page1 = await client.companies.list({ page: 0, size: 50 });
console.log(`Page 1: ${page1.content.length} companies`);
console.log(`Total: ${page1.page.totalElements} companies across ${page1.page.totalPages} pages`);

// Get second page
const page2 = await client.companies.list({ page: 1, size: 50 });
console.log(`Page 2: ${page2.content.length} companies`);

// Manually iterate through all pages
let currentPage = 0;
let hasMore = true;

while (hasMore) {
  const page = await client.companies.list({ page: currentPage, size: 100 });
  
  for (const company of page.content) {
    console.log(company.name);
  }
  
  currentPage++;
  hasMore = currentPage < page.page.totalPages;
}
```

### Async Iterator Pattern

Use the async iterator for automatic pagination (recommended for large collections):

```typescript
// Iterate through all companies automatically
for await (const company of client.companies.listAll()) {
  console.log(company.name);
}

// With filtering
for await (const company of client.companies.listAll({ stateOrProvince: 'CA' })) {
  console.log(`${company.name} (California)`);
}

// Process in batches
const companies: Company[] = [];
for await (const company of client.companies.listAll({ size: 100 })) {
  companies.push(company);
  
  // Process batch every 100 items
  if (companies.length >= 100) {
    await processBatch(companies);
    companies.length = 0; // Clear array
  }
}

// Process remaining items
if (companies.length > 0) {
  await processBatch(companies);
}
```

### Pagination Tips

- **Companies API**: Uses cursor-based pagination (default limit 50, max 100)
  - Use `nextPageToken` to navigate forward
  - Use `prevPageToken` when available to navigate backward
  - Check `hasMore` flag to determine if more results exist
- **Other APIs**: May use page-based pagination (default page size 10, max 200)
- For bulk operations, use larger page sizes (e.g., `100`) to minimize API calls
- The async iterator automatically handles rate limiting and retries
- Use `sort` parameter to ensure consistent ordering across pages

## Error Handling

The package provides typed error classes for precise error handling. All errors extend the base `Pax8Error` class.

### Error Class Hierarchy

```typescript
// Base error class
class Pax8Error extends Error {
  readonly status: number;      // HTTP status code
  readonly type: string;        // Error type from API
  readonly instance: string;    // Request path
  readonly details?: ErrorDetail[]; // Additional error details
}

// Specific error types
class Pax8AuthenticationError extends Pax8Error {
  // status: 401
  // Thrown when credentials are invalid or token is expired
}

class Pax8ForbiddenError extends Pax8Error {
  // status: 403
  // Thrown when you don't have permission to access a resource
}

class Pax8NotFoundError extends Pax8Error {
  // status: 404
  // Thrown when a resource doesn't exist
}

class Pax8ValidationError extends Pax8Error {
  // status: 422
  // Thrown when request data fails validation
  readonly fieldErrors: FieldError[];
}

class Pax8RateLimitError extends Pax8Error {
  // status: 429
  // Thrown when rate limit is exceeded
  readonly retryAfter: number;  // Seconds until retry allowed
}

class Pax8TimeoutError extends Pax8Error {
  // status: 408
  // Thrown when request exceeds timeout
}

class Pax8ServerError extends Pax8Error {
  // status: 500+
  // Thrown when API encounters a server error
}
```

### Error Handling Examples

#### Handle Specific Error Types

```typescript
import { 
  Pax8NotFoundError,
  Pax8ValidationError,
  Pax8RateLimitError,
  Pax8AuthenticationError
} from '@imperian-systems/pax8-api';

try {
  const company = await client.companies.get('invalid-id');
} catch (error) {
  if (error instanceof Pax8NotFoundError) {
    console.log('Company not found');
  } else if (error instanceof Pax8AuthenticationError) {
    console.log('Authentication failed - check your credentials');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

#### Handle Validation Errors

```typescript
try {
  const company = await client.companies.create({
    name: '',  // Invalid: empty name
    address: { /* incomplete address */ }
  });
} catch (error) {
  if (error instanceof Pax8ValidationError) {
    console.log('Validation failed:');
    for (const fieldError of error.fieldErrors) {
      console.log(`  - ${fieldError.field}: ${fieldError.message}`);
    }
  }
}
```

#### Handle Rate Limiting

```typescript
try {
  const companies = await client.companies.list({ size: 200 });
} catch (error) {
  if (error instanceof Pax8RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter} seconds`);
    
    // Wait and retry
    await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
    const companies = await client.companies.list({ size: 200 });
  }
}
```

#### Catch All Pax8 Errors

```typescript
import { Pax8Error } from '@imperian-systems/pax8-api';

try {
  await client.companies.get('company-id');
} catch (error) {
  if (error instanceof Pax8Error) {
    console.log(`Pax8 API error [${error.status}]: ${error.message}`);
    console.log(`Request: ${error.instance}`);
    
    if (error.details) {
      console.log('Details:', error.details);
    }
  } else {
    // Network error or other non-API error
    console.error('Unexpected error:', error);
  }
}
```

### Automatic Retries

The client automatically retries failed requests (configurable via `retryAttempts`):

- **Retried**: Network errors, timeouts, 5xx server errors, rate limit errors (with backoff)
- **Not retried**: 4xx client errors (except 429 rate limit)

## TypeScript

This package is written in TypeScript and provides full type definitions out of the box.

### Type Imports

Import types for use in your application:

```typescript
import type { 
  Company,
  Contact,
  ContactType,
  ContactTypeEnum,
  CreateContactRequest,
  UpdateContactRequest,
  ListContactsParams,
  Product,
  Order,
  Subscription,
  Invoice,
  UsageSummary,
  Quote,
  Webhook,
  Page
} from '@imperian-systems/pax8-api';

// Use types for function parameters and return types
async function getCompanyOrders(companyId: string): Promise<Order[]> {
  const page = await client.orders.list({ companyId, size: 100 });
  return page.content;
}

// Type-safe contact filtering
async function getPrimaryAdminContact(companyId: string): Promise<Contact | undefined> {
  const { content } = await client.contacts.list({ companyId, size: 200 });
  return content.find(c => 
    c.types?.some(t => t.type === 'Admin' && t.primary)
  );
}

// Type-safe filtering
function filterActiveSubscriptions(subscriptions: Subscription[]): Subscription[] {
  return subscriptions.filter(sub => sub.status === 'Active');
}
```

### Generic Types

The pagination `Page<T>` type is generic:

```typescript
import type { Page, Company } from '@imperian-systems/pax8-api';

async function getAllCompanies(): Promise<Page<Company>> {
  return await client.companies.list({ size: 200 });
}
```

### Type-Safe Enums

Status and state fields use TypeScript union types:

```typescript
import type { SubscriptionStatus, BillingTerm } from '@imperian-systems/pax8-api';

const status: SubscriptionStatus = 'Active';
const term: BillingTerm = 'Monthly';

// TypeScript will catch invalid values at compile time
// const invalid: SubscriptionStatus = 'InvalidStatus'; // ❌ Error
```

### IntelliSense & Autocomplete

TypeScript provides autocomplete for all methods and properties:

```typescript
const client = new Pax8Client({ /* config */ });

// Type "client." to see all available resources
client.companies    // ✓
client.products     // ✓
client.subscriptions // ✓

// Type "client.companies." to see all available methods
client.companies.list    // ✓
client.companies.get     // ✓
client.companies.create  // ✓
```

## Rate Limiting

The Pax8 API enforces rate limits to ensure fair usage:

- **Limit**: 1000 requests per minute per application
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Total requests allowed per window
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

### Automatic Handling

This package automatically handles rate limiting:

1. **Respects `Retry-After` header**: When rate limited (429 error), the client waits for the duration specified in the `Retry-After` header before retrying
2. **Exponential backoff**: For other retryable errors, uses exponential backoff
3. **Configurable retries**: Set `retryAttempts` in client configuration

### Best Practices

To avoid rate limiting:

```typescript
// ✅ Good: Use large page sizes to minimize requests
const companies = await client.companies.list({ size: 200 });

// ✅ Good: Use async iterator for automatic pagination
for await (const company of client.companies.listAll({ size: 100 })) {
  await processCompany(company);
}

// ⚠️ Caution: Making many requests in quick succession
// Consider adding delays between requests
for (const id of companyIds) {
  await client.companies.get(id);
  await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
}

// ✅ Good: Batch operations when possible
const companyIds = ['id1', 'id2', 'id3', /* ... */];
const results = await Promise.all(
  companyIds.map(id => client.companies.get(id))
);
```

### Monitoring Rate Limits

You can monitor rate limit status by catching `Pax8RateLimitError`:

```typescript
import { Pax8RateLimitError } from '@imperian-systems/pax8-api';

try {
  await client.companies.list();
} catch (error) {
  if (error instanceof Pax8RateLimitError) {
    console.warn(`Rate limited! Retry after ${error.retryAfter} seconds`);
    // Implement backoff strategy
  }
}
```

## Links

- **[Pax8 API Documentation](https://devx.pax8.com)** - Official API reference and guides
- **[Pax8 Integrations Hub](https://app.pax8.com/integrations)** - Get your API credentials
- **[Pax8 Status Page](https://status.pax8.com)** - API status and incident reports
- **[npm Package](https://www.npmjs.com/package/@imperian-systems/pax8-api)** - Package on npm registry
- **[GitHub Repository](https://github.com/imperian-systems/pax8-api)** - Source code and issue tracker

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
