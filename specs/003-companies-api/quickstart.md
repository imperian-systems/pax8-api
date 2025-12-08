# Quickstart: Companies API

**Feature**: 003-companies-api  
**Date**: 2025-12-08

## Overview

Adds Companies API methods to the Pax8 client: list, search, and detail retrieval with cursor-based pagination (default 50, max 100) and consistent typed responses.

## Basic Usage

### 1) List companies (cursor-based)

```typescript
import { Pax8Client } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

const { items, page } = await client.listCompanies({
  limit: 50,
  status: 'active',
  updatedSince: '2025-11-01T00:00:00Z'
});

if (page.nextPageToken) {
  const next = await client.listCompanies({ pageToken: page.nextPageToken });
  // iterate...
}
```

### 2) Get a company by ID

```typescript
const company = await client.getCompany('cmp_12345');
console.log(company.displayName, company.primaryDomains);
```

### 3) Search companies by name/domain

```typescript
const results = await client.searchCompanies({
  query: 'acme',
  limit: 25
});

for (const company of results.items) {
  console.log(company.displayName, company.status);
}
```

## Error Handling

```typescript
import { Pax8Error } from '@imperian-systems/pax8-api';

try {
  await client.getCompany('unknown');
} catch (error) {
  if (error instanceof Pax8Error) {
    console.error(error.code, error.message);
  }
}
```

## Pagination Helpers

An iterator helper will allow seamless traversal:

```typescript
for await (const company of client.iterateCompanies({ limit: 50 })) {
  // process companies until exhaustion
}
```

## Files Created (planned)

```
src/
├── api/companies.ts            # Companies API client methods
├── models/companies.ts         # Company types and guards
├── pagination/cursor.ts        # Cursor helpers for iteration
└── index.ts                    # Export new methods/types

tests/
├── unit/api/companies.test.ts
├── unit/models/companies.test.ts
├── unit/pagination/cursor.test.ts
├── contract/api/companies-contract.test.ts
└── integration/api/companies-flow.test.ts
```

## Dependencies

**Runtime**: None (native fetch)  
**Dev**: TypeScript 5.x, Vitest  
**Platform**: Node.js 22+
