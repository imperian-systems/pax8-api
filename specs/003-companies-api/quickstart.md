# Quickstart: Companies API

**Feature**: 003-companies-api  
**Date**: 2025-12-08

## Overview

Adds Companies API methods to the Pax8 client: list, search, and detail retrieval with page-based pagination (default size 10, max 200) and consistent typed responses.

## Basic Usage

### 1) List companies (page-based)

```typescript
import { Pax8Client } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

const { content, page } = await client.companies.list({
  page: 0,
  size: 25,
  status: 'Active',
  country: 'US',
  sort: 'name,desc'
});

if (page.number + 1 < page.totalPages) {
  const next = await client.companies.list({ page: page.number + 1, size: page.size });
  // iterate...
}
```

### 2) Get a company by ID

```typescript
const company = await client.companies.get('comp-12345');
console.log(company.name, company.status);
```

### 3) Search companies by name/domain

```typescript
const results = await client.companies.search({
  query: 'acme',
  page: 0,
  size: 25
});

for (const company of results.content) {
  console.log(company.name, company.status);
}
```

## Error Handling

```typescript
import { Pax8Error } from '@imperian-systems/pax8-api';

try {
  await client.companies.get('unknown');
} catch (error) {
  if (error instanceof Pax8Error) {
    console.error(error.code, error.message);
  } else if (error instanceof Error) {
    console.error('Error:', error.message);
  }
}
```

## Standalone Functions

The Companies API methods are also available as standalone functions if you prefer:

```typescript
import { Pax8Client, listCompanies, getCompany, searchCompanies } from '@imperian-systems/pax8-api';

const client = new Pax8Client({ clientId, clientSecret });

// Using standalone functions
const result = await listCompanies(client, { page: 0, size: 25 });
const company = await getCompany(client, 'comp-123');
const searchResults = await searchCompanies(client, { query: 'acme', size: 25 });
```

## Files Created

```
src/
├── api/
│   ├── companies.ts            # CompaniesApi class and standalone functions
│   └── index.ts                # API exports aggregator
├── models/companies.ts         # Company types, validation, and runtime guards
└── index.ts                    # Public API exports

tests/
├── contract/api/companies-contract.test.ts  # OpenAPI contract validation tests
└── integration/api/companies-flow.test.ts   # End-to-end integration tests
```

## Dependencies

**Runtime**: None (native fetch)  
**Dev**: TypeScript 5.x, Vitest  
**Platform**: Node.js 22+
