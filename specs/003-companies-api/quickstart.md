# Quickstart: Companies API

**Feature**: 003-companies-api  
**Date**: 2025-12-08

## Overview

Adds Companies API methods to the Pax8 client: list, search, and detail retrieval with cursor-based pagination (default 50, max 100) and consistent typed responses.

## Basic Usage

### 1) List companies (cursor-based)

```typescript
import { Pax8Client, listCompanies } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

const { items, page } = await listCompanies(client, {
  limit: 50,
  status: 'active',
  updatedSince: '2025-11-01T00:00:00Z'
});

if (page.nextPageToken) {
  const next = await listCompanies(client, { pageToken: page.nextPageToken });
  // iterate...
}
```

### 2) Get a company by ID

```typescript
import { getCompany } from '@imperian-systems/pax8-api';

const company = await getCompany(client, 'comp-12345');
console.log(company.displayName, company.primaryDomains);
```

### 3) Search companies by name/domain

```typescript
import { searchCompanies } from '@imperian-systems/pax8-api';

const results = await searchCompanies(client, {
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
  await getCompany(client, 'unknown');
} catch (error) {
  if (error instanceof Pax8Error) {
    console.error(error.code, error.message);
  } else if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

## Pagination Helpers

Use cursor-based pagination to traverse large result sets:

```typescript
import { listCompanies, hasMorePages } from '@imperian-systems/pax8-api';

// Manual pagination
let pageToken: string | undefined;
const allCompanies: Company[] = [];

do {
  const result = await listCompanies(client, { 
    limit: 50,
    pageToken 
  });
  
  allCompanies.push(...result.items);
  pageToken = result.page.nextPageToken;
} while (pageToken);

// Check if more pages exist
const result = await listCompanies(client);
if (hasMorePages(result.page)) {
  console.log('More pages available');
}
```

## Files Created

```
src/
├── api/
│   ├── companies.ts            # Companies API client methods (listCompanies, getCompany, searchCompanies)
│   └── index.ts                # API exports aggregator
├── models/companies.ts         # Company types, validation, and runtime guards
├── pagination/cursor.ts        # Cursor helpers for pagination
└── index.ts                    # Public API exports

tests/
├── contract/api/companies-contract.test.ts  # OpenAPI contract validation tests
└── integration/api/companies-flow.test.ts   # End-to-end integration tests
```

## Dependencies

**Runtime**: None (native fetch)  
**Dev**: TypeScript 5.x, Vitest  
**Platform**: Node.js 22+
