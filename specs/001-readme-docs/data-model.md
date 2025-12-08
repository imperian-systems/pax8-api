# Data Model: README Documentation

**Feature**: 001-readme-docs  
**Date**: 2025-12-08  
**Purpose**: Define entities and structures that will be documented in the README

## Overview

This document defines the public API surface that the README must document. These entities represent the types, classes, and interfaces that developers will interact with.

## Core Entities

### Pax8Client

The main entry point for all API interactions.

```typescript
class Pax8Client {
  constructor(config: Pax8ClientConfig);
  
  // Resource accessors
  readonly companies: CompaniesResource;
  readonly contacts: ContactsResource;
  readonly products: ProductsResource;
  readonly orders: OrdersResource;
  readonly subscriptions: SubscriptionsResource;
  readonly invoices: InvoicesResource;
  readonly usageSummaries: UsageSummariesResource;
  readonly quotes: QuotesResource;
  readonly webhooks: WebhooksResource;
}
```

### Pax8ClientConfig

Configuration options for client initialization.

```typescript
interface Pax8ClientConfig {
  // Required
  clientId: string;
  clientSecret: string;
  
  // Optional with defaults
  baseUrl?: string;           // Default: 'https://api.pax8.com/v1'
  tokenUrl?: string;          // Default: 'https://token-manager.pax8.com/oauth/token'
  audience?: string;          // Default: 'https://api.pax8.com'
  
  // Retry configuration
  retryAttempts?: number;     // Default: 3
  retryDelay?: number;        // Default: 1000 (ms)
  
  // Timeout
  timeout?: number;           // Default: 30000 (ms)
  
  // Auto-refresh tokens
  autoRefresh?: boolean;      // Default: true
}
```

## Resource Patterns

Each resource follows a consistent interface pattern:

### List Method

```typescript
interface ListOptions {
  page?: number;      // Default: 0
  size?: number;      // Default: 10, max: 200
  sort?: string;      // e.g., 'name,desc'
  // Resource-specific filters
}

interface Page<T> {
  content: T[];
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

// Example: companies.list()
list(options?: ListCompaniesOptions): Promise<Page<Company>>;
```

### Get Method

```typescript
// Example: companies.get()
get(id: string): Promise<Company>;
```

### Create Method

```typescript
// Example: companies.create()
create(data: CreateCompanyRequest): Promise<Company>;
```

### Update Method

```typescript
// Example: companies.update()
update(id: string, data: UpdateCompanyRequest): Promise<Company>;
```

### Delete/Cancel Method

```typescript
// Example: subscriptions.cancel()
cancel(id: string, options?: CancelOptions): Promise<void>;
```

## Error Classes

Hierarchy of typed errors for precise error handling:

```typescript
// Base error
class Pax8Error extends Error {
  readonly status: number;
  readonly type: string;
  readonly instance: string;
  readonly details?: ErrorDetail[];
}

// Specific error types
class Pax8AuthenticationError extends Pax8Error {
  // status: 401
}

class Pax8ForbiddenError extends Pax8Error {
  // status: 403
}

class Pax8NotFoundError extends Pax8Error {
  // status: 404
}

class Pax8ValidationError extends Pax8Error {
  // status: 422
  readonly fieldErrors: FieldError[];
}

class Pax8RateLimitError extends Pax8Error {
  // status: 429
  readonly retryAfter: number;  // Seconds until retry allowed
}
```

## Pagination Helpers

Utilities for iterating through paginated collections:

```typescript
// Async iterator for automatic pagination
async function* paginate<T>(
  fetchPage: (page: number) => Promise<Page<T>>
): AsyncGenerator<T>;

// Usage in README example:
for await (const company of client.companies.listAll()) {
  console.log(company.name);
}
```

## Resource-Specific Types

### Companies

```typescript
interface Company {
  id: string;
  name: string;
  address: Address;
  phone: string;
  website: string;
  externalId?: string;
  billOnBehalfOfEnabled: boolean;
  selfServiceAllowed: boolean;
  orderApprovalRequired: boolean;
  status: 'Active' | 'Inactive' | 'Deleted';
  updatedDate: string;
}
```

### Products

```typescript
interface Product {
  id: string;
  name: string;
  vendorName: string;
  shortDescription: string;
  sku: string;
  vendorSku: string;
  requiresCommitment: boolean;
}
```

### Subscriptions

```typescript
interface Subscription {
  id: string;
  companyId: string;
  productId: string;
  quantity: number;
  startDate: string;
  endDate?: string;
  status: SubscriptionStatus;
  price: number;
  currencyCode: string;
  billingTerm: BillingTerm;
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

type BillingTerm = 
  | 'Monthly' 
  | 'Annual' 
  | '2-Year' 
  | '3-Year' 
  | 'One-Time' 
  | 'Trial' 
  | 'Activation';
```

## README Section Mapping

| Entity | README Section |
|--------|---------------|
| Pax8Client | Quick Start, Configuration |
| Pax8ClientConfig | Configuration |
| Resource methods | API Reference |
| Page<T> | Pagination |
| Error classes | Error Handling |
| Async iterator | Pagination |
| All types | TypeScript (imports) |
