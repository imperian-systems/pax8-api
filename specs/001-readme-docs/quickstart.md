# Quickstart: README Documentation

**Feature**: 001-readme-docs  
**Date**: 2025-12-08  
**Purpose**: Implementation guidance for creating the README.md

## Implementation Overview

Create a single `README.md` file at the repository root that documents the @imperian-systems/pax8-api package.

## README Structure

The README should follow this section order:

```markdown
# @imperian-systems/pax8-api

[Badges]

[One-line description]

## Table of Contents

## Requirements

## Installation

## Quick Start

## Configuration

## Authentication

## API Reference
  ### Companies
  ### Contacts
  ### Products
  ### Orders
  ### Subscriptions
  ### Invoices
  ### Usage Summaries
  ### Quotes
  ### Webhooks

## Pagination

## Error Handling

## TypeScript

## Rate Limiting

## Links

## License
```

## Section Guidelines

### Badges (FR-011)

Include these badges at the top:
- npm version: `[![npm version](https://img.shields.io/npm/v/@imperian-systems/pax8-api.svg)](https://www.npmjs.com/package/@imperian-systems/pax8-api)`
- License: `[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)`
- Build status: `[![Build Status](https://github.com/imperian-systems/pax8-api/actions/workflows/ci.yml/badge.svg)](https://github.com/imperian-systems/pax8-api/actions)`
- TypeScript: `[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)`

### Requirements (FR-012)

Prominently note:
- Node.js 22+ required (native fetch)
- Why: Zero runtime dependencies

### Installation (FR-001)

Show all three package managers:
```bash
# npm
npm install @imperian-systems/pax8-api

# yarn
yarn add @imperian-systems/pax8-api

# pnpm
pnpm add @imperian-systems/pax8-api
```

### Quick Start (FR-002, FR-002a)

Copy-paste example with credentials passed to constructor:
```typescript
import { Pax8Client } from '@imperian-systems/pax8-api';

const client = new Pax8Client({
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// List companies
const companies = await client.companies.list();
console.log(companies.content);
```

### Configuration (FR-003)

Document all options from `Pax8ClientConfig` with defaults:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| clientId | string | required | OAuth client ID from Pax8 |
| clientSecret | string | required | OAuth client secret from Pax8 |
| baseUrl | string | `https://api.pax8.com/v1` | API base URL |
| tokenUrl | string | `https://token-manager.pax8.com/oauth/token` | OAuth token endpoint |
| audience | string | `https://api.pax8.com` | OAuth audience |
| retryAttempts | number | 3 | Max retry attempts |
| retryDelay | number | 1000 | Initial retry delay (ms) |
| timeout | number | 30000 | Request timeout (ms) |
| autoRefresh | boolean | true | Auto-refresh tokens |

### Authentication (FR-005)

Explain:
1. Where to get credentials (Pax8 Integrations Hub)
2. OAuth 2.0 client credentials flow
3. Automatic token management
4. Token expiry (86400 seconds = 24 hours)

### API Reference (FR-004)

For each resource, show method signatures with brief descriptions:

```typescript
// Companies
client.companies.list(options?: ListCompaniesOptions): Promise<Page<Company>>
client.companies.get(id: string): Promise<Company>
client.companies.create(data: CreateCompanyRequest): Promise<Company>
client.companies.update(id: string, data: UpdateCompanyRequest): Promise<Company>
```

### Pagination (FR-006)

Show both patterns:

**Manual pagination:**
```typescript
const page1 = await client.companies.list({ page: 0, size: 50 });
const page2 = await client.companies.list({ page: 1, size: 50 });
```

**Async iterator:**
```typescript
for await (const company of client.companies.listAll()) {
  console.log(company.name);
}
```

### Error Handling (FR-007)

Show error class hierarchy and catch examples:
```typescript
import { 
  Pax8AuthenticationError,
  Pax8RateLimitError,
  Pax8NotFoundError
} from '@imperian-systems/pax8-api';

try {
  await client.companies.get('invalid-id');
} catch (error) {
  if (error instanceof Pax8NotFoundError) {
    console.log('Company not found');
  } else if (error instanceof Pax8RateLimitError) {
    console.log(`Rate limited. Retry after ${error.retryAfter}s`);
  }
}
```

### TypeScript (FR-008)

Show type imports:
```typescript
import type { Company, Product, Subscription } from '@imperian-systems/pax8-api';
```

### Rate Limiting (FR-010)

Document:
- 1000 requests per minute limit
- Built-in respect for Retry-After headers
- Best practices for bulk operations

### Links (FR-009)

Include:
- [Pax8 API Documentation](https://devx.pax8.com)
- [Pax8 Integrations Hub](https://app.pax8.com/integrations)
- [Status Page](https://status.pax8.com)

## Verification Checklist

Before marking complete, verify:

- [ ] All 14 functional requirements addressed (FR-001 through FR-013)
- [ ] All code examples are syntactically valid TypeScript
- [ ] Table of contents links work
- [ ] Credentials shown as constructor parameters
- [ ] Method signatures include return types
- [ ] All 8 resource groups documented
- [ ] Error handling shows all error classes
- [ ] Pagination shows both patterns
- [ ] Node.js 22+ requirement prominent
- [ ] Links are functional

## File Output

Single file: `/README.md` at repository root
